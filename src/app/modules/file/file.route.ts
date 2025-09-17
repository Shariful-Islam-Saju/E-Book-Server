import { Router } from "express";
import { fileController } from "./file.controller";
import { fileUploader } from "@app/helpers/fileUploader";
import auth from "@app/middlewares/auth";

const router = Router();

// Upload file
router.post(
  "/upload",
  fileUploader.upload.single("file"),
  auth(),
  fileController.uploadFile
);

// Download file
router.get("/download/:fileId",auth(), fileController.downloadFile);

// Get all files
router.get("/", fileController.getAllFiles);

// Get single file info
router.get("/file-id/:fileId", fileController.getSingleFile);

router.get("/file-name/:title", fileController.getFileByName);

// Delete file
router.delete("/:fileId",auth(), fileController.deleteFile);

export const fileRouter: Router = router;
