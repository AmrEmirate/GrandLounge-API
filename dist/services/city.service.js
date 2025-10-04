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
const city_repository_1 = __importDefault(require("../repositories/city.repository"));
const prisma_1 = require("../config/prisma");
const geocoding_service_1 = __importDefault(require("./geocoding.service"));
const apiError_1 = __importDefault(require("../utils/apiError"));
class CityService {
    createCity(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingCity = yield prisma_1.prisma.city.findFirst({
                where: {
                    name: data.name,
                    deletedAt: null
                },
            });
            if (existingCity) {
                throw new apiError_1.default(409, 'Nama kota sudah ada.'); // 409 Conflict
            }
            const { latitude, longitude } = yield geocoding_service_1.default.getFromAddress(`${data.name}, ${data.provinsi}`);
            if (latitude === null || longitude === null) {
                throw new apiError_1.default(500, 'Gagal mendapatkan data geolokasi untuk kota ini.');
            }
            const cityData = Object.assign(Object.assign({}, data), { latitude, longitude });
            return yield city_repository_1.default.create(cityData);
        });
    }
    getAllCities() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield city_repository_1.default.findAll();
        });
    }
    updateCity(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const city = yield city_repository_1.default.findById(id);
            if (!city) {
                throw new apiError_1.default(404, 'Kota tidak ditemukan.'); // 404 Not Found
            }
            return yield city_repository_1.default.update(id, data);
        });
    }
    deleteCity(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const city = yield city_repository_1.default.findById(id);
            if (!city) {
                throw new apiError_1.default(404, 'Kota tidak ditemukan.'); // 404 Not Found
            }
            return yield city_repository_1.default.delete(id);
        });
    }
}
exports.default = new CityService();
