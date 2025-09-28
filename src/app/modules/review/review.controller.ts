import { Request, Response } from "express";
import catchAsync from "@app/shared/catchAsync";
import sendResponse from "@app/shared/sendResponse";
import httpStatus from "http-status";
import { reviewService } from "./review.service";

// ✅ Create a new review
const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.createReview(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review created successfully!",
    data: result,
  });
});

// ✅ Get all reviews (optionally by ebookId)
const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const { ebookId } = req.query; // optional filter
  const result = await reviewService.getAllReviews(
    ebookId ? String(ebookId) : undefined
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews retrieved successfully!",
    data: result,
  });
});

// ✅ Update an existing review
const updateReview = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.updateReview(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review updated successfully!",
    data: result,
  });
});

const getSingleProductReviews = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reviewService.getSingleProductReviews(
      req.params.ebookId
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Reviews retrieved successfully!",
      data: result,
    });
  }
);

// ✅ Delete a review by ID
const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await reviewService.deleteReview(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review deleted successfully!",
    data: result,
  });
});

export const reviewController = {
  createReview,
  updateReview,
  getAllReviews,
  deleteReview,
  getSingleProductReviews,
};
