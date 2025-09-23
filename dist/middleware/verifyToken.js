"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const apiError_1 = __importDefault(require("../utils/apiError"));
const logger_1 = __importDefault(require("../utils/logger"));
const verifyToken = (req, res, next) => {
    var _a;
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new apiError_1.default(401, "Authorization header missing or invalid");
        }
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        console.log("TOKEN:", token);
        console.log("SECRET:", process.env.TOKEN_KEY);
        logger_1.default.info("Token:", token);
        if (!token) {
            throw new apiError_1.default(404, "Token is missing");
        }
        const checkToken = (0, jsonwebtoken_1.verify)(token, process.env.TOKEN_KEY || "fallback_secret");
        console.log("Decoded token:", checkToken);
        res.locals.descript = checkToken;
        next();
    }
    catch (error) {
        if (error instanceof apiError_1.default) {
            next(error);
        }
        else {
            res.status(500).send(error);
        }
    }
};
exports.verifyToken = verifyToken;
