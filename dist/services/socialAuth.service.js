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
exports.SocialAuthService = void 0;
const prisma_1 = require("../config/prisma");
const _findOrCreateUser = (provider, profile, emailExtractor, photoExtractor) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield prisma_1.prisma.user.findUnique({
        where: { provider_providerId: { provider, providerId: profile.id } },
    });
    if (existingUser)
        return existingUser;
    const email = emailExtractor(profile);
    if (!email)
        throw new Error(`Email tidak ditemukan dari profil ${provider}.`);
    const userByEmail = yield prisma_1.prisma.user.findUnique({ where: { email } });
    if (userByEmail)
        throw new Error('Email sudah terdaftar dengan metode lain.');
    return prisma_1.prisma.user.create({
        data: {
            email,
            fullName: profile.displayName,
            provider,
            providerId: profile.id,
            role: 'USER',
            verified: true,
            profilePicture: photoExtractor(profile),
        },
    });
});
exports.SocialAuthService = {
    findOrCreateGoogleUser: (profile) => __awaiter(void 0, void 0, void 0, function* () {
        return _findOrCreateUser('google', profile, p => p.emails[0].value, p => p.photos[0].value);
    }),
    findOrCreateFacebookUser: (profile) => __awaiter(void 0, void 0, void 0, function* () {
        return _findOrCreateUser('facebook', profile, p => { var _a, _b; return (_b = (_a = p.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value; }, p => { var _a, _b, _c; return (_c = (_b = (_a = p.photos) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : null; });
    }),
    findOrCreateTwitterUser: (profile) => __awaiter(void 0, void 0, void 0, function* () {
        return _findOrCreateUser('twitter', profile, p => { var _a, _b; return (_b = (_a = p.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value; }, p => { var _a, _b, _c; return (_c = (_b = (_a = p.photos) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value.replace('_normal', '')) !== null && _c !== void 0 ? _c : null; });
    }),
};
