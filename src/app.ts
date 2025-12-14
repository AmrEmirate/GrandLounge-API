import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Application, Request, Response, NextFunction } from "express";
import passport from "passport";
import "./config/passport";
import "./scheduler";
import logger from "./utils/logger";
import {
  configureSecurityMiddleware,
  apiLimiter,
} from "./middleware/security.middleware";
import authRouter from "./routers/auth.router";
import userRouter from "./routers/user.router";
import categoryRouter from "./routers/category.router";
import propertyRouter from "./routers/property.router";
import amenityRouter from "./routers/amenity.router";
import cityRouter from "./routers/city.router";
import peakSeasonRouter from "./routers/peakSeason.router";
import uploadPaymentRouter from "./routers/uploadPayment.router";
import roomReservationRouter from "./routers/roomReservation.router";
import orderListRouter from "./routers/orderList.router";
import cancelOrderRouter from "./routers/cancelOrder.router";
import confirmPaymentRouter from "./routers/confirmPayment.router";
import orderReminderRouter from "./routers/orderReminder.router";
import reportRouter from "./routers/report.router";
import calenderRouter from "./routers/calenderReport.router";
import { startSchedulers } from "./scheduler/index";
import reviewRouter from "./routers/review.router";
import paymentRouter from "./routers/payment.router";

const PORT = process.env.PORT;

export class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.errorHandler();
  }

  private configure(): void {
    configureSecurityMiddleware(this.app);

    const corsOptions = {
      origin: process.env.FE_URL,
      credentials: true,
    };
    this.app.use(cors(corsOptions));

    this.app.use(apiLimiter);

    this.app.use(express.json({ limit: "10kb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10kb" }));
    this.app.use(passport.initialize());
  }

  private routes(): void {
    this.app.use("/api/auth", authRouter);
    this.app.use("/api/user", userRouter);
    this.app.use("/api/categories", categoryRouter);
    this.app.use("/api/properties", propertyRouter);
    this.app.use("/api/amenities", amenityRouter);
    this.app.use("/api/cities", cityRouter);
    this.app.use("/api/peak-seasons", peakSeasonRouter);
    this.app.use("/api/reservations", roomReservationRouter);
    this.app.use("/api/payments", uploadPaymentRouter);
    this.app.use("/api/orders", orderListRouter);
    this.app.use("/api/order-cancel", cancelOrderRouter);
    this.app.use("/api/payment-confirm", confirmPaymentRouter);
    this.app.use("/api/send-reminder", orderReminderRouter);
    this.app.use("/api/reviews", reviewRouter);
    this.app.use("/api/payment", paymentRouter);
    this.app.use("/api/report", reportRouter);
    this.app.use("/api/reports/availability", calenderRouter);
    this.app.get("/", (req: Request, res: Response) => {
      res.status(200).send("<h1>Welcome to Final Project Grand Lodge</h1>");
    });
  }

  private errorHandler(): void {
    this.app.use(
      (error: any, req: Request, res: Response, next: NextFunction) => {
        logger.error(error);
        res.status(error.statusCode || 500).json({
          success: false,
          message: error.message || "Internal Server Error",
        });
      }
    );
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`Server is Running on http://localhost:${PORT}`);
      startSchedulers();
    });
  }
}

export default App;
