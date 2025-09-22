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
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const jwt_1 = require("../utils/jwt");
exports.UserController = {
    updateProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const updatedUser = yield user_service_1.UserService.updateProfile(userId, req.body, req.file);
            res.status(200).json({ message: 'Profil berhasil diperbarui.', data: updatedUser });
        }
        catch (error) {
            res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
        }
    }),
    updatePassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            yield user_service_1.UserService.updatePassword(userId, req.body);
            res.status(200).json({ message: 'Password berhasil diperbarui.' });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    requestEmailChange: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            yield user_service_1.UserService.requestEmailChange(userId, req.body.newEmail);
            res.status(200).json({ message: 'Email konfirmasi telah dikirim ke alamat email lama Anda.' });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    confirmEmailChange: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { token, newEmail } = req.body;
            const updatedUser = yield user_service_1.UserService.confirmEmailChange(token, newEmail);
            const payload = {
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
                verified: updatedUser.verified,
            };
            const accessToken = (0, jwt_1.generateToken)(payload);
            res.status(200).json({
                message: 'Email berhasil diubah dan sesi Anda telah diperbarui.',
                token: accessToken
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
};
