// anesputro95/be-finpro-grandlounge/BE-FINPRO-GRANDLOUNGE-71dcef406648b8dffdf87ae9dcef94ae141ea86a/src/controllers/user.controller.ts

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';

export const UserController = {
  // Fungsi ini tidak ada perubahan
  updateProfile: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const updatedUser = await UserService.updateProfile(userId, req.body, req.file);
      res.status(200).json({ message: 'Profil berhasil diperbarui.', data: updatedUser });
    } catch (error: any) {
      res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
  },

  // Fungsi ini tidak ada perubahan
  updatePassword: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await UserService.updatePassword(userId, req.body);
      res.status(200).json({ message: 'Password berhasil diperbarui.' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // Fungsi ini tidak ada perubahan
  requestEmailChange: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      await UserService.requestEmailChange(userId, req.body.newEmail);
      res.status(200).json({ message: 'Email konfirmasi telah dikirim ke alamat email lama Anda.' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // --- KODE YANG DIPERBARUI ADA DI FUNGSI INI ---
  confirmEmailChange: async (req: Request, res: Response) => {
    try {
      const { token, newEmail } = req.body;
      
      // Menambahkan validasi input dasar
      if (!token || !newEmail) {
        return res.status(400).json({ message: "Token dan email baru diperlukan." });
      }
      
      // Memanggil service yang sekarang mengembalikan object berisi message dan token baru
      const result = await UserService.confirmEmailChange(token, newEmail);
      
      // Mengirimkan kembali token login baru ke frontend agar sesi tetap berjalan
      res.status(200).json({ 
        message: result.message, 
        token: result.token 
      });

    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
};