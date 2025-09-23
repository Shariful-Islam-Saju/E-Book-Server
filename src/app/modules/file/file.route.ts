import { Router } from "express";
import { fileController } from "./file.controller";
import { fileUploader } from "@app/helpers/fileUploader";
import auth from "@app/middlewares/auth";

const router = Router();

// Upload file
// Upload file
router.post(
  "/upload",
  auth("SUPERADMIN", "ADMIN"), // authentication first
  fileUploader.upload.fields([
    { name: "pdf", maxCount: 1 }, // max 5 pdfs
    { name: "img", maxCount: 1 }, // max 5 images
  ]),
  (req, res, next) => {
    console.log("bodyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy sohel", req.body);
    req.body = JSON.parse(req.body.data);
    return fileController.uploadFile(req, res, next);
  }
);

// Download file
router.get("/download/:fileId", auth(), fileController.downloadFile);

// Get all files
router.get("/", fileController.getAllFiles);

// Get single file info
router.get("/file-id/:fileId", fileController.getSingleFile);

router.get("/file-name/:title", fileController.getFileByName);

// Delete file
router.delete(
  "/:fileId",
  auth("SUPERADMIN", "ADMIN"),
  fileController.deleteFile
);

export const fileRouter: Router = router;
