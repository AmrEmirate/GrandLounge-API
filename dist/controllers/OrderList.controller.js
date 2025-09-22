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
const OrderList_service_1 = require("../services/OrderList.service");
class OrderListController {
    orderList(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const filter = {
                    searchQuery: req.query.searchQuery,
                    propertyName: req.query.propertyName,
                    checkIn: req.query.checkIn ? new Date(req.query.checkIn) : undefined
                };
                const orderlist = yield (0, OrderList_service_1.OrderListService)(userId, filter);
                res.status(200).json({
                    success: true,
                    message: "Order list retrieved successfully",
                    data: orderlist
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    tenantTransactionList(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tenantId = req.user.tenant.id;
                const filter = {
                    searchQuery: req.query.searchQuery,
                    propertyId: req.query.propertyId,
                    checkIn: req.query.checkIn ? new Date(req.query.checkIn) : undefined,
                    status: req.query.status
                };
                const transactions = yield (0, OrderList_service_1.getTenantTransactionsService)(tenantId, filter);
                res.status(200).json({
                    success: true,
                    message: "Tenant transaction list retrieved successfully",
                    data: transactions
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    completeOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { bookingId } = req.params;
                const updatedOrder = yield (0, OrderList_service_1.completeOrderService)(userId, bookingId);
                res.status(200).json({
                    success: true,
                    message: "Order has been marked as completed.",
                    data: updatedOrder,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    pendingConfirmationList(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tenantId = req.user.tenant.id;
                const transactions = yield (0, OrderList_service_1.getPendingConfirmationService)(tenantId);
                res.status(200).json({
                    success: true,
                    message: "Pending confirmation list retrieved successfully",
                    data: transactions
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = OrderListController;
