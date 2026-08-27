import { S3FilesController } from "./s3_files.controller";
import { S3FilesService } from "./s3_files.service";

const s3FilesService = new S3FilesService();
const s3FilesController = new S3FilesController(s3FilesService);

export { s3FilesService, s3FilesController };
