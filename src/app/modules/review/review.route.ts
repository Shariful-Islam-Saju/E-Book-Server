import auth from "@app/middlewares/auth";
import { Router } from "express";
import { reviewController } from "./review.controller";

const router = Router();

router.post("/create", reviewController.createReview);
router.get("/",  reviewController.getAllReviews);
router.delete("/:id", reviewController.deleteReview);


export const reviewRouter: Router = router;