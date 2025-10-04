"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../config/prisma");
const client_1 = require("../../prisma/generated/client");
const authMiddleware = (roles = []) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Akses ditolak, tidak ada token.' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
        }
        try {
            const user = yield prisma_1.prisma.user.findFirst({
                where: {
                    id: decoded.id,
                    deletedAt: null,
                },
                include: {
                    tenant: true,
                },
            });
            if (!user) {
                return res.status(401).json({ message: 'User tidak ditemukan.' });
            }
            if (!user.verified) {
                return res.status(403).json({ message: 'Akun Anda belum terverifikasi.' });
            }
            req.user = user;
            if (roles.length > 0) {
                if (!roles.includes(user.role)) {
                    return res.status(403).json({ message: 'Anda tidak memiliki hak akses untuk sumber daya ini.' });
                }
                if (roles.includes(client_1.UserRole.TENANT) && !user.tenant) {
                    return res.status(403).json({ message: 'Akses ditolak. Data tenant tidak ditemukan untuk akun ini.' });
                }
            }
            next();
        }
        catch (error) {
            res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
    });
};
exports.authMiddleware = authMiddleware;
