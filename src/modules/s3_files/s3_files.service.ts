import { Op } from "sequelize";
import { File } from "../../database/models/file";
import { Folder } from "../../database/models/folder";
import { FolderClosure } from "../../database/models/folder_clousure";
import { s3 } from "../../config/s3";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../../config/app.config";
import { Response } from "express";
import archiver from "archiver";

const getFolders = async (
  module: string,
  parentId?: number | null,
  deleted = false
) => {
  const folders = await Folder.findAll({
    where: {
      module,
      parent_id: parentId ?? null,
      deleted_at: deleted ? { [Op.ne]: null } : null,
    },
    order: [["created_at", "ASC"]],
    paranoid: !deleted,
  });

  return folders;
};

const getFiles = async (
  module: string,
  parentId?: number | null,
  deleted = false
) => {
  const files = await File.findAll({
    where: {
      module,
      folder_id: parentId ?? null,
      deleted_at: deleted ? { [Op.ne]: null } : null,
    },
    order: [["created_at", "ASC"]],
    paranoid: !deleted,
  });

  return files;
};

export class S3FilesService {
  public async getFolders(
    module: string,
    parentId?: number | null,
    deleted = false
  ) {
    const folders = await getFolders(module, parentId, deleted);
    const files = await getFiles(module, parentId, deleted);

    return { folders, files };
  }

  public async createFolder(
    module: string,
    name: string,
    parentId?: number | null
  ) {
    // 1️⃣ Validar parent si existe
    if (parentId) {
      const parentFolder = await Folder.findOne({
        where: {
          id: parentId,
          module,
          deleted_at: null,
        },
      });

      if (!parentFolder) {
        throw new Error("Parent folder not found in this module");
      }
    }

    // 2️⃣ Validar duplicados en el mismo nivel
    const existingFolder = await Folder.findOne({
      where: {
        name,
        module,
        parent_id: parentId ?? null,
        deleted_at: null,
      },
    });

    if (existingFolder) {
      throw new Error("A folder with this name already exists here");
    }

    // 3️⃣ Crear carpeta
    const folder = await Folder.create({
      name,
      module,
      parent_id: parentId ?? null,
    });

    // Closure table
    await FolderClosure.create({
      ancestor_id: folder.id,
      descendant_id: folder.id,
      depth: 0,
    });

    if (parentId) {
      const parentAncestors = await FolderClosure.findAll({
        where: { descendant_id: parentId },
      });
      const closures = parentAncestors.map(pa => ({
        ancestor_id: pa.ancestor_id,
        descendant_id: folder.id,
        depth: pa.depth + 1,
      }));
      await FolderClosure.bulkCreate(closures);
    }

    return;
  }

  public async renameFolder(body: Folder) {
    const { id, name, module } = body;
    // 1️⃣ Buscar la carpeta
    const folder = await Folder.findOne({
      where: {
        id,
        module,
        deleted_at: null,
      },
    });

    if (!folder) {
      throw new Error("Folder not found");
    }

    // 2️⃣ Validar duplicado en el mismo nivel
    const duplicate = await Folder.findOne({
      where: {
        name,
        module,
        parent_id: folder.parent_id,
        deleted_at: null,
      },
    });

    if (duplicate) {
      throw new Error(
        "A folder with this name already exists in this location"
      );
    }

    // 3️⃣ Actualizar nombre
    folder.name = name;
    await folder.save();

    return;
  }

  // ✅ Traer IDs de todos los descendientes
  public async getAllDescendants(folderId: number): Promise<number[]> {
    const rows = await FolderClosure.findAll({
      where: { ancestor_id: folderId },
      attributes: ["descendant_id"],
    });

    return rows.map(r => r.descendant_id);
  }

  // ✅ Borrar carpeta y todo el árbol descendiente (soft delete)
  public async deleteFolder(folderId: number) {
    const now = new Date();
    const descendantIds = await this.getAllDescendants(folderId);

    await File.update(
      { deleted_at: now },
      { where: { folder_id: descendantIds } }
    );
    await Folder.update({ deleted_at: now }, { where: { id: descendantIds } });
  }

  public async buildFolderPath(folderId: number | null): Promise<string> {
    if (!folderId) return "";

    // Traer todos los ancestros del folder ordenados por profundidad
    const ancestors = await FolderClosure.findAll({
      where: { descendant_id: folderId },
      include: [
        {
          model: Folder,
          as: "ancestor",
          attributes: ["id", "name"],
        },
      ],
      order: [["depth", "DESC"]],
    });

    if (!ancestors.length) {
      throw new Error("Folder not found");
    }

    // Extraer nombres en orden (root → hijo → subhijo)
    const pathNames = ancestors.map(fc => {
      const folder = (fc as any).ancestor as Folder;
      return folder.name;
    });

    const path = pathNames.join("/");

    return path ? `${path}/` : "";
  }

