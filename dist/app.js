"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/App.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
// Impor Konfigurasi
require("./config/passport");
require("./scheduler");
// Impor Router dari Feature 1 
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const user_router_1 = __importDefault(require("./routers/user.router"));
const category_router_1 = __importDefault(require("./routers/category.router"));
const property_router_1 = __importDefault(require("./routers/property.router"));
const amenity_router_1 = __importDefault(require("./routers/amenity.router"));
const city_router_1 = __importDefault(require("./routers/city.router"));
const peakSeason_router_1 = __importDefault(require("./routers/peakSeason.router"));
// Impor Router dari Feature 2 
const uploadPayment_router_1 = __importDefault(require("./routers/uploadPayment.router"));
const roomReservation_router_1 = __importDefault(require("./routers/roomReservation.router"));
const orderList_router_1 = __importDefault(require("./routers/orderList.router"));
const cancelOrder_router_1 = __importDefault(require("./routers/cancelOrder.router"));
const confirmPayment_router_1 = __importDefault(require("./routers/confirmPayment.router"));
const orderReminder_router_1 = __importDefault(require("./routers/orderReminder.router"));
const report_router_1 = __importDefault(require("./routers/report.router"));
const calenderReport_router_1 = __importDefault(require("./routers/calenderReport.router"));
const index_1 = require("./scheduler/index");
const review_router_1 = __importDefault(require("./routers/review.router"));
const PORT = process.env.PORT || "2020";
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.configure();
        this.routes();
        this.errorHandler();
    }
    configure() {
        const corsOptions = {
            origin: 'http://localhost:3000',
            credentials: true,
        };
        this.app.use((0, cors_1.default)(corsOptions));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use(passport_1.default.initialize());
    }
    routes() {
        // --- ROUTER UNTUK FEATURE 1 (Amr) ---
        this.app.use('/api/auth', auth_router_1.default);
        this.app.use('/api/user', user_router_1.default);
        this.app.use('/api/categories', category_router_1.default);
        this.app.use('/api/properties', property_router_1.default);
        this.app.use('/api/amenities', amenity_router_1.default);
        this.app.use('/api/cities', city_router_1.default);
        this.app.use('/api/peak-seasons', peakSeason_router_1.default);
        // --- ROUTER UNTUK FEATURE 2 (Adi) 
        const reservationRouter = new roomReservation_router_1.default();
        const uploadPayment = new uploadPayment_router_1.default();
        const orderList = new orderList_router_1.default();
        const cancelOrder = new cancelOrder_router_1.default();
        const confirmPayment = new confirmPayment_router_1.default();
        const sendConfirm = new orderReminder_router_1.default();
        const review = new review_router_1.default();
        const report = new report_router_1.default();
        const calender = new calenderReport_router_1.default();
        this.app.use("/api/reservations", reservationRouter.getRouter());
        this.app.use("/api/payments", uploadPayment.getRouter());
        this.app.use("/api/orders", orderList.getRouter());
        this.app.use("/api/order-cancel", cancelOrder.getRouter());
        this.app.use("/api/payment-confirm", confirmPayment.getRouter());
        this.app.use("/api/send-reminder", sendConfirm.getRouter());
        this.app.use("/api/reviews", review.getRouter());
        this.app.use("/api/report", report.getRouter());
        this.app.use("/api/reports/availability", calender.getRouter());
        // Rute dasar
        this.app.get("/", (req, res) => {
            res.status(200).send("<h1>Welcome to Final Project Grand Lodge</h1>");
        });
    }
    errorHandler() {
        this.app.use((error, req, res, next) => {
            console.error(error);
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        });
    }
    start() {
        this.app.listen(PORT, () => {
            console.log(`Server is Running on http://localhost:${PORT}`);
            (0, index_1.startSchedulers)();
        });
    }
}
exports.default = App;
