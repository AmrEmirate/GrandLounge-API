import { Request, Response, NextFunction } from 'express';
import { submitReview, replyToReview } from '../services/Review.service';
import ApiError from "../utils/apiError";

export class ReviewController {
    public async submitReview(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        console.log("1. Memulai submitReview di ReviewController");
        try {
            const user = (res.locals as any).descript;
            if (!user || !user.id) {
                throw new ApiError(401, "User not authenticated or invalid token data.");
            }
            
            console.log("2. User dari token:", user);
            const { bookingId, propertyId, comment } = req.body;
            console.log(`3. Data input: bookingId=${bookingId}, propertyId=${propertyId}, comment=${comment}`);
            
            const review = await submitReview(user.id, bookingId, propertyId, comment);
            
            console.log("4. Review berhasil dibuat, mengirim respons");
            res.status(200).json({
                success: true,
                message: "Review berhasil dikirim!",
                data: review
            });
        } catch (error) {
            console.error("Kesalahan di ReviewController:", error);
            next(error);
        }
    }

    public async replyToComment( 
        req: Request, 
        res: Response, 
        next: NextFunction 
    ): Promise<void> { 
        try { 
            const user = (res.locals as any).descript; 
            if (!user || !user.id) { 
                throw new ApiError(401, "User not authenticated or invalid token data."); 
            } 
            
            const { reviewId } = req.params; 
            const { replyComment } = req.body; 

            const updatedReview = await replyToReview(user.id, parseInt(reviewId), replyComment); 

            res.status(200).json({ 
                success: true, 
                message: "Balasan berhasil dikirim!", 
                data: updatedReview 
            }); 
        } catch (error) { 
            next(error); 
        } 
    }
}