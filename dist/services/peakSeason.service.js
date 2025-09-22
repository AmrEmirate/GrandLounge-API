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
exports.PeakSeasonService = void 0;
const peakSeason_repository_1 = require("../repositories/peakSeason.repository");
const apiError_1 = __importDefault(require("../utils/apiError"));
// Fungsi helper untuk menambahkan 1 hari (menggunakan UTC untuk konsistensi)
const addOneDayUTC = (date) => {
    const newDate = new Date(date);
    newDate.setUTCDate(newDate.getUTCDate() + 1);
    newDate.setUTCHours(0, 0, 0, 0); // Pastikan waktunya adalah awal hari
    return newDate;
};
exports.PeakSeasonService = {
    createSeason: (data) => __awaiter(void 0, void 0, void 0, function* () {
        // Validasi 1: Tanggal mulai harus sebelum tanggal selesai
        if (new Date(data.startDate) >= new Date(data.endDate)) {
            throw new apiError_1.default(400, 'Start date must be before end date.');
        }
        // Validasi 2: Nilai penyesuaian harga harus ada dan lebih besar dari 0
        if (data.adjustmentValue === undefined || data.adjustmentValue <= 0) {
            throw new apiError_1.default(400, 'Adjustment value must be a positive number.');
        }
        const adjustedData = Object.assign(Object.assign({}, data), { 
            // endDate sekarang adalah hari berikutnya dari yang dipilih
            endDate: addOneDayUTC(new Date(data.endDate)) });
        return peakSeason_repository_1.PeakSeasonRepository.create(adjustedData);
    }),
    getSeasonsByRoom: (roomId) => __awaiter(void 0, void 0, void 0, function* () {
        return peakSeason_repository_1.PeakSeasonRepository.findByRoomId(roomId);
    }),
    updateSeason: (id, data) => __awaiter(void 0, void 0, void 0, function* () {
        const existing = yield peakSeason_repository_1.PeakSeasonRepository.findById(id);
        if (!existing) {
            throw new apiError_1.default(404, "Peak season not found.");
        }
        const adjustedUpdateData = Object.assign({}, data);
        if (data.endDate) {
            // Terapkan logika yang sama untuk update
            adjustedUpdateData.endDate = addOneDayUTC(new Date(data.endDate));
        }
        return peakSeason_repository_1.PeakSeasonRepository.update(id, adjustedUpdateData);
    }),
    deleteSeason: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const existing = yield peakSeason_repository_1.PeakSeasonRepository.findById(id);
        if (!existing) {
            throw new apiError_1.default(404, "Peak season not found.");
        }
        return peakSeason_repository_1.PeakSeasonRepository.delete(id);
    }),
};
