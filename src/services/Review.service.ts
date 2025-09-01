import { ReviewRepository } from "../repositories/Review.repositori";
import { prisma } from "../config/prisma";
import ApiError from "../utils/apiError";

export class ReviewService {
    private reviewRepo = new ReviewRepository();

    // Create review
    async createReview(userId: string, bookingId: string, rating: number, comment?: string) {
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) throw new ApiError(404, "Booking tidak ditemukan");
        if (booking.userId !== userId) throw new ApiError(403, "Tidak bisa review booking orang lain");
        if (booking.status !== "SELESAI") throw new ApiError(400, "Review hanya bisa setelah check-out");

        const currentDate = new Date();
        const checkoutDate = new Date(booking.checkOut);

        currentDate.setHours(0, 0, 0, 0);
        checkoutDate.setHours(0, 0, 0, 0);

        if (currentDate <= checkoutDate) {
            throw new ApiError(400, 'You can only review this booking after the check-out date has passed.');
        }


        const existing = await this.reviewRepo.findBookingBy(bookingId);
        if (existing) throw new ApiError(400, "Review sudah pernah diberikan");

        return this.reviewRepo.createReview({
            userId,
            propertyId: booking.propertyId,
            bookingId,
            rating,
            comment,
        });
    }

    // Reply review tenant
    async replyReview(reviewId: string, reply: string) {
        try {
            return await this.reviewRepo.replyReview(reviewId, reply);
        } catch (error: unknown) {
            if (error instanceof Error) {
                // P2025 adalah kode error Prisma untuk 'record not found'
                throw new ApiError(404, "Review tidak ditemukan.");
            }
            throw error; // Lempar error lain
        }
    }

    // Get reviews by propertyId
    async getReviewsByProperty(propertyId: string) {
        return this.getReviewsByPropertyId(propertyId);
    }

    // Get reviews by propertyName (hotel name)
    async getReviewsByPropertyName(propertyName: string) {
        return this.reviewRepo.getReviewsByPropertyName(propertyName);
    }

    async getReviewsByPropertyId(propertyId: string) {
        return prisma.review.findMany({
            where: { propertyId },
            include: { user: true, property: true },
        });
    }

}
