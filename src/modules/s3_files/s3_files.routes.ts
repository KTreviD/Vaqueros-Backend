import { Router } from "express";
import { s3FilesController } from "./s3_files.module";

const s3FilesRoutes = Router();

s3FilesRoutes.get("/foldersAndFiles", s3FilesController.getFolders);
s3FilesRoutes.post("/createfolder", s3FilesController.createFolder);
s3FilesRoutes.put("/renamefolder", s3FilesController.renameFolder);
s3FilesRoutes.delete("/deletefolder", s3FilesController.deleteFolder);

s3FilesRoutes.post("/upload-url", s3FilesController.getPresignedUrl);
s3FilesRoutes.post("/confirm-upload", s3FilesController.confirmUpload);
s3FilesRoutes.post("/download-url", s3FilesController.getDownloadUrl);
s3FilesRoutes.post("/download-folder", s3FilesController.downloadFolder);

export default s3FilesRoutes;
