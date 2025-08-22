import { Router } from "express";
import { ReviewController } from "../controllers/Review.controller";
import { verifyToken } from "../middleware/verifyToken";
import { isTenant } from "../middleware/isTenant";
import { isUser } from "../middleware/isUser";

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
    }

    public getRouter(): Router {
        return this.router;
    }
}
