import { Request, Response } from "express";
import catchAsync from "@app/shared/catchAsync";
import sendResponse from "@app/shared/sendResponse";
import httpStatus from "http-status";
import { fileService } from "./file.service";

// ✅ Upload
const uploadFile = catchAsync(async (req: Request, res: Response) => {
  const result = await fileService.uploadFile(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File uploaded successfully!",
    data: result,
  });
});

// ✅ Download
const downloadFile = catchAsync(async (req: Request, res: Response) => {
  const result = await fileService.downloadFile(req.params.fileId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File downloaded successfully!",
    data: result,
  });
});

// ✅ Get all files
const getAllFiles = catchAsync(async (req: Request, res: Response) => {
  const result = await fileService.getAllFiles();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Files retrieved successfully!",
    data: result,
  });
});

// ✅ Get single file info
const getSingleFile = catchAsync(async (req: Request, res: Response) => {
  console.log(req.params.fileId);
  const result = await fileService.getSingleFile(req.params.fileId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File retrieved successfully!",
    data: result,
  });
});

// ✅ Delete file
const deleteFile = catchAsync(async (req: Request, res: Response) => {
  const result = await fileService.deleteFile(req.params.fileId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File deleted successfully!",
    data: result,
  });
});

export default {
  uploadFile,
  downloadFile,
  getAllFiles,
  getSingleFile,
  deleteFile,
};