  public async generatePresignedUrl(
    fileName: string,
    fileType: string,
    module: string,
    principalFolder: string,
    folderId: number | null
  ): Promise<{
    url: string;
    key: string;
  }> {
    const folderPath = await this.buildFolderPath(folderId);
    const key = `${module}/${principalFolder}/${folderPath}${fileName}`;

    const command = new PutObjectCommand({
      Bucket: config.S3_FILES.S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 600 }); // válido 10 min
    return {
      url: signedUrl,
      key,
    };
  }

  public async saveFileRecord(data: {
    module: string;
    folderId?: number | null;
    originalName: string;
    s3Key: string;
    mimeType: string;
    size: number;
  }) {
    const file = await File.create({
      module: data.module,
      folder_id: data.folderId ?? null,
      original_name: data.originalName,
      s3_key: data.s3Key,
      mime_type: data.mimeType,
      size: data.size,
    });

    return file;
  }

  public async generateDownloadUrl(
    s3Key: string,
    fileName: string
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: config.S3_FILES.S3_BUCKET_NAME,
      Key: s3Key,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 600 }); // válido 10 min
    return signedUrl;
  }

  public async downloadFolderAsZip(
    folderId: number,
    res: Response
  ): Promise<void> {
    // 1️⃣ Obtener descendientes
    const closureEntries = await FolderClosure.findAll({
      where: { ancestor_id: folderId },
    });
    const descendantIds = closureEntries.map(d => d.descendant_id);

    // 2️⃣ Traer carpetas y archivos
    const allFolders = await Folder.findAll({
      where: { id: descendantIds },
    });

    const files = await File.findAll({
      where: { folder_id: descendantIds },
    });

    // Si no existe la carpeta raíz en la DB, ahí sí lanzamos error
    const rootFolder = allFolders.find(f => f.id === folderId);
    if (!rootFolder) {
      res.status(404).json({ message: "Folder not found" });
      return;
    }

    // 3️⃣ Mapa de carpetas
    const folderMap = new Map(allFolders.map(f => [f.id, f]));

    const getRelativePath = (targetFolderId: number): string => {
      if (targetFolderId === folderId) return "";

      const pathParts: string[] = [];
      let currentId: number | null = targetFolderId;

      while (currentId && currentId !== folderId) {
        const folder = folderMap.get(currentId);
        if (folder) {
          pathParts.unshift(folder.name);
          currentId = folder.parent_id;
        } else {
          break;
        }
      }
      return pathParts.join("/") + "/";
    };

    // 4️⃣ Headers
    const zipName = rootFolder.name || "folder";
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipName}.zip"`
    );
    res.setHeader("Content-Type", "application/zip");

    // 5️⃣ Archiver
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", err => {
      throw err;
    });
    archive.pipe(res);

    // Esto asegura que las carpetas vacías aparezcan en el ZIP
    for (const f of allFolders) {
      const relativePath = getRelativePath(f.id);
      if (relativePath) {
        // Al pasar null y un nombre que termina en '/', archiver crea la carpeta
        archive.append(null as any, { name: relativePath });
      }
    }
    console.time("HEY");
    // 6️⃣ Añadir Archivos
    for (const file of files) {
      try {
        const command = new GetObjectCommand({
          Bucket: config.S3_FILES.S3_BUCKET_NAME,
          Key: file.s3_key,
        });

        // Esperamos a que S3 responda para este archivo antes de pasar al siguiente
        const s3Response = await s3.send(command);
        const fileStream = s3Response.Body as any;

        const relativePath = getRelativePath(file.folder_id!);

        // Append es síncrono en la creación del header,
        // pero archiver gestiona el stream de forma secuencial internamente.
        archive.append(fileStream, {
          name: `${relativePath}${file.original_name}`,
        });

        // Esto ayuda a que archiver no se desborde si los archivos son enormes
        await new Promise((resolve, reject) => {
          fileStream.on("error", reject); // Si hay un error en la lectura, detente y avisa.
          fileStream.on("end", resolve); // Solo cuando el archivo actual se haya leído COMPLETO, continúa.
        });
      } catch (s3Error) {
        console.error(`Error fetching file ${file.s3_key}:`, s3Error);

        // Meter un aviso dentro del ZIP
        archive.append(
          `No se pudo descargar el archivo: ${file.original_name}`,
          { name: `ERROR_${file.original_name}.txt` }
        );
      }
    }
    console.timeEnd("HEY");

    await archive.finalize();
  }
}
