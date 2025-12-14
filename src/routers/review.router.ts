import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { verifyToken, isTenant, isUser } from "../middleware/auth.middleware";
import { validate, ReviewValidator } from "../middleware/validators";

export default class ReviewRouter {
  private router: Router;
  private reviewController: ReviewController;

  constructor() {
    this.router = Router();
    this.reviewController = new ReviewController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      "/",
      verifyToken,
      isUser,
      validate(ReviewValidator.create),
      this.reviewController.createReview
    );

    this.router.post(
      "/:reviewId/reply",
      verifyToken,
      isTenant,
      this.reviewController.replyReview
    );

    this.router.get(
      "/property/:propertyId",
      this.reviewController.getReviewByProperty
    );

    this.router.get(
      "/property/name/:propertyName",
      this.reviewController.getReviewByPropertyName
    );

    this.router.get(
      "/tenant",
      verifyToken,
      isTenant,
      this.reviewController.getTenantReviews
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
