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
exports.RoomAvailabilityController = void 0;
const roomAvailability_service_1 = require("../services/roomAvailability.service");
exports.RoomAvailabilityController = {
    getByMonth: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const tenantId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenant) === null || _b === void 0 ? void 0 : _b.id;
            if (!tenantId) {
                return res.status(403).json({ message: 'Akses ditolak.' });
            }
            const { propertyId, roomId } = req.params;
            const { month, year } = req.query;
            const data = yield roomAvailability_service_1.RoomAvailabilityService.getMonthlyAvailability(tenantId, propertyId, roomId, Number(month), Number(year));
            res.status(200).json({ data });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const tenantId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenant) === null || _b === void 0 ? void 0 : _b.id;
            if (!tenantId) {
                return res.status(403).json({ message: 'Akses ditolak.' });
            }
            const { propertyId, roomId } = req.params;
            yield roomAvailability_service_1.RoomAvailabilityService.updateAvailability(tenantId, propertyId, roomId, req.body);
            res.status(200).json({ message: 'Ketersediaan dan harga kamar berhasil diperbarui.' });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
};
