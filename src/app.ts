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
        const uploadPayment = new UploadPaymentRouter();

        this.app.get("/", (req: Request, res: Response) => {

            res.status(200).send("<h1>Welcome to Final Project</h1>");
        });

        this.app.use("/api", mainRouter); 

        // upload payment proof
        this.app.use("/payments", uploadPayment.getRouter());

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