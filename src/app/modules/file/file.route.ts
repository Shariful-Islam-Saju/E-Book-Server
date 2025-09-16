import { Router } from "express";
import fileController from "./file.controller";

const router = Router();

router.post("/upload", fileController.uploadFile);
router.get("/download/:filename", fileController.downloadFile);

export const fileRouter: Router = router;