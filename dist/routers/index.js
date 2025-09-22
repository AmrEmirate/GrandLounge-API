"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_router_1 = __importDefault(require("./auth.router"));
const property_router_1 = __importDefault(require("./property.router"));
const user_router_1 = __importDefault(require("./user.router"));
const category_router_1 = __importDefault(require("./category.router"));
const peakSeason_router_1 = __importDefault(require("./peakSeason.router"));
const router = (0, express_1.Router)();
router.use('/auth', auth_router_1.default);
router.use('/properties', property_router_1.default);
router.use('/user', user_router_1.default);
router.use('/categories', category_router_1.default);
router.use('/peak-seasons', peakSeason_router_1.default);
exports.default = router;
