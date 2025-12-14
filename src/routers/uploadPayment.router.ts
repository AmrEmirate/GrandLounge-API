import { Router } from "express";
import uploadPaymentController from "../controllers/uploadPayment.controller";
import { verifyToken, isUser } from "../middleware/auth.middleware";
import { uploadPaymentProof } from "../middleware/upload.middleware";

class UploadPaymentRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initialRoutes();
  }

  private initialRoutes(): void {
    this.router.post(
      "/:invoiceNumber",
      verifyToken,
      isUser,
      uploadPaymentProof,
      uploadPaymentController.uploadPaymentProof.bind(uploadPaymentController)
    );
  }
}

export default new UploadPaymentRouter().router;
