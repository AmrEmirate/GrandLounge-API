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
const prisma_1 = require("../config/prisma");
const apiError_1 = __importDefault(require("../utils/apiError"));
class SocialAuthService {
    findOrCreateUser(provider, profile, emailExtractor, photoExtractor) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield prisma_1.prisma.user.findUnique({
                where: { provider_providerId: { provider, providerId: profile.id } },
            });
            if (existingUser) {
                return existingUser;
            }
            const email = emailExtractor(profile);
            if (!email) {
                throw new apiError_1.default(400, `Email tidak dapat diambil dari profil ${provider}. Pastikan email Anda publik.`);
            }
            const userByEmail = yield prisma_1.prisma.user.findUnique({ where: { email } });
            if (userByEmail) {
                throw new apiError_1.default(409, 'Email sudah terdaftar dengan metode lain (misalnya, password). Silakan login dengan cara tersebut.');
            }
            return prisma_1.prisma.user.create({
                data: {
                    email,
                    fullName: profile.displayName,
                    provider,
                    providerId: profile.id,
                    role: 'USER',
                    verified: true, // Akun dari social auth dianggap sudah terverifikasi
                    profilePicture: photoExtractor(profile),
                },
            });
        });
    }
    findOrCreateGoogleUser(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOrCreateUser('google', profile, p => { var _a, _b; return (_b = (_a = p.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value; }, p => { var _a, _b; return (_b = (_a = p.photos) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value; });
        });
    }
    findOrCreateFacebookUser(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOrCreateUser('facebook', profile, p => { var _a, _b; return (_b = (_a = p.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value; }, p => { var _a, _b, _c; return (_c = (_b = (_a = p.photos) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : null; });
        });
    }
    findOrCreateTwitterUser(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOrCreateUser('twitter', profile, p => { var _a, _b; return (_b = (_a = p.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value; }, p => { var _a, _b, _c; return (_c = (_b = (_a = p.photos) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value.replace('_normal', '')) !== null && _c !== void 0 ? _c : null; });
        });
    }
}
exports.default = new SocialAuthService();
