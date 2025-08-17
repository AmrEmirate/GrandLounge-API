import { Router } from "express";
import uploadPaymentController from "../controllers/UploadPayment.Controller";
import { uploadPaymentProof } from "../middleware/uploadPayment";
import { verifyToken } from "../middleware/verifyToken";
import { isUser } from "../middleware/isUser";

class UploadPaymentRouter {
    private router: Router;
    private uploadPaymentController = new uploadPaymentController();

    constructor() {
        this.router = Router();
        this.initialRoutes();
    }

    private initialRoutes(): void {
        this.router.post(
            "/:transactionId/upload-proof",
            verifyToken,
            isUser,
            this.uploadPaymentController.uploadPaymentProof
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default UploadPaymentRouter;