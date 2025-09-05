import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { RoomService } from '../services/room.service';
import { RoomAvailabilityService } from '../services/roomAvailability.service';

export const RoomController = {
  create: async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.user?.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ message: 'Akses ditolak.' });
      }
      const { propertyId } = req.params;
      const room = await RoomService.createRoom(tenantId, propertyId, req.body);
      res.status(201).json({ message: 'Kamar berhasil dibuat.', data: room });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getAllByProperty: async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.user?.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ message: 'Akses ditolak.' });
      }
      const { propertyId } = req.params;
      const rooms = await RoomService.getRoomsByProperty(tenantId, propertyId);
      res.status(200).json({ data: rooms });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  },

  getById: async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.user?.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ message: 'Akses ditolak.' });
      }
      const { propertyId, roomId } = req.params;
      const room = await RoomService.getRoomById(tenantId, propertyId, roomId);
      if (!room) {
        return res.status(404).json({ message: 'Kamar tidak ditemukan.' });
      }
      res.status(200).json({ data: room });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = req.user?.tenant?.id;
        if (!tenantId) {
            return res.status(403).json({ message: 'Akses ditolak.' });
        }
        const { propertyId, roomId } = req.params;
        const room = await RoomService.updateRoom(tenantId, propertyId, roomId, req.body);
        res.status(200).json({ message: 'Kamar berhasil diperbarui.', data: room });
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
  },

  delete: async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = req.user?.tenant?.id;
        if (!tenantId) {
            return res.status(403).json({ message: 'Akses ditolak.' });
        }
        const { propertyId, roomId } = req.params;
        await RoomService.deleteRoom(tenantId, propertyId, roomId);
        res.status(200).json({ message: 'Kamar berhasil dihapus.' });
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
  },

  uploadGallery: async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = req.user?.tenant?.id;
        if (!tenantId) throw new Error('Akses ditolak');

        const { propertyId, roomId } = req.params;
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            throw new Error('Tidak ada file yang diunggah');
        }

        const room = await RoomService.uploadRoomGallery(
            tenantId,
            propertyId,
            roomId,
            files
        );
        res.status(200).json({ message: 'Gambar galeri kamar berhasil diunggah', data: room });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
  },

  getMonthlyAvailability: async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.user?.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ message: 'Akses ditolak.' });
      }

      const { propertyId, roomId } = req.params;
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({ message: 'Parameter bulan dan tahun dibutuhkan.' });
      }

      const availability = await RoomAvailabilityService.getMonthlyAvailability(
        tenantId, propertyId, roomId, Number(month), Number(year)
      );
      res.status(200).json({ data: availability });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
};