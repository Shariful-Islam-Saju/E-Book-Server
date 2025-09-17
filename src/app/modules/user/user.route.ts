import auth from "@app/middlewares/auth";
import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

// Create a new user
router.post("/create",auth("ADMIN"), userController.createUser);

// Get all users
router.get("/", auth("ADMIN"), userController.getAllUsers);

// Get a single user by id
router.get("/:id", auth("ADMIN"), userController.getUserById);

// Update a user by id
router.patch("/:id", auth("ADMIN"), userController.updateUser);

// Delete a user by id
router.delete("/:id", auth("ADMIN"), userController.deleteUser);

export const userRouter: Router = router;
