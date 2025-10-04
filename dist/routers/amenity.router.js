"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const amenity_controller_1 = __importDefault(require("../controllers/amenity.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("../../prisma/generated/client");
const router = (0, express_1.Router)();
const tenantOnly = (0, auth_middleware_1.authMiddleware)([client_1.UserRole.TENANT]);
router.post('/', tenantOnly, amenity_controller_1.default.create);
router.get('/', tenantOnly, amenity_controller_1.default.getAll);
router.patch('/:id', tenantOnly, amenity_controller_1.default.update);
router.delete('/:id', tenantOnly, amenity_controller_1.default.delete);
exports.default = router;
