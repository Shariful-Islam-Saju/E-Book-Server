// middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import AppError from "@app/errors/AppError";
import prisma from "@app/lib/prisma";
import { CustomJwtPayload } from "@app/types";
import { UserType , User} from "@prisma/client";
import config from "@app/config";

const auth = (...requiredRoles: UserType[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      // 1. Check if header exists
      if (!authHeader) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Authorization header is missing."
        );
      }

      // 2. Check if it starts with 'Bearer '
      if (!authHeader.startsWith("Bearer ")) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Invalid authorization format. Expected 'Bearer <token>'."
        );
      }

      // 3. Extract the token
      const token = authHeader.split(" ")[1];

      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Token is missing.");
      }
      // 2. Verify token
      const decoded = jwt.verify(
        token,
        config.jwt.access_token_secret as string
      ) as CustomJwtPayload;

      const { userType, id, iat } = decoded;
      // 3. Check if user exists in DB
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "This user is not found!");
      }

      // 5. Check if password changed after token issued
      if (
        user.updatedAt &&
        Math.floor(user.updatedAt.getTime() / 1000) > (iat as number)
      ) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      // 6. Role-based authorization
      if (requiredRoles.length && !requiredRoles.includes(userType)) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized!");
      }

      // 7. Attach user info to req
      req.user  = user;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
