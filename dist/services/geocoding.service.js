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
exports.GeocodingService = void 0;
const axios_1 = __importDefault(require("axios"));
exports.GeocodingService = {
    getFromAddress: (address) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get('https://api.opencagedata.com/geocode/v1/json', {
                params: {
                    q: address,
                    key: process.env.OPENCAGE_API_KEY,
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
            return { latitude: null, longitude: null };
        }
    }),
};
