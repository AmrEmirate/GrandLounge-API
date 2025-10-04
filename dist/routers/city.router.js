"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routers/city.router.ts
const express_1 = require("express");
const city_controller_1 = __importDefault(require("../controllers/city.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("../../prisma/generated/client");
const router = (0, express_1.Router)();
const allAuthenticated = (0, auth_middleware_1.authMiddleware)(); // Middleware untuk semua yang sudah login
const tenantOnly = (0, auth_middleware_1.authMiddleware)([client_1.UserRole.TENANT]); // Middleware khusus tenant
// Endpoint publik untuk mengambil semua kota
router.get('/', city_controller_1.default.getAll);
// Endpoint terproteksi hanya untuk tenant
router.post('/', tenantOnly, city_controller_1.default.create);
router.patch('/:id', tenantOnly, city_controller_1.default.update);
router.delete('/:id', tenantOnly, city_controller_1.default.delete);
exports.default = router;
