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
exports.AmenityController = void 0;
const amenity_service_1 = require("../services/amenity.service");
exports.AmenityController = {
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const amenity = yield amenity_service_1.AmenityService.createAmenity(req.body.name);
            res.status(201).json({ message: 'Fasilitas berhasil dibuat.', data: amenity });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    getAll: (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const amenities = yield amenity_service_1.AmenityService.getAllAmenities();
            res.status(200).json({ data: amenities });
        }
        catch (error) {
            res.status(500).json({ message: 'Gagal mengambil data fasilitas.' });
        }
    }),
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // ID sekarang adalah string (UUID), tidak perlu diubah ke Number
            const amenity = yield amenity_service_1.AmenityService.updateAmenity(req.params.id, req.body.name);
            res.status(200).json({ message: 'Fasilitas berhasil diperbarui.', data: amenity });
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }),
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // ID sekarang adalah string (UUID), tidak perlu diubah ke Number
            yield amenity_service_1.AmenityService.deleteAmenity(req.params.id);
            res.status(200).json({ message: 'Fasilitas berhasil dihapus.' });
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }),
};
