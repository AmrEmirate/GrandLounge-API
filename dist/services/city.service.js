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
exports.CityService = void 0;
const city_repository_1 = require("../repositories/city.repository");
const prisma_1 = require("../config/prisma");
const geocoding_service_1 = require("./geocoding.service");
exports.CityService = {
    createCity: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const existingCity = yield prisma_1.prisma.city.findUnique({ where: { name: data.name } });
        if (existingCity) {
            throw new Error('Nama kota sudah ada.');
        }
        const { latitude, longitude } = yield geocoding_service_1.GeocodingService.getFromAddress(`${data.name}, ${data.provinsi}`);
        if (latitude === null || longitude === null) {
            throw new Error('Gagal mendapatkan data geolokasi untuk kota ini.');
        }
        const cityData = Object.assign(Object.assign({}, data), { latitude, longitude });
        return yield city_repository_1.CityRepository.create(cityData);
    }),
    getAllCities: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield city_repository_1.CityRepository.findAll();
    }),
    // --- PERUBAHAN DI BAWAH INI ---
    updateCity: (id, data) => __awaiter(void 0, void 0, void 0, function* () {
        const city = yield city_repository_1.CityRepository.findById(id);
        if (!city) {
            throw new Error('Kota tidak ditemukan.');
        }
        // Opsional: Anda bisa menambahkan logika geocoding ulang di sini jika diperlukan
        return yield city_repository_1.CityRepository.update(id, data);
    }),
    deleteCity: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const city = yield city_repository_1.CityRepository.findById(id);
        if (!city) {
            throw new Error('Kota tidak ditemukan.');
        }
        return yield city_repository_1.CityRepository.delete(id);
    }),
    // --- AKHIR PERUBAHAN ---
};
