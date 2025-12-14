import ReviewRepository from "../repositories/review.repository";
import { prisma } from "../config/prisma";
import ApiError from "../utils/apiError";

class ReviewService {
  async createReview(
    userId: string,
    bookingId: string,
    rating: number,
    comment?: string
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new ApiError(404, "Booking tidak ditemukan");
    if (booking.userId !== userId)
      throw new ApiError(403, "Tidak bisa review booking orang lain");
    if (booking.status !== "SELESAI")
      throw new ApiError(400, "Review hanya bisa setelah check-out");

    const currentDate = new Date();
    const checkoutDate = new Date(booking.checkOut);

    currentDate.setHours(0, 0, 0, 0);
    checkoutDate.setHours(0, 0, 0, 0);

    if (currentDate <= checkoutDate) {
      throw new ApiError(
        400,
        "You can only review this booking after the check-out date has passed."
      );
    }

    const existing = await ReviewRepository.findBookingBy(bookingId);
    if (existing) throw new ApiError(400, "Review sudah pernah diberikan");

    return ReviewRepository.createReview({
      userId,
      propertyId: booking.propertyId,
      bookingId,
      rating,
      comment,
    });
  }

  async replyReview(reviewId: string, reply: string) {
    try {
      return await ReviewRepository.replyReview(reviewId, reply);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ApiError(404, "Review tidak ditemukan.");
      }
      throw error;
    }
  }

  async getReviewsByProperty(propertyId: string) {
    return this.getReviewsByPropertyId(propertyId);
  }

  async getReviewsByPropertyName(propertyName: string) {
    return ReviewRepository.getReviewsByPropertyName(propertyName);
  }

  async getReviewsByPropertyId(propertyId: string) {
    return prisma.review.findMany({
      where: { propertyId },
      include: { user: true, property: true },
    });
  }

  async getReviewsByTenant(tenantId: string, limit: number) {
    return ReviewRepository.findReviewsByTenant(tenantId, limit);
  }
}

export default new ReviewService();
