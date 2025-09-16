import { Request } from "express";
import AppError from "@app/errors/AppError";
import prisma from "@app/lib/prisma";
import httpStatus from "http-status";

// ---------------- UPLOAD FILE ----------------

const uploadFile = async (req: Request) => {
  const file = req.file;
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, "No file uploaded");
  }
  console.log(file);
};

// ---------------- DOWNLOAD FILE ----------------
const downloadFile = async (filename: string) => {};

export const fileService = {
  uploadFile,
  downloadFile,
};
