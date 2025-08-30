// src/routers/review.router.ts
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
        // User membuat review
        this.router.post("/", verifyToken, isUser, this.reviewController.createReview);

        // Tenant reply review
        this.router.post("/:reviewId/reply", verifyToken, isTenant, this.reviewController.replyReview);

        // Lihat review berdasarkan propertyId
        this.router.get("/property/:propertyId", this.reviewController.getReviewByProperty);

        // Lihat review berdasarkan nama hotel
        this.router.get("/property/name/:propertyName", this.reviewController.getReviewByPropertyName);
    }

    public getRouter(): Router {
        return this.router;
    }
}
