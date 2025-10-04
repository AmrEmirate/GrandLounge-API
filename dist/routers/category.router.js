"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routers/category.router.ts
const express_1 = require("express");
const category_controller_1 = __importDefault(require("../controllers/category.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("../../prisma/generated/client");
const router = (0, express_1.Router)();
const allAuthenticated = (0, auth_middleware_1.authMiddleware)(); // Middleware untuk semua yang sudah login
const tenantOnly = (0, auth_middleware_1.authMiddleware)([client_1.UserRole.TENANT]); // Middleware khusus tenant
// Endpoint ini sekarang bisa diakses semua user yang sudah login
// Endpoint ini sekarang bisa diakses oleh publik
router.get('/', category_controller_1.default.getAll);
// Endpoint ini tetap hanya untuk tenant
router.post('/', tenantOnly, category_controller_1.default.create);
router.get('/:id', tenantOnly, category_controller_1.default.getById);
router.patch('/:id', tenantOnly, category_controller_1.default.update);
router.delete('/:id', tenantOnly, category_controller_1.default.delete);
exports.default = router;
