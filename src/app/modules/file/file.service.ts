import { Request } from "express";
import AppError from "@app/errors/AppError";
import prisma from "@app/lib/prisma";
import httpStatus from "http-status";
import { fileUploader } from "@app/helpers/fileUploader";

// ---------------- UPLOAD FILE ----------------
const uploadFile = async (req: Request) => {
  const file = req.file;
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, "No file uploaded");
  }

  // Upload to AWS S3
  const uploadToAws = await fileUploader.uploadToS3(file);
  // const uploadToAws = 'sample-url'; // --- IGNORE ---
  // Save metadata in DB
  const ebook = await prisma.eBook.create({
    data: {
      title: file.originalname,
      url: uploadToAws,
    },
  });

  return ebook;
};

// ---------------- DOWNLOAD FILE ----------------
const downloadFile = async (id: string) => {
  const ebook = await prisma.eBook.findUnique({
    where: { id },
  });

  if (!ebook) {
    throw new AppError(httpStatus.NOT_FOUND, "File not found");
  }

  // If you want direct download, generate signed URL
  const signedUrl = await fileUploader.getSignedUrl(ebook.url);
  console.log(signedUrl);
  return {
    ...ebook,
    downloadUrl: signedUrl,
  };
};

// ---------------- GET ALL FILES ----------------
const getAllFiles = async () => {
  const files = await prisma.eBook.findMany({
    orderBy: { createdAt: "desc" },
  });
  return files;
};

// ---------------- GET SINGLE FILE ----------------
const getSingleFile = async (id: string) => {
  const ebook = await prisma.eBook.findFirst({
    where: { id },
  });

  if (!ebook) {
    throw new AppError(httpStatus.NOT_FOUND, "File not found");
  }

  return ebook;
};

// ---------------- DELETE FILE ----------------
const deleteFile = async (id: string) => {
  const ebook = await prisma.eBook.findFirst({
    where: { id },
  });

  if (!ebook) {
    throw new AppError(httpStatus.NOT_FOUND, "File not found");
  }

  // Delete from AWS S3
  await fileUploader.deleteFromS3(ebook.url);

  // Delete from DB
  await prisma.eBook.delete({
    where: { id: ebook.id },
  });

  return { message: "File deleted successfully" };
};

export const fileService = {
  uploadFile,
  downloadFile,
  getAllFiles,
  getSingleFile,
  deleteFile,
};
