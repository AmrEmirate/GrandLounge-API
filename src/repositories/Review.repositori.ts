import { prisma } from "../config/prisma";
import { Prisma } from "../generated/prisma";

export default class ReviewRepository {
    async createReview(data: Prisma.ReviewCreateInput) {
        return prisma.review.create({ data })
    }

    async findReviewByBookingId(bookingId: number) {
        return prisma.review.findUnique({
            where: { bookingId }
        })
    }

    async findReviewById(reviewId: number) {
        return prisma.review.findUnique({
            where: { id: reviewId },
            include: {
                booking: {
                    include: {
                        property: true
                    }
                }
            }
        })
    }

    async updateReview(reviewId: number, data: Prisma.ReviewUpdateInput) {
        return prisma.review.update({
            where: {id: reviewId},
            data
        })
    }
}