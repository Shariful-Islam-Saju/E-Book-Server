import { Request } from "express";
import AppError from "@app/errors/AppError";
import prisma from "@app/lib/prisma";
import httpStatus from "http-status";
import { fileUploader } from "@app/helpers/fileUploader";

// ---------------- CREATE REVIEW ----------------
const createReview = async (req: Request) => {
  const { title, rating, description, reviewBy, mobile, ebookId } = req.body;
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  if (!ebookId) {
    throw new AppError(httpStatus.BAD_REQUEST, "ebookId is required");
  }

  // Check if the ebook exists
  const ebookExists = await prisma.eBook.findUnique({
    where: { id: ebookId },
  });
  if (!ebookExists) {
    throw new AppError(httpStatus.NOT_FOUND, "EBook not found");
  }

  // Handle optional images
  let profileImgUrl: string | undefined;
  let facebookImgUrl: string | undefined;

  if (files?.profileImg?.length) {
    profileImgUrl = await fileUploader.uploadToS3(files.profileImg[0]);
  }

  if (files?.facebookImg?.length) {
    facebookImgUrl = await fileUploader.uploadToS3(files.facebookImg[0]);
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      title,
      rating: parseInt(rating, 10),
      description,
      reviewBy,
      mobile,
      ebookId,
      profileImg: profileImgUrl,
      FacebookImg: facebookImgUrl,
    },
  });

  return review;
};

// ---------------- GET ALL REVIEWS ----------------
const getAllReviews = async (ebookId?: string) => {
  return prisma.review.findMany({
    where: ebookId ? { ebookId } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      ebook: {
        select: { id: true, title: true },
      },
    },
  });
};

// ---------------- GET SINGLE PRODUCT REVIEWS ----------------
const getSingleProductReviews = async (ebookId: string) => {
  if (!ebookId) {
    throw new AppError(httpStatus.BAD_REQUEST, "ebookId is required");
  }

  const reviews = await prisma.review.findMany({
    where: { ebookId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      rating: true,
      description: true,
      reviewBy: true,
      mobile: true,
      profileImg: true,
      FacebookImg: true,
    },
  });

  return reviews;
};

// ---------------- UPDATE REVIEW ----------------
const updateReview = async (req: any) => {
  const id = req.params.id;
  const updateData = req.body;
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, "Review ID is required");
  }

  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  let profileImgUrl = existing.profileImg;
  let facebookImgUrl = existing.FacebookImg;

  // Update profile image
  if (files?.profileImg?.length) {
    if (existing.profileImg) {
      await fileUploader.deleteFromS3(existing.profileImg);
    }
    profileImgUrl = await fileUploader.uploadToS3(files.profileImg[0]);
  }

  // Update facebook image
  if (files?.facebookImg?.length) {
    if (existing.FacebookImg) {
      await fileUploader.deleteFromS3(existing.FacebookImg);
    }
    facebookImgUrl = await fileUploader.uploadToS3(files.facebookImg[0]);
  }

  const updatedReview = await prisma.review.update({
    where: { id },
    data: {
      ...updateData,
      profileImg: profileImgUrl,
      FacebookImg: facebookImgUrl,
    },
  });

  return updatedReview;
};

// ---------------- DELETE REVIEW ----------------
const deleteReview = async (id: string) => {
  const existing = await prisma.review.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  // Delete images from S3 if they exist
  if (existing.profileImg) {
    await fileUploader.deleteFromS3(existing.profileImg);
  }
  if (existing.FacebookImg) {
    await fileUploader.deleteFromS3(existing.FacebookImg);
  }

  return prisma.review.delete({ where: { id } });
};

export const reviewService = {
  createReview,
  getAllReviews,
  getSingleProductReviews,
  updateReview,
  deleteReview,
};
