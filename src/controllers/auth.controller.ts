import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';
import ApiError from '../utils/apiError';

class AuthController {
    public async register(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await AuthService.registerUser(req.body);
            res.status(201).json({ message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.', data: user });
        } catch (error) {
            next(error);
        }
    }

    public async registerTenant(req: Request, res: Response, next: NextFunction) {
        try {
            const tenant = await AuthService.registerTenant(req.body);
            res.status(201).json({ message: 'Registrasi tenant berhasil. Silakan cek email Anda untuk verifikasi.', data: tenant });
        } catch (error) {
            next(error);
        }
    }

    public async verifyAndSetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, password } = req.body;
            await AuthService.verifyEmailAndSetPassword(token, password);
            res.status(200).json({ message: 'Akun berhasil diverifikasi. Silakan login.' });
        } catch (error) {
            next(error);
        }
    }

    public async resendVerification(req: Request, res: Response, next: NextFunction) {
        try {
            await AuthService.resendVerificationEmail(req.body.email);
            res.status(200).json({ message: 'Email verifikasi baru telah dikirim.' });
        } catch (error) {
            next(error);
        }
    }

    public async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { user, token } = await AuthService.login(req.body);
            res.status(200).json({ message: 'Login berhasil.', data: { user, token } });
        } catch (error) {
            next(error);
        }
    }

    public async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
        try {
            await AuthService.requestPasswordReset(req.body.email);
        } catch (error) {
            // Sengaja dikosongkan agar tidak memberitahu apakah email ada atau tidak
        } finally {
            res.status(200).json({ message: 'Jika email terdaftar dan menggunakan password, kami akan mengirimkan link reset.' });
        }
    }

    public async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, password } = req.body;
            await AuthService.resetPassword(token, password);
            res.status(200).json({ message: 'Password berhasil direset. Silakan login kembali.' });
        } catch (error) {
            next(error);
        }
    }

    public async confirmEmailChange(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, newEmail } = req.body;
            const { token: newToken } = await AuthService.confirmEmailChange(token, newEmail);

            res.status(200).json({
                message: 'Email berhasil diubah. Silakan verifikasi email baru Anda dari halaman profil.',
                token: newToken
            });
        } catch (error) {
            next(error);
        }
    }

    public async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new ApiError(401, 'Unauthorized');
            }
            const profile = await AuthService.getProfile(userId);
            res.status(200).json({ data: profile });
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();