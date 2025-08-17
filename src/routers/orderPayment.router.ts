import { Router } from "express";
import { OrderReminderController } from "../controllers/OrderReminder.controller";

export default class OrderReminderRouter {
    private router: Router;
    private controller: OrderReminderController;

    constructor() {
        this.router = Router();
        this.controller = new OrderReminderController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Menetapkan rute POST untuk mengirim email konfirmasi.
        // Perhatikan bahwa rute ini tidak digunakan untuk pengingat otomatis.
        // Pengingat otomatis dijalankan oleh scheduler.
        this.router.post(
            "/send-confirmation",
            this.controller.sendConfirm.bind(this.controller)
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}