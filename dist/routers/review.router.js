"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routers/review.router.ts
const express_1 = require("express");
const Review_controller_1 = require("../controllers/Review.controller");
const verifyToken_1 = require("../middleware/verifyToken");
const isTenant_1 = require("../middleware/isTenant");
const isUser_1 = require("../middleware/isUser");
class ReviewRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.reviewController = new Review_controller_1.ReviewController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // User membuat review
        this.router.post("/", verifyToken_1.verifyToken, isUser_1.isUser, this.reviewController.createReview);
        // Tenant reply review
        this.router.post("/:reviewId/reply", verifyToken_1.verifyToken, isTenant_1.isTenant, this.reviewController.replyReview);
        // Lihat review berdasarkan propertyId
        this.router.get("/property/:propertyId", this.reviewController.getReviewByProperty);
        // Lihat review berdasarkan nama hotel
        this.router.get("/property/name/:propertyName", this.reviewController.getReviewByPropertyName);
        this.router.get("/tenant", verifyToken_1.verifyToken, isTenant_1.isTenant, this.reviewController.getTenantReviews);
    }
    getRouter() {
        return this.router;
    }
}
exports.default = ReviewRouter;
