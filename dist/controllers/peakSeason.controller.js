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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeakSeasonController = void 0;
const peakSeason_service_1 = require("../services/peakSeason.service");
const apiError_1 = __importDefault(require("../utils/apiError")); // Pastikan untuk import ApiError
exports.PeakSeasonController = {
    create: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { name, startDate, endDate, adjustmentType, adjustmentValue, roomId } = req.body;
            // VALIDASI BARU: Tambahkan pengecekan roomId di sini
            if (!roomId) {
                throw new apiError_1.default(400, 'Request body harus menyertakan roomId.');
            }
            const payload = {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                adjustmentType,
                adjustmentValue: parseFloat(adjustmentValue),
                roomId
            };
            const season = yield peakSeason_service_1.PeakSeasonService.createSeason(payload);
            res.status(201).json({ message: 'Peak season created', data: season });
        }
        catch (error) {
            next(error);
        }
    }),
    getByRoom: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { roomId } = req.params;
            const seasons = yield peakSeason_service_1.PeakSeasonService.getSeasonsByRoom(roomId);
            res.status(200).json({ data: seasons });
        }
        catch (error) {
            next(error);
        }
    }),
    update: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const _a = req.body, { startDate, endDate, adjustmentValue } = _a, otherData = __rest(_a, ["startDate", "endDate", "adjustmentValue"]);
            const updateData = Object.assign({}, otherData);
            if (startDate) {
                updateData.startDate = new Date(startDate);
            }
            if (endDate) {
                updateData.endDate = new Date(endDate);
            }
            if (adjustmentValue !== undefined) {
                updateData.adjustmentValue = parseFloat(adjustmentValue);
            }
            const season = yield peakSeason_service_1.PeakSeasonService.updateSeason(id, updateData);
            res.status(200).json({ message: 'Peak season updated', data: season });
        }
        catch (error) {
            next(error);
        }
    }),
    delete: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield peakSeason_service_1.PeakSeasonService.deleteSeason(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    })
};
