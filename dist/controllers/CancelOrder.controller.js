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
exports.CancelOrderControllers = void 0;
const CancelOrder_service_1 = require("../services/CancelOrder.service");
class CancelOrderControllers {
    cancelOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { invoice } = req.params;
                const user = req.user;
                const userId = user.id;
                const isTenant = user.role === 'TENANT';
                const canceledOrder = yield (0, CancelOrder_service_1.CancelOrderService)(invoice, userId, isTenant);
                res.status(200).json({
                    success: true,
                    message: "Order has been canceled successfully",
                    data: canceledOrder
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.CancelOrderControllers = CancelOrderControllers;
