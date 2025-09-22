"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const apiError_1 = __importDefault(require("../utils/apiError"));
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new apiError_1.default(401, "Authorization header missing or invalid");
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            throw new apiError_1.default(404, "Token is missing");
        }
        const decodedToken = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET || "fallback_secret");
        req.user = decodedToken;
        next();
    }
    catch (error) {
        if (error instanceof apiError_1.default) {
            next(error);
        }
        else {
            next(new apiError_1.default(401, "Invalid or expired token"));
        }
    }
};
exports.verifyToken = verifyToken;
