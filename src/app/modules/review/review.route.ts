import auth from "@app/middlewares/auth";
import { Router } from "express";
import { reviewController } from "./review.controller";
import { fileUploader } from "@app/helpers/fileUploader";

const router = Router();

router.get("/", reviewController.getAllReviews);
router.post(
  "/create",
  auth(),
  fileUploader.upload.fields([
    { name: "profileImg", maxCount: 1 }, // max 1 images
    { name: "FacebookImg", maxCount: 1 }, // max 1 images
  ]),
  (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    return reviewController.createReview(req, res, next);
  }
);

router.patch(
  "/:id",
  auth(),
  fileUploader.upload.fields([
    { name: "profileImg", maxCount: 1 }, // max 1 images
    { name: "FacebookImg", maxCount: 1 }, // max 1 images
  ]),
  (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    return reviewController.updateReview(req, res, next);
  }
);
router.get("/ebook-review/:ebookId", reviewController.getSingleProductReviews);
router.delete("/:id", auth(), reviewController.deleteReview);

export const reviewRouter: Router = router;
