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
exports.getSalesByTenant = exports.getDashboardWidgets = void 0;
const prisma_1 = require("../config/prisma");
const Report_repositori_1 = __importDefault(require("../repositories/Report.repositori"));
const date_fns_1 = require("date-fns");
const reportRepo = new Report_repositori_1.default();
const getDashboardWidgets = (tenantId) => __awaiter(void 0, void 0, void 0, function* () {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);
    const dailySales = yield reportRepo.getSalesByDay(tenantId, startDate, endDate);
    const recentReviews = yield prisma_1.prisma.review.findMany({
        where: {
            property: {
                tenantId: tenantId,
            },
        },
        take: 3,
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            user: {
                select: {
                    fullName: true,
                    profilePicture: true,
                },
            },
        },
    });
    return {
        dailySales,
        recentReviews,
    };
});
exports.getDashboardWidgets = getDashboardWidgets;
const getSalesByTenant = (tenantId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const groupBy = query.groupBy;
    const sortBy = query.sortBy || "total";
    let startDate;
    let endDate;
    if (query.startDate && query.endDate) {
        startDate = (0, date_fns_1.startOfDay)(new Date(query.startDate));
        endDate = (0, date_fns_1.endOfDay)(new Date(query.endDate));
    }
    else {
        endDate = (0, date_fns_1.endOfDay)(new Date());
        startDate = (0, date_fns_1.startOfDay)(new Date(new Date().setDate(endDate.getDate() - 6)));
    }
    let salesReport;
    switch (groupBy) {
        case "property":
            salesReport = yield reportRepo.getSalesByProperty(tenantId, startDate, endDate, sortBy);
            break;
        case "user":
            salesReport = yield reportRepo.getSalesByUser(tenantId, startDate, endDate, sortBy);
            break;
        case "day":
            salesReport = yield reportRepo.getSalesByDay(tenantId, startDate, endDate);
            break;
        default:
            salesReport = yield reportRepo.getAggregateSales(tenantId, startDate, endDate);
            break;
    }
    return salesReport;
});
exports.getSalesByTenant = getSalesByTenant;
