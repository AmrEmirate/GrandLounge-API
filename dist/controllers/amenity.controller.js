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
const amenity_service_1 = __importDefault(require("../services/amenity.service"));
class AmenityController {
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name } = req.body;
                if (!name) {
                    return res.status(400).json({ message: 'Amenity name is required.' });
                }
                const amenity = yield amenity_service_1.default.createAmenity(name);
                res.status(201).json({ message: 'Fasilitas berhasil dibuat.', data: amenity });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAll(_req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const amenities = yield amenity_service_1.default.getAllAmenities();
                res.status(200).json({ data: amenities });
            }
            catch (error) {
                next(error);
            }
        });
    }
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { name } = req.body;
                if (!name) {
                    return res.status(400).json({ message: 'Amenity name is required for update.' });
                }
                const amenity = yield amenity_service_1.default.updateAmenity(id, name);
                res.status(200).json({ message: 'Fasilitas berhasil diperbarui.', data: amenity });
            }
            catch (error) {
                next(error);
            }
        });
    }
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield amenity_service_1.default.deleteAmenity(id);
                res.status(200).json({ message: 'Fasilitas berhasil dihapus.' });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new AmenityController();
