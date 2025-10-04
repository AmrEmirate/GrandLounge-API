"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routers/peakSeason.router.ts
const express_1 = require("express");
const peakSeason_controller_1 = __importDefault(require("../controllers/peakSeason.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("../../prisma/generated/client");
const router = (0, express_1.Router)();
const tenantOnly = (0, auth_middleware_1.authMiddleware)([client_1.UserRole.TENANT]);
// --- PERBAIKAN ---
// Route ini lebih standar. Frontend akan memanggil: GET /api/peak-seasons/by-room/{roomId}
// Ini lebih jelas menunjukkan bahwa kita mengambil data PeakSeason berdasarkan room.
router.get('/by-room/:roomId', tenantOnly, peakSeason_controller_1.default.getByRoom);
// Endpoint CRUD untuk peak season (ini sudah benar)
router.post('/', tenantOnly, peakSeason_controller_1.default.create);
router.put('/:id', tenantOnly, peakSeason_controller_1.default.update);
router.delete('/:id', tenantOnly, peakSeason_controller_1.default.delete);
exports.default = router;
