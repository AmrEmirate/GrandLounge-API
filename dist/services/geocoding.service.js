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
const axios_1 = __importDefault(require("axios"));
const apiError_1 = __importDefault(require("../utils/apiError"));
class GeocodingService {
    getFromAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const apiKey = process.env.OPENCAGE_API_KEY;
                if (!apiKey) {
                    console.error("OPENCAGE_API_KEY is not set in environment variables.");
                    throw new apiError_1.default(500, "Geocoding service is not configured.");
                }
                const response = yield axios_1.default.get('https://api.opencagedata.com/geocode/v1/json', {
                    params: {
                        q: address,
                        key: apiKey,
                        limit: 1,
                    },
                });
                if (response.data && response.data.results.length > 0) {
                    const coords = response.data.results[0].geometry;
                    return { latitude: coords.lat, longitude: coords.lng };
                }
                return { latitude: null, longitude: null };
            }
            catch (error) {
                console.error("Error fetching geocoding data:", error);
                throw new apiError_1.default(500, 'Gagal mengambil data geolokasi.');
            }
        });
    }
}
exports.default = new GeocodingService();
