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
const amenity_repository_1 = __importDefault(require("../repositories/amenity.repository"));
const prisma_1 = require("../config/prisma");
const apiError_1 = __importDefault(require("../utils/apiError"));
class AmenityService {
    createAmenity(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAmenity = yield prisma_1.prisma.amenity.findFirst({
                where: {
                    name,
                    deletedAt: null
                }
            });
            if (existingAmenity) {
                throw new apiError_1.default(409, 'Nama fasilitas sudah ada.'); // 409 Conflict
            }
            return yield amenity_repository_1.default.create(name);
        });
    }
    getAllAmenities() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield amenity_repository_1.default.findAll();
        });
    }
    updateAmenity(id, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const amenity = yield amenity_repository_1.default.findById(id);
            if (!amenity) {
                throw new apiError_1.default(404, 'Fasilitas tidak ditemukan.'); // 404 Not Found
            }
            return yield amenity_repository_1.default.update(id, name);
        });
    }
    deleteAmenity(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const amenity = yield amenity_repository_1.default.findById(id);
            if (!amenity) {
                throw new apiError_1.default(404, 'Fasilitas tidak ditemukan.'); // 404 Not Found
            }
            return yield amenity_repository_1.default.delete(id);
        });
    }
}
exports.default = new AmenityService();
