import { Router } from "express";
import ReviewController from "../controllers/review.controller";
import { verifyToken, isTenant, isUser } from "../middleware/auth.middleware";
import { validate, ReviewValidator } from "../middleware/validators";

class ReviewRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      "/",
      verifyToken,
      isUser,
      validate(ReviewValidator.create),
      ReviewController.createReview.bind(ReviewController)
    );

    this.router.post(
      "/:reviewId/reply",
      verifyToken,
      isTenant,
      ReviewController.replyReview.bind(ReviewController)
    );

    this.router.get(
      "/property/:propertyId",
      ReviewController.getReviewByProperty.bind(ReviewController)
    );

    this.router.get(
      "/property/name/:propertyName",
      ReviewController.getReviewByPropertyName.bind(ReviewController)
    );

    this.router.get(
      "/tenant",
      verifyToken,
      isTenant,
      ReviewController.getTenantReviews.bind(ReviewController)
    );
  }
}

export default new ReviewRouter().router;
