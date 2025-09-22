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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTenant = void 0;
const apiError_1 = __importDefault(require("../utils/apiError"));
const prisma_1 = require("../config/prisma");
// Gunakan tipe AuthRequest agar TypeScript mengenali req.user
const isTenant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user || user.role !== 'TENANT') {
            return next(new apiError_1.default(403, "Forbidden: Access is restricted to tenants."));
        }
        // 🛠️ PERBAIKAN KUNCI: Ambil data tenant dari database
        const tenant = yield prisma_1.prisma.tenant.findUnique({
            where: {
                userId: user.id
            }
        });
        // Jika karena suatu alasan profil tenant tidak ditemukan
        if (!tenant) {
            return next(new apiError_1.default(403, "Forbidden: Tenant profile not found for this user."));
        }
        // Simpan informasi tenant yang sudah diambil ke dalam req.user
        // agar bisa diakses oleh controller
        req.user.tenant = tenant;
        // Lanjutkan ke controller
        next();
    }
    catch (error) {
        next(new apiError_1.default(500, "Internal server error during tenant verification."));
    }
});
exports.isTenant = isTenant;
