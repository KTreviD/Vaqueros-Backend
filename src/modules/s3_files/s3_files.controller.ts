import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { S3FilesService } from "./s3_files.service";
import { HTTPSTATUS } from "../../config/http.config";

export class S3FilesController {
  private s3FilesService: S3FilesService;

  constructor(s3FilesService: S3FilesService) {
    this.s3FilesService = s3FilesService;
  }

  public getFolders = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { module, parentId, deleted } = req.query;

      if (!module) {
        return res.status(400).json({
          message: "Module is required",
        });
      }
      const parentIdNumber =
        parentId && parentId !== "null" ? Number(parentId) : null;
      const isDeleted = deleted === "true";

      const { folders, files } = await this.s3FilesService.getFolders(
        String(module),
        parentIdNumber,
        isDeleted
      );

      return res.status(200).json({
        folders,
        files,
      });
    }
  );

  public createFolder = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { module, name, parentId } = req.body;

      const folder = await this.s3FilesService.createFolder(
        module,
        name,
        parentId ?? null
      );

      return res.status(HTTPSTATUS.OK).json({
        message: "Folder created successfully",
        data: folder,
      });
    }
  );

  public renameFolder = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { body } = req;

      const folder = await this.s3FilesService.renameFolder(body);

      return res.status(HTTPSTATUS.OK).json({
        message: "Folder renamed successfully",
      });
    }
  );

  public deleteFolder = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({
          message: "folderId is required",
        });
      }

      await this.s3FilesService.deleteFolder(Number(id));

      return res.status(HTTPSTATUS.OK).json({
        message: "Folder deleted successfully",
      });
    }
  );

  public getPresignedUrl = asyncHandler(async (req: Request, res: Response) => {
    const { fileName, fileType, module, principalFolder, folderId } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ message: "FileName or FileType required" });
    }

    if (!module) {
      return res.status(400).json({ message: "Module required" });
    }

    try {
      const { url, key } = await this.s3FilesService.generatePresignedUrl(
        fileName,
        fileType,
        module,
        principalFolder,
        folderId
      );
      return res.status(200).json({ url, key });
    } catch (err) {
      console.error("Error generating presigned URL:", err);
      return res
        .status(500)
        .json({ message: "Error generating presigned URL" });
    }
  });

  public confirmUpload = asyncHandler(async (req: Request, res: Response) => {
    const { module, folderId, originalName, s3Key, mimeType, size } = req.body;

    const file = await this.s3FilesService.saveFileRecord({
      module,
      folderId,
      originalName,
      s3Key,
      mimeType,
      size,
    });

    return res.status(200).json({
      message: "File saved successfully",
      data: file,
    });
  });

  public getDownloadUrl = asyncHandler(async (req: Request, res: Response) => {
    const { s3Key, fileName } = req.body;

    if (!s3Key || !fileName) {
      return res
        .status(400)
        .json({ message: "s3Key and FileName are required" });
    }

    try {
      const url = await this.s3FilesService.generateDownloadUrl(
        s3Key,
        fileName
      );
      return res.status(200).json({ url });
    } catch (err) {
      console.error("Error generating download URL:", err);
      return res.status(500).json({ message: "Error generating download URL" });
    }
  });

  public downloadFolder = asyncHandler(async (req: Request, res: Response) => {
    console.log("ENTRE");
    const { folderId } = req.body;
    if (!folderId) {
      return res.status(400).json({ message: "folderId is required" });
    }

    try {
      await this.s3FilesService.downloadFolderAsZip(Number(folderId), res);
      // No devolvemos JSON, la respuesta ya es el ZIP
    } catch (err) {
      console.error("Error downloading folder:", err);
      return res.status(500).json({ message: "Error downloading folder" });
    }
  });
}
