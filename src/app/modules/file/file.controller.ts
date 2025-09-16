import { Request, Response } from "express";
import catchAsync from "@app/shared/catchAsync";
import sendResponse from "@app/shared/sendResponse";
import httpStatus from "http-status";
import { fileService } from "./file.service";

const uploadFile = catchAsync(async (req: Request, res: Response) => {
  const result = await fileService.uploadFile(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File uploaded successfully!",
    data: result,
  });
});

const downloadFile = catchAsync(async (req: Request, res: Response) => {
  const result = await fileService.downloadFile(req.params.filename);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File downloaded successfully!",
    data: result,
  });
});

export default {
  uploadFile,
  downloadFile,
};
