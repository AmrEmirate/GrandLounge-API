import { PrismaClient } from "../generated/prisma";
import ReviewRepository from "../repositories/Review.repositori";
import ApiError from "../utils/apiError";

const prisma = new PrismaClient();
const reviewRepo = new ReviewRepository();

export const submitReview = async (userId: number, bookingId: number, propertyId: number, comment: string) => {
    try {
        console.log("Memulai submitReview di ReviewService");
        
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                review: true
            }
        });
        
        console.log("Booking ditemukan:", booking);

        if (!booking) {
            throw new ApiError(404, "Pemesanan tidak ditemukan.");
        }

        if (booking.userId !== userId) {
            throw new ApiError(403, "Anda tidak memiliki izin untuk memberi review pada pesanan ini.");
        }

        if (new Date(booking.checkOut) > new Date()) {
            throw new ApiError(400, "Anda hanya bisa memberi review setelah tanggal check-out.");
        }

        if (booking.review) {
            throw new ApiError(400, "Review sudah diberikan untuk pemesanan ini.");
        }

        const newReview = await reviewRepo.createReview({
            comment,
            user: {
                connect: { id: userId }
            },
            booking: {
                connect: { id: bookingId }
            },
            property: {
                connect: { id: propertyId }
            }
        });
        
        console.log("Review berhasil dibuat:", newReview);
        return newReview;

    } catch (error) {
        console.error("Kesalahan di ReviewService:", error);
        throw error; // Melempar error ke controller untuk ditangani
    }
} 

export const replyToReview = async (tenantId: number, reviewId: number, replyComment: string) => { 
    try {
        const review = await reviewRepo.findReviewById(reviewId); 

        if (!review) { 
            throw new ApiError(404, "Review tidak ditemukan."); 
        } 

        if (review.booking.property.tenantId !== tenantId) { 
            throw new ApiError(403, "Anda tidak memiliki izin untuk membalas review ini.") 
        } 

        return await reviewRepo.updateReview(reviewId, { 
            tenantReply: replyComment 
        }) 
    } catch (error) {
        console.error("Kesalahan di replyToReview:", error);
        throw error;
    }
}
