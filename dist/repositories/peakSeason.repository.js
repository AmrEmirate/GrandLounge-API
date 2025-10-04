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
const prisma_1 = require("../config/prisma");
const apiError_1 = __importDefault(require("../utils/apiError"));
class PeakSeasonRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { roomId } = data, peakSeasonData = __rest(data, ["roomId"]);
            if (!roomId) {
                throw new apiError_1.default(400, 'roomId wajib diisi untuk membuat peak season.');
            }
            return prisma_1.prisma.peakSeason.create({
                data: Object.assign(Object.assign({}, peakSeasonData), { room: {
                        connect: {
                            id: roomId,
                        },
                    } }),
            });
        });
    }
    findByRoomId(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.peakSeason.findMany({
                where: { roomId },
                orderBy: { startDate: 'asc' },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.peakSeason.findUnique({ where: { id } });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.peakSeason.update({
                where: { id },
                data,
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.peakSeason.delete({ where: { id } });
        });
    }
}
exports.default = new PeakSeasonRepository();
