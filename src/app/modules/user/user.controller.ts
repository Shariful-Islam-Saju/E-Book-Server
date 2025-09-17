import { Request, Response } from "express";
import catchAsync from "@app/shared/catchAsync";
import sendResponse from "@app/shared/sendResponse";
import httpStatus from "http-status";
import { userService } from "./user.service";

// ✅ Create a new user
const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createUser(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User created successfully!",
    data: result,
  });
});

// ✅ Get a user by ID
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getUserById(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully!",
    data: result,
  });
});

// ✅ Get all users
const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const result = await userService.getAllUsers();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully!",
    data: result,
  });
});

// ✅ Update a user
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.updateUser(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully!",
    data: result,
  });
});

// ✅ Delete a user
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.deleteUser(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully!",
    data: result,
  });
});

export const userController = {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
};
