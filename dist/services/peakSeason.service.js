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
const peakSeason_repository_1 = __importDefault(require("../repositories/peakSeason.repository"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const date_fns_1 = require("date-fns");
class PeakSeasonService {
    createSeason(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const startDate = (0, date_fns_1.startOfDay)(new Date(data.startDate));
            const endDate = (0, date_fns_1.endOfDay)(new Date(data.endDate));
            if ((0, date_fns_1.isBefore)(endDate, startDate)) {
                throw new apiError_1.default(400, 'End date must be after start date.');
            }
            if (data.adjustmentValue === undefined || data.adjustmentValue <= 0) {
                throw new apiError_1.default(400, 'Adjustment value must be a positive number.');
            }
            const adjustedData = Object.assign(Object.assign({}, data), { startDate,
                endDate });
            return peakSeason_repository_1.default.create(adjustedData);
        });
    }
    getSeasonsByRoom(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return peakSeason_repository_1.default.findByRoomId(roomId);
        });
    }
    updateSeason(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield peakSeason_repository_1.default.findById(id);
            if (!existing) {
                throw new apiError_1.default(404, "Peak season not found.");
            }
            const adjustedUpdateData = Object.assign({}, data);
            if (data.startDate) {
                adjustedUpdateData.startDate = (0, date_fns_1.startOfDay)(new Date(data.startDate));
            }
            if (data.endDate) {
                adjustedUpdateData.endDate = (0, date_fns_1.endOfDay)(new Date(data.endDate));
            }
            if (adjustedUpdateData.startDate && adjustedUpdateData.endDate && (0, date_fns_1.isBefore)(new Date(adjustedUpdateData.endDate), new Date(adjustedUpdateData.startDate))) {
                throw new apiError_1.default(400, 'Start date must be before end date.');
            }
            return peakSeason_repository_1.default.update(id, adjustedUpdateData);
        });
    }
    deleteSeason(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield peakSeason_repository_1.default.findById(id);
            if (!existing) {
                throw new apiError_1.default(404, "Peak season not found.");
            }
            return peakSeason_repository_1.default.delete(id);
        });
    }
}
exports.default = new PeakSeasonService();
