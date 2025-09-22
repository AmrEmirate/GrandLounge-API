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
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
exports.AuthController = {
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield auth_service_1.AuthService.registerUser(req.body);
            res.status(201).json({ message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.', data: user });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    registerTenant: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tenant = yield auth_service_1.AuthService.registerTenant(req.body);
            res.status(201).json({ message: 'Registrasi tenant berhasil. Silakan cek email Anda untuk verifikasi.', data: tenant });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    verifyAndSetPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { token, password } = req.body;
            yield auth_service_1.AuthService.verifyEmailAndSetPassword(token, password);
            res.status(200).json({ message: 'Akun berhasil diverifikasi. Silakan login.' });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    resendVerification: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield auth_service_1.AuthService.resendVerificationEmail(req.body.email);
            res.status(200).json({ message: 'Email verifikasi baru telah dikirim.' });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { user, token } = yield auth_service_1.AuthService.login(req.body);
            res.status(200).json({ message: 'Login berhasil.', data: { user, token } });
        }
        catch (error) {
            res.status(401).json({ message: error.message });
        }
    }),
    requestPasswordReset: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield auth_service_1.AuthService.requestPasswordReset(req.body.email);
        }
        catch (error) {
            // sengaja dikosongkan agar tidak memberitahu apakah email ada atau tidak
        }
        finally {
            res.status(200).json({ message: 'Jika email terdaftar dan menggunakan password, kami akan mengirimkan link reset.' });
        }
    }),
    resetPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { token, password } = req.body;
            yield auth_service_1.AuthService.resetPassword(token, password);
            res.status(200).json({ message: 'Password berhasil direset. Silakan login kembali.' });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    confirmEmailChange: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { token, newEmail } = req.body;
            const { token: newToken } = yield auth_service_1.AuthService.confirmEmailChange(token, newEmail);
            res.status(200).json({
                message: 'Email berhasil diubah. Silakan verifikasi email baru Anda dari halaman profil.',
                token: newToken
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    getProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const profile = yield auth_service_1.AuthService.getProfile(userId);
            res.status(200).json({ data: profile });
        }
        catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }),
};
