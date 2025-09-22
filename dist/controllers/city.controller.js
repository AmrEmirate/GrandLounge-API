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
exports.CityController = void 0;
const city_service_1 = require("../services/city.service");
exports.CityController = {
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const city = yield city_service_1.CityService.createCity(req.body);
            res.status(201).json({ message: 'Kota berhasil dibuat.', data: city });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    getAll: (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const cities = yield city_service_1.CityService.getAllCities();
            res.status(200).json({ data: cities });
        }
        catch (error) {
            res.status(500).json({ message: 'Gagal mengambil data kota.' });
        }
    }),
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // ID diambil langsung sebagai string, tanpa konversi Number()
            const city = yield city_service_1.CityService.updateCity(req.params.id, req.body);
            res.status(200).json({ message: 'Kota berhasil diperbarui.', data: city });
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }),
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // ID diambil langsung sebagai string, tanpa konversi Number()
            yield city_service_1.CityService.deleteCity(req.params.id);
            res.status(200).json({ message: 'Kota berhasil dihapus.' });
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }),
};
