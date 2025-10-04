// src/App.ts
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Application, Request, Response, NextFunction } from "express";
import passport from 'passport';

// Impor Konfigurasi
import './config/passport';
import './scheduler';

// Impor Router dari Feature 1 
import authRouter from './routers/auth.router';
import userRouter from './routers/user.router';
import categoryRouter from './routers/category.router';
import propertyRouter from './routers/property.router';
import amenityRouter from './routers/amenity.router';
import cityRouter from './routers/city.router';
import peakSeasonRouter from './routers/peakSeason.router';

// Impor Router dari Feature 2 
import UploadPaymentRouter from "./routers/uploadPayment.router";
import RoomReservationRouter from "./routers/roomReservation.router";
import OrderListRouter from "./routers/orderList.router";
import CancelOrderRouter from "./routers/cancelOrder.router";
import ConfirmPaymentRouter from "./routers/confirmPayment.router";
import OrderReminderRouter from "./routers/orderReminder.router";
import ReportRouter from "./routers/report.router";
import CalenderRouter from "./routers/calenderReport.router";
import { startSchedulers } from "./scheduler/index";
import ReviewRouter from "./routers/review.router";

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
        const corsOptions = {
            origin: 'https://fe-finpro-grandlounge.vercel.app', 
            credentials: true,               
        };
        this.app.use(cors(corsOptions));

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(passport.initialize());
    }

    private routes(): void {
        // --- ROUTER UNTUK FEATURE 1 (Amr) ---
        this.app.use('/api/auth', authRouter);
        this.app.use('/api/user', userRouter);
        this.app.use('/api/categories', categoryRouter);
        this.app.use('/api/properties', propertyRouter);
        this.app.use('/api/amenities', amenityRouter);
        this.app.use('/api/cities', cityRouter);
        this.app.use('/api/peak-seasons', peakSeasonRouter);

        // --- ROUTER UNTUK FEATURE 2 (Adi) 
        const reservationRouter = new RoomReservationRouter();
        const uploadPayment = new UploadPaymentRouter();
        const orderList = new OrderListRouter();
        const cancelOrder = new CancelOrderRouter();
        const confirmPayment = new ConfirmPaymentRouter();
        const sendConfirm = new OrderReminderRouter();
        const review = new ReviewRouter();
        const report = new ReportRouter();
        const calender = new CalenderRouter();

        this.app.use("/api/reservations", reservationRouter.getRouter());
        this.app.use("/api/payments", uploadPayment.getRouter());
        this.app.use("/api/orders", orderList.getRouter());
        this.app.use("/api/order-cancel", cancelOrder.getRouter());
        this.app.use("/api/payment-confirm", confirmPayment.getRouter());
        this.app.use("/api/send-reminder", sendConfirm.getRouter());
        this.app.use("/api/reviews", review.getRouter())
        this.app.use("/api/report", report.getRouter());
        this.app.use("/api/reports/availability", calender.getRouter());
        
        // Rute dasar
        this.app.get("/", (req: Request, res: Response) => {
            res.status(200).send("<h1>Welcome to Final Project Grand Lodge</h1>");
        });
    }

    private errorHandler(): void {
        this.app.use((error: any, req: Request, res: Response, next: NextFunction) => {
            console.error(error);
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        });
    }

    public start(): void {
        this.app.listen(PORT, () => {
            console.log(`Server is Running on http://localhost:${PORT}`);
            startSchedulers();
        });
    }
}

export default App;