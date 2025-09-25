import { Request } from "express";
import AppError from "@app/errors/AppError";
import prisma from "@app/lib/prisma";
import httpStatus from "http-status";
import { fileUploader } from "@app/helpers/fileUploader";

const uploadFile = async (req: Request) => {
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };
  const { title, description, bookPrice, discount } = req.body;

  if (!files || (!files.pdf?.length && !files.img?.length)) {
    throw new AppError(httpStatus.BAD_REQUEST, "No file uploaded");
  }

  const pdfFile = files.pdf ? files.pdf[0] : null;
  const imgFile = files.img ? files.img[0] : null;

  if (!pdfFile) {
    throw new AppError(httpStatus.BAD_REQUEST, "PDF file is required");
  }
  const safeFileName = pdfFile.originalname.replace(/\s+/g, "_");
  const uniquePart = Date.now().toString().slice(-6);

  // Combine unique part with safe filename
  const slug = `${uniquePart}_${safeFileName}`;

  if (!imgFile) {
    throw new AppError(httpStatus.BAD_REQUEST, "Image file is required");
  }

  // Upload to AWS S3
  const url = await fileUploader.uploadFileToS3(pdfFile);
  const imgUrl = await fileUploader.uploadToS3(imgFile);

  const data = {
    url,
    imgUrl,
    title,
    discount,
    bookPrice,
    description,
    slug,
  };

  // Save metadata in DB
  const ebook = await prisma.eBook.create({
    data,
  });

  return ebook;
};

export { uploadFile };

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
const getSingleFile = async (id?: string) => {
  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, "File ID is required");
  }

  const ebook = await prisma.eBook.findUnique({
    where: { slug: id },
    select: {
      id: true,
      title: true,
      url: true,
      imgUrl: true,
      slug: true,
      description: true,
      bookPrice: true,
      discount: true,
      reviews: {
        select: {
          id: true,
          rating: true,
          description: true,
          title: true,
          reviewBy: true,
          mobile: true,
        },
      },
    },
  });

  if (!ebook) {
    throw new AppError(httpStatus.NOT_FOUND, "File not found");
  }

  return ebook;
};

// ---------------- GET FILE BY NAME ----------------
const getFileByName = async (title?: string) => {
  if (!title) {
    throw new AppError(httpStatus.BAD_REQUEST, "File title is required");
  }

  const ebook = await prisma.eBook.findFirst({
    where: { title },
    select: {
      id: true,
      title: true,
      url: true,
      reviews: {
        select: {
          id: true,
          rating: true,
          description: true,
          title: true,
          reviewBy: true,
          mobile: true,
        },
      },
    },
  });

  if (!ebook) {
    throw new AppError(httpStatus.NOT_FOUND, "File not found");
  }

  return ebook;
};
const deleteFile = async (id: string) => {
  const ebook = await prisma.eBook.findUnique({
    where: { id },
  });

  if (!ebook) {
    throw new AppError(httpStatus.NOT_FOUND, "File not found");
  }

  // Delete PDF and Image from AWS S3
  if (ebook.url) {
    await fileUploader.deleteFromS3(ebook.url);
  }
  if (ebook.imgUrl) {
    await fileUploader.deleteFromS3(ebook.imgUrl);
  }

  // Delete from DB
  await prisma.eBook.delete({
    where: { id: ebook.id },
  });

  return { message: "File deleted successfully" };
};

// ---------------- UPDATE FILE WITH FILES ----------------
const updateFile = async (req: any) => {
  const id = req.params.fileId;
  const image = req?.files?.img;
  const pdf  = req?.files?.pdf
  const updateData = req.body;
  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, "File ID is required");
  }


  const ebook = await prisma.eBook.findUnique({ where: { id } });

  if (!ebook) {
    throw new AppError(httpStatus.NOT_FOUND, "File not found");
  }

  let pdfUrl = ebook.url;
  let imgUrl = ebook.imgUrl;

  // Update PDF if a new one is uploaded
  if (pdf) {
    if (ebook.url) {
      await fileUploader.deleteFromS3(ebook.url); // delete old PDF
    }
    pdfUrl = await fileUploader.uploadFileToS3(pdf[0]); // upload new PDF
  }

  // Update Image if a new one is uploaded
  if (image) {
    if (ebook.imgUrl) {
      await fileUploader.deleteFromS3(ebook.imgUrl); // delete old image
    }
    imgUrl = await fileUploader.uploadToS3(image[0]); // upload new image
  }

  const updatedEbook = await prisma.eBook.update({
    where: { id },
    data: {
      ...updateData,
      url: pdfUrl,
      imgUrl: imgUrl,
    },
  });

  return updatedEbook;
};

export const fileService = {
  uploadFile,
  downloadFile,
  getAllFiles,
  getSingleFile,
  deleteFile,
  getFileByName,
  updateFile, // PATCH route support with files
};
