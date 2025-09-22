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
exports.RoomController = void 0;
const room_service_1 = require("../services/room.service");
const roomAvailability_service_1 = require("../services/roomAvailability.service");
exports.RoomController = {
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const tenantId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenant) === null || _b === void 0 ? void 0 : _b.id;
            if (!tenantId) {
                return res.status(403).json({ message: 'Akses ditolak.' });
            }
            const { propertyId } = req.params;
            const room = yield room_service_1.RoomService.createRoom(tenantId, propertyId, req.body);
            res.status(201).json({ message: 'Kamar berhasil dibuat.', data: room });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    getAllByProperty: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const tenantId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenant) === null || _b === void 0 ? void 0 : _b.id;
            if (!tenantId) {
                return res.status(403).json({ message: 'Akses ditolak.' });
            }
            const { propertyId } = req.params;
            const rooms = yield room_service_1.RoomService.getRoomsByProperty(tenantId, propertyId);
            res.status(200).json({ data: rooms });
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }),
    getById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const tenantId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenant) === null || _b === void 0 ? void 0 : _b.id;
            if (!tenantId) {
                return res.status(403).json({ message: 'Akses ditolak.' });
            }
            const { propertyId, roomId } = req.params;
            const room = yield room_service_1.RoomService.getRoomById(tenantId, propertyId, roomId);
            if (!room) {
                return res.status(404).json({ message: 'Kamar tidak ditemukan.' });
            }
            res.status(200).json({ data: room });
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
            const room = yield room_service_1.RoomService.updateRoom(tenantId, propertyId, roomId, req.body);
            res.status(200).json({ message: 'Kamar berhasil diperbarui.', data: room });
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }),
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const tenantId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenant) === null || _b === void 0 ? void 0 : _b.id;
            if (!tenantId) {
                return res.status(403).json({ message: 'Akses ditolak.' });
            }
            const { propertyId, roomId } = req.params;
            yield room_service_1.RoomService.deleteRoom(tenantId, propertyId, roomId);
            res.status(200).json({ message: 'Kamar berhasil dihapus.' });
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }),
    getMonthlyAvailability: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const tenantId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenant) === null || _b === void 0 ? void 0 : _b.id;
            if (!tenantId) {
                return res.status(403).json({ message: 'Akses ditolak.' });
            }
            const { propertyId, roomId } = req.params;
            const { month, year } = req.query;
            if (!month || !year) {
                return res.status(400).json({ message: 'Parameter bulan dan tahun dibutuhkan.' });
            }
            const availability = yield roomAvailability_service_1.RoomAvailabilityService.getMonthlyAvailability(tenantId, propertyId, roomId, Number(month), Number(year));
            res.status(200).json({ data: availability });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
};
