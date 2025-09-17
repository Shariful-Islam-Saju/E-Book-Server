import auth from "@app/middlewares/auth";
import { Router } from "express";
import { reviewController } from "./review.controller";

const router = Router();

router.post("/create", reviewController.createReview);
router.get("/ebook-review/:ebookId", reviewController.getSingleProductReviews);
router.get("/", reviewController.getAllReviews);
router.delete("/:id", auth(), reviewController.deleteReview);

export const reviewRouter: Router = router;
