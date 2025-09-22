"use strict";
// src/routers/room.router.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const room_controller_1 = require("../controllers/room.controller");
const roomAvailability_router_1 = __importDefault(require("./roomAvailability.router"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("../../prisma/generated/client");
const router = (0, express_1.Router)({ mergeParams: true });
const tenantOnly = (0, auth_middleware_1.authMiddleware)([client_1.UserRole.TENANT]);
router.get('/:roomId/availability-by-month', tenantOnly, room_controller_1.RoomController.getMonthlyAvailability);
router.post('/', tenantOnly, room_controller_1.RoomController.create);
router.get('/', tenantOnly, room_controller_1.RoomController.getAllByProperty);
router.get('/:roomId', tenantOnly, room_controller_1.RoomController.getById);
router.patch('/:roomId', tenantOnly, room_controller_1.RoomController.update);
router.delete('/:roomId', tenantOnly, room_controller_1.RoomController.delete);
router.use('/:roomId/availability', roomAvailability_router_1.default);
exports.default = router;
