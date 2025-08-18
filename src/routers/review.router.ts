import { Router } from "express";
import { isUser } from "../middleware/isUser";
import { isTenant } from "../middleware/isTenant";
import { ReviewController } from "../controllers/Review.controller";
import { verifyToken } from "../utils/jwt";

export default class ReviewRouter {
    private router: Router;
    private review: ReviewController;

    constructor() {
        this.router = Router();
        this.review = new ReviewController();
        this.initialRoutes();
    }

    private initialRoutes(): void {
        this.router.post(
            "/",
            verifyToken,
            isUser,
            this.review.submitReview
        )

        this.router.patch(
            "/reply/:reviewId",
            verifyToken,
            isTenant,
            this.review.replyToComment
        )
    }

    public getRouter(): Router {
        return this.router;
    }
}