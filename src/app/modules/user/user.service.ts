import { Request } from "express";
import AppError from "@app/errors/AppError";
import prisma from "@app/lib/prisma";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";

// Create a new user
const createUser = async (req: Request) => {
  const { name, mobile, password, userType } = req.body;

  if (!mobile || !password || !name) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Name, Mobile and Password  are required"
    );
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { mobile } });
  if (existingUser) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User with this mobile already exists"
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      mobile,
      password: hashedPassword,
    },
  });

  return user;
};

// Get user by ID
const getUserById = async (req: Request) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

// Get all users
const getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
};

// Update a user
const updateUser = async (req: Request) => {
  const { id } = req.params;
  const { name, password, userType } = req.body;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: name ?? user.name,
      password: password ? await bcrypt.hash(password, 10) : user.password,
      userType: userType ?? user.userType,
    },
  });

  return updatedUser;
};

// Delete a user
const deleteUser = async (req: Request) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return prisma.user.delete({ where: { id } });
};

export const userService = {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
};
