import auth from "@app/middlewares/auth";
import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

// Create a new user
router.post("/create",auth("SUPERADMIN", "ADMIN"), userController.createUser);

// Get all users
router.get("/", auth("SUPERADMIN", "ADMIN"), userController.getAllUsers);

// Get a single user by id
router.get("/:id", auth("SUPERADMIN", "ADMIN"), userController.getUserById);

// Update a user by id
router.patch("/:id", auth("SUPERADMIN", "ADMIN"), userController.updateUser);

// Delete a user by id
router.delete("/:id", auth("SUPERADMIN", "ADMIN"), userController.deleteUser);

export const userRouter: Router = router;
