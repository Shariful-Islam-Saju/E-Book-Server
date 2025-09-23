import { Request } from "express";
import AppError from "@app/errors/AppError";
import prisma from "@app/lib/prisma";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";

// Extend Express Request interface to include user with userType

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

  if (req.user?.userType === "ADMIN" && userType !== "USER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Admin can only create users with USER role"
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
const ipAddress = (req.headers["x-forwarded-for"] as string) || "";
const userAgent = req.headers["user-agent"] || "";
  const user = await prisma.user.create({
    data: {
      name,
      mobile,
      password: hashedPassword,
      ip: req.ip,
      userType: userType || "USER",
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

const updateUser = async (req: Request) => {
  const { id } = req.params;
  const { name, password, userType } = req.body;

  // Fetch the target user
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Ensure req.user exists
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const currentUser = req.user;

  // Cannot update own profile (handled later in a separate route)
  if (currentUser.id === id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You cannot update your own profile"
    );
  }

  // Admin updating USER → allowed, but cannot change role
  if (currentUser.userType === "ADMIN" && user.userType === "USER") {
    return prisma.user.update({
      where: { id },
      data: {
        name: name ?? user.name,
        password: password ? await bcrypt.hash(password, 10) : user.password,
      },
    });
  }

  // Admin trying to update other Admin or Superadmin → forbidden
  if (
    currentUser.userType === "ADMIN" &&
    (user.userType === "ADMIN" || user.userType === "SUPERADMIN")
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Admin cannot update other admin or superadmin profiles"
    );
  }

  // Superadmin can update anyone
  if (currentUser.userType === "SUPERADMIN") {
    return prisma.user.update({
      where: { id },
      data: {
        name: name ?? user.name,
        password: password ? await bcrypt.hash(password, 10) : user.password,
        userType: userType ?? user.userType, // can change role
      },
    });
  }

  // Everyone else → forbidden
  throw new AppError(
    httpStatus.FORBIDDEN,
    "You are not authorized to update this profile"
  );


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
