import { Router } from "express";
import { midtransWebhookController } from "../controllers/MidtransWebhook.controller";

const router = Router();

// Midtrans akan POST ke endpoint ini
router.post("/midtrans-callback", midtransWebhookController);

export default router;
