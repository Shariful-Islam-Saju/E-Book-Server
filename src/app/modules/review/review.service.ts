import { Request } from "express";
import AppError from "@app/errors/AppError";
import prisma from "@app/lib/prisma";
import httpStatus from "http-status";

// Create a review
const createReview = async (req: Request) => {
  const { title, rating, description, reviewBy, mobile, ebookId } = req.body;

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

  // Create review
  const review = await prisma.review.create({
    data: {
      title,
      rating,
      description,
      reviewBy,
      mobile,
      ebookId,
    },
  });

  return review;
};

// Get all reviews (optionally filter by ebook)
const getAllReviews = async (ebookId?: string) => {
  return prisma.review.findMany({
    where: ebookId ? { ebookId } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      ebook: {
        select: { id: true, title: true }, // return ebook info too
      },
    },
  });
};

// Delete a review
const deleteReview = async (id: string) => {
  const existing = await prisma.review.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  return prisma.review.delete({ where: { id } });
};

export const reviewService = {
  createReview,
  getAllReviews,
  deleteReview,
};
