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
const room_service_1 = __importDefault(require("../services/room.service"));
const roomAvailability_service_1 = require("../services/roomAvailability.service");
const apiError_1 = __importDefault(require("../utils/apiError"));
class RoomController {
    constructor() {
        this.getTenantIdFromRequest = (req) => {
            var _a, _b;
            const tenantId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenant) === null || _b === void 0 ? void 0 : _b.id;
            if (!tenantId) {
                throw new apiError_1.default(403, 'Akses ditolak. Akun ini bukan tenant.');
            }
            return tenantId;
        };
        this.create = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const tenantId = this.getTenantIdFromRequest(req);
                const { propertyId } = req.params;
                const room = yield room_service_1.default.createRoom(tenantId, propertyId, req.body);
                res.status(201).json({ message: 'Kamar berhasil dibuat.', data: room });
            }
            catch (error) {
                next(error);
            }
        });
        this.getAllByProperty = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const tenantId = this.getTenantIdFromRequest(req);
                const { propertyId } = req.params;
                const rooms = yield room_service_1.default.getRoomsByProperty(tenantId, propertyId);
                res.status(200).json({ data: rooms });
            }
            catch (error) {
                next(error);
            }
        });
        this.getById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const tenantId = this.getTenantIdFromRequest(req);
                const { propertyId, roomId } = req.params;
                const room = yield room_service_1.default.getRoomById(tenantId, propertyId, roomId);
                if (!room) {
                    throw new apiError_1.default(404, 'Kamar tidak ditemukan.');
                }
                res.status(200).json({ data: room });
            }
            catch (error) {
                next(error);
            }
        });
        this.update = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const tenantId = this.getTenantIdFromRequest(req);
                const { propertyId, roomId } = req.params;
                const room = yield room_service_1.default.updateRoom(tenantId, propertyId, roomId, req.body);
                res.status(200).json({ message: 'Kamar berhasil diperbarui.', data: room });
            }
            catch (error) {
                next(error);
            }
        });
        this.delete = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const tenantId = this.getTenantIdFromRequest(req);
                const { propertyId, roomId } = req.params;
                yield room_service_1.default.deleteRoom(tenantId, propertyId, roomId);
                res.status(200).json({ message: 'Kamar berhasil dihapus.' });
            }
            catch (error) {
                next(error);
            }
        });
        this.getMonthlyAvailability = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const tenantId = this.getTenantIdFromRequest(req);
                const { propertyId, roomId } = req.params;
                const { month, year } = req.query;
                if (!month || !year) {
                    throw new apiError_1.default(400, 'Parameter bulan dan tahun dibutuhkan.');
                }
                const availability = yield roomAvailability_service_1.RoomAvailabilityService.getMonthlyAvailability(tenantId, propertyId, roomId, Number(month), Number(year));
                res.status(200).json({ data: availability });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new RoomController();
