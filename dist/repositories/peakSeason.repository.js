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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeakSeasonRepository = void 0;
const prisma_1 = require("../config/prisma");
exports.PeakSeasonRepository = {
    create: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { roomId } = data, peakSeasonData = __rest(data, ["roomId"]);
        if (!roomId) {
            throw new Error('roomId wajib diisi untuk membuat peak season.');
        }
        return prisma_1.prisma.peakSeason.create({
            data: Object.assign(Object.assign({}, peakSeasonData), { room: {
                    connect: {
                        id: roomId,
                    },
                } }),
        });
    }),
    findByRoomId: (roomId) => __awaiter(void 0, void 0, void 0, function* () {
        return prisma_1.prisma.peakSeason.findMany({
            where: { roomId },
            orderBy: { startDate: 'asc' },
        });
    }),
    findById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        return prisma_1.prisma.peakSeason.findUnique({ where: { id } });
    }),
    update: (id, data) => __awaiter(void 0, void 0, void 0, function* () {
        return prisma_1.prisma.peakSeason.update({
            where: { id },
            data,
        });
    }),
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        return prisma_1.prisma.peakSeason.delete({ where: { id } });
    }),
};
