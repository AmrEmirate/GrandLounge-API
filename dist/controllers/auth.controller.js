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
const auth_service_1 = __importDefault(require("../services/auth.service"));
const apiError_1 = __importDefault(require("../utils/apiError"));
class AuthController {
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield auth_service_1.default.registerUser(req.body);
                res.status(201).json({ message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.', data: user });
            }
            catch (error) {
                next(error);
            }
        });
    }
    //
    registerTenant(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tenant = yield auth_service_1.default.registerTenant(req.body);
                res.status(201).json({ message: 'Registrasi tenant berhasil. Silakan cek email Anda untuk verifikasi.', data: tenant });
            }
            catch (error) {
                next(error);
            }
        });
    }
    verifyAndSetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, password } = req.body;
                yield auth_service_1.default.verifyEmailAndSetPassword(token, password);
                res.status(200).json({ message: 'Akun berhasil diverifikasi. Silakan login.' });
            }
            catch (error) {
                next(error);
            }
        });
    }
    resendVerification(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield auth_service_1.default.resendVerificationEmail(req.body.email);
                res.status(200).json({ message: 'Email verifikasi baru telah dikirim.' });
            }
            catch (error) {
                next(error);
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user, token } = yield auth_service_1.default.login(req.body);
                res.status(200).json({ message: 'Login berhasil.', data: { user, token } });
            }
            catch (error) {
                next(error);
            }
        });
    }
    requestPasswordReset(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield auth_service_1.default.requestPasswordReset(req.body.email);
            }
            catch (error) {
                // Sengaja dikosongkan agar tidak memberitahu apakah email ada atau tidak
            }
            finally {
                res.status(200).json({ message: 'Jika email terdaftar dan menggunakan password, kami akan mengirimkan link reset.' });
            }
        });
    }
    resetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, password } = req.body;
                yield auth_service_1.default.resetPassword(token, password);
                res.status(200).json({ message: 'Password berhasil direset. Silakan login kembali.' });
            }
            catch (error) {
                next(error);
            }
        });
    }
    confirmEmailChange(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, newEmail } = req.body;
                const { token: newToken } = yield auth_service_1.default.confirmEmailChange(token, newEmail);
                res.status(200).json({
                    message: 'Email berhasil diubah. Silakan verifikasi email baru Anda dari halaman profil.',
                    token: newToken
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new apiError_1.default(401, 'Unauthorized');
                }
                const profile = yield auth_service_1.default.getProfile(userId);
                res.status(200).json({ data: profile });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new AuthController();
