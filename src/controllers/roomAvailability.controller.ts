import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { RoomAvailabilityService } from '../services/roomAvailability.service';

export const RoomAvailabilityController = {
  getByMonth: async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.user?.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ message: 'Akses ditolak.' });
      }

      const { propertyId, roomId } = req.params;
      const { month, year } = req.query;

      const data = await RoomAvailabilityService.getMonthlyAvailability(
        tenantId,
        propertyId,
        roomId,
        Number(month),
        Number(year)
      );
      res.status(200).json({ data });
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

      await RoomAvailabilityService.updateAvailability(
        tenantId,
        propertyId,
        roomId,
        req.body
      );

      res.status(200).json({ message: 'Ketersediaan dan harga kamar berhasil diperbarui.' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
};