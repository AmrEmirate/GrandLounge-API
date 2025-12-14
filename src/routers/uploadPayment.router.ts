import { Router } from "express";
import uploadPaymentController from "../controllers/uploadPayment.controller";
import { verifyToken, isUser } from "../middleware/auth.middleware";
import { uploadPaymentProof } from "../middleware/upload.middleware";

class UploadPaymentRouter {
  private router: Router;
  private uploadPaymentController = new uploadPaymentController();

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
      this.uploadPaymentController.uploadPaymentProof
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default UploadPaymentRouter;
