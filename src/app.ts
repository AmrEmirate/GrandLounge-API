import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Application, Request, Response, NextFunction } from "express";
import logger from "./utils/logger";
import mainRouter from "./routers"; 
import ApiError from "./utils/apiError";
import passport from 'passport';
import './config/passport'; 
import UploadPaymentRouter from "./routers/uploadPayment.router";
import RoomReservationRouter from "./routers/roomReservation.router";
import OrderListRouter from "./routers/orderList.router";
import CancelOrderRouter from "./routers/cancelOrder.router";
import ConfirmPaymentRouter from "./routers/confirmPayment.router";


const PORT: string = process.env.PORT || "2020";

class App {
    public app: Application;

    constructor() {
        this.app = express();
        this.configure();
        this.routes();
        this.errorHandler();
    }

    private configure(): void {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(passport.initialize()); 
    }

    private routes(): void {
        const reservationRouter = new RoomReservationRouter();
        const uploadPayment = new UploadPaymentRouter();
        const orderList = new OrderListRouter();
        const cancelOrder = new CancelOrderRouter();
        const confirmPayment = new ConfirmPaymentRouter();

        this.app.get("/", (req: Request, res: Response) => {
            res.status(200).send("<h1>Welcome to Final Project Grand Lodge</h1>");
        });

        this.app.use("/api", mainRouter); 

        // author = Adi
        // reservation
        this.app.use("/reservations", reservationRouter.getRouter());
        // upload payment proof
        this.app.use("/payments", uploadPayment.getRouter());
        // order list
        this.app.use("/order", orderList.getRouter());
        // cancel order
        this.app.use("/order-cancel", cancelOrder.getRouter());
        // Confirm Payment (Manual Transfer)
        this.app.use("payment", confirmPayment.getRouter());
        // end = adi

    }

    private errorHandler(): void {
        this.app.use((error: any, req: Request, res: Response, next: NextFunction) => {
            logger.error(
                `${req.method} ${req.path}: ${error.message} ${JSON.stringify(error)}`
            );
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: "Internal Server Error",
                });
            }
        });
    }

    public start(): void {
        this.app.listen(PORT, () => {
            console.log(`Server is Running on http://localhost:${PORT}`);
        });
    }
}

export default App;