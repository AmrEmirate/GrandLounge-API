import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Application, Request, Response, NextFunction } from "express";
import logger from "./utils/logger";

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
    }

    private routes(): void {
        this.app.get("/", (req: Request, res: Response) => {
            res.status(200).json("<h1>Welcome to Final Project</h1>")
        })
    }

    private errorHandler(): void {
        this.app.use((error: any, req: Request, res: Response, next: NextFunction) => {
            logger.error(
                `${req.method} ${req.path}: ${error.message} ${JSON.stringify(error)}`
            );
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message || "Internal Server Error"
            });
        });
    }

    public start(): void {
        this.app.listen(PORT, () => {
            console.log(`Server is Running on http://localhost:${PORT}`);
        });
    }
}

export default App