import { prisma } from "../config/prisma";

export class ReviewRepository {
    async createReview({
        userId,
        propertyId,
        bookingId,
        rating,
        comment,
    }: {
        userId: number;
        propertyId: number;
        bookingId: number;
        rating: number;
        comment?: string;
    }) {
        return prisma.review.create({
            data: {
                userId,
                propertyId,
                bookingId,
                rating,
                comment: comment ?? null,
            },
        });
    }

    async findBookingById(bookingId: number) {
        return prisma.review.findUnique({
            where: { bookingId }
        })
    }

    async replyReview(reviewId: number, reply: string) {
        return prisma.review.update({
            where: { id: reviewId },
            data: { reply }
        });
    }

    async getReviewsByProperty(propertyId: number) {
        return prisma.review.findMany({
            where: { propertyId }
        })
    }
}