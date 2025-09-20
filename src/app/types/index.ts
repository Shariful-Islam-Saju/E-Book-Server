import { User } from "@prisma/client";

export * from "./config.types";
export * from "./errors.types";
export * from "./auth.types";

declare global {
  namespace Express {
    interface Request {
      user: User ; // You can replace `unknown` with your Prisma user type
    }
  }
}
