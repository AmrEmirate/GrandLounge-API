import { prisma } from "../config/prisma";

export class ReviewRepository {
    async createReview({
        userId,
        propertyId,
        bookingId,
        rating,
        comment,
    }: {
        userId: string;
        propertyId: string;
        bookingId: string;
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

    async findBookingBy(bookingId: string) {
        return prisma.review.findFirst({
            where: { bookingId }
        })
    }

    async replyReview(reviewId: string, reply: string) {
        return prisma.review.update({
            where: { id: reviewId },
            data: { reply },
            include: {
                user: {
                    select: {
                        fullName: true,
                        profilePicture: true,
                    },
                },
                property: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async getReviewsByPropertyName(propertyName: string) {
        return prisma.review.findMany({
            where: {
                property: {
                    name: propertyName,
                },
            },
            include: { user: true, property: true },
        });
    }

    async findReviewsByTenant(tenantId: string, limit: number) {
        return prisma.review.findMany({
            where: {
                property: {
                    tenantId: tenantId,
                },
            },
            include: {
                user: { select: { fullName: true, profilePicture: true } },
                property: { select: { id: true, name: true } },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });
    }
}