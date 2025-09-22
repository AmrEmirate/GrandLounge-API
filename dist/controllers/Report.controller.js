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
const Report_service_1 = require("../services/Report.service");
const apiError_1 = __importDefault(require("../utils/apiError"));
const prisma_1 = require("../config/prisma");
const Report_repositori_1 = __importDefault(require("../repositories/Report.repositori"));
const reportRepo = new Report_repositori_1.default();
class ReportController {
    getDashboardWidgetData(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const tenant = yield prisma_1.prisma.tenant.findUnique({ where: { userId } });
                if (!tenant) {
                    throw new apiError_1.default(403, "Tenant account not found.");
                }
                const widgetData = yield (0, Report_service_1.getDashboardWidgets)(tenant.id);
                res.status(200).json({
                    success: true,
                    message: "Dashboard widget data fetched successfully.",
                    data: widgetData,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSalesReport(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                console.log('--- [CONTROLLER] Menerima Query Params ---');
                console.log(req.query);
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const tenant = yield prisma_1.prisma.tenant.findUnique({
                    where: { userId: userId },
                    select: { id: true },
                });
                if (!tenant) {
                    throw new apiError_1.default(403, "Tenant account not found.");
                }
                const reportData = yield (0, Report_service_1.getSalesByTenant)(tenant.id, req.query);
                res.status(200).json({
                    success: true,
                    message: "Laporan penjualan berhasil diambil.",
                    data: reportData,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getStatsReport(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const tenant = yield prisma_1.prisma.tenant.findUnique({
                    where: { userId: userId },
                    select: { id: true },
                });
                if (!tenant) {
                    throw new apiError_1.default(403, "Tenant account not found.");
                }
                const statsData = yield reportRepo.getTenantStats(tenant.id);
                res.status(200).json({
                    success: true,
                    message: "Statistik berhasil diambil.",
                    data: statsData,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = ReportController;
