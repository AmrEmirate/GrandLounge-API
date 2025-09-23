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
exports.CalenderReportController = void 0;
const CalenderReport_service_1 = require("../services/CalenderReport.service");
const apiError_1 = __importDefault(require("../utils/apiError"));
const prisma_1 = require("../config/prisma");
class CalenderReportController {
    getAvailabilityReport(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!res.locals.descript || !res.locals.descript.id) {
                    throw new apiError_1.default(401, "Unauthorized: User data not found in token.");
                }
                const userId = res.locals.descript.id;
                const tenant = yield prisma_1.prisma.tenant.findUnique({
                    where: { userId: userId },
                    select: { id: true }
                });
                if (!tenant) {
                    throw new apiError_1.default(403, "Tenant data not found for this user.");
                }
                const tenantId = tenant.id;
                const { propertyId, roomId } = req.params;
                const { startDate, endDate } = req.query;
                if (!startDate || !endDate) {
                    throw new apiError_1.default(400, "startDate and endDate are required.");
                }
                const reportData = yield (0, CalenderReport_service_1.getCalenderReport)(tenantId, propertyId, roomId, new Date(startDate), new Date(endDate));
                res.status(200).json({
                    success: true,
                    message: "Laporan ketersediaan properti berhasil diambil.",
                    data: reportData
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getPropertyReport(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!res.locals.descript || !res.locals.descript.id) {
                    throw new apiError_1.default(401, "Unauthorized: User data not found in token.");
                }
                const userId = res.locals.descript.id;
                const tenant = yield prisma_1.prisma.tenant.findUnique({
                    where: { userId: userId }, // Gunakan userId, bukan seluruh objek user
                    select: { id: true }
                });
                if (!tenant) {
                    throw new apiError_1.default(403, "Tenant data not found for this user.");
                }
                const tenantId = tenant.id;
                const { propertyId } = req.params;
                const { startDate, endDate } = req.query;
                if (!startDate || !endDate) {
                    throw new apiError_1.default(400, "startDate and endDate are required.");
                }
                // Panggil service yang benar untuk data agregat
                const reportData = yield (0, CalenderReport_service_1.getAggregatedPropertyReport)(tenant.id, propertyId, new Date(startDate), new Date(endDate));
                res.status(200).json({
                    success: true,
                    message: "Laporan ketersediaan properti berhasil diambil.",
                    data: reportData
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.CalenderReportController = CalenderReportController;
