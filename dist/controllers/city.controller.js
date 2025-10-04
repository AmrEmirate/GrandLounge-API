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
const city_service_1 = __importDefault(require("../services/city.service"));
class CityController {
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const city = yield city_service_1.default.createCity(req.body);
                res.status(201).json({ message: 'Kota berhasil dibuat.', data: city });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAll(_req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cities = yield city_service_1.default.getAllCities();
                res.status(200).json({ data: cities });
            }
            catch (error) {
                next(error);
            }
        });
    }
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const city = yield city_service_1.default.updateCity(req.params.id, req.body);
                res.status(200).json({ message: 'Kota berhasil diperbarui.', data: city });
            }
            catch (error) {
                next(error);
            }
        });
    }
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield city_service_1.default.deleteCity(req.params.id);
                res.status(200).json({ message: 'Kota berhasil dihapus.' });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new CityController();
