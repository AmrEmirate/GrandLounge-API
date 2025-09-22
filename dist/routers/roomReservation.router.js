"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RoomReservation_controller_1 = __importDefault(require("../controllers/RoomReservation.controller"));
const isUser_1 = require("../middleware/isUser");
const verifyToken_1 = require("../middleware/verifyToken");
const isTenant_1 = require("../middleware/isTenant");
class RoomReservationRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.reservationController = new RoomReservation_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // User melihat available room
        this.router.post("/check-available", verifyToken_1.verifyToken, isUser_1.isUser, this.reservationController.checkAvailableRoomsController);
        // User membuat reservasi baru
        this.router.post("/by-room-name", verifyToken_1.verifyToken, isUser_1.isUser, this.reservationController.createReservationByRoomNameController);
        // User melihat semua reservasi miliknya
        this.router.get("/reservations", verifyToken_1.verifyToken, isUser_1.isUser, this.reservationController.getUserReservationController);
        // User melihat detail reservasi by room name
        this.router.get("/by-room-name/:name", verifyToken_1.verifyToken, isUser_1.isUser, this.reservationController.getReservationByRoomNameController);
        // Tenant update status reservasi
        this.router.patch("/:id/status", verifyToken_1.verifyToken, isTenant_1.isTenant, this.reservationController.updateReservationStatusController);
    }
    getRouter() {
        return this.router;
    }
}
exports.default = RoomReservationRouter;
