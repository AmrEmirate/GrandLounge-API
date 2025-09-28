import { Request, Response, NextFunction } from 'express';
import PeakSeasonService from '../services/peakSeason.service';
import ApiError from '../utils/apiError';

class PeakSeasonController {
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, startDate, endDate, adjustmentType, adjustmentValue, roomId } = req.body;

      if (!roomId) {
        throw new ApiError(400, 'Request body harus menyertakan roomId.');
      }
      
      const payload = {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        adjustmentType,
        adjustmentValue: parseFloat(adjustmentValue),
        roomId
      };

      const season = await PeakSeasonService.createSeason(payload);
      res.status(201).json({ message: 'Peak season berhasil dibuat.', data: season });
    } catch (error) {
      next(error);
    }
  }

  public async getByRoom(req: Request, res: Response, next: NextFunction) {
    try {
        const { roomId } = req.params;
        const seasons = await PeakSeasonService.getSeasonsByRoom(roomId);
        res.status(200).json({ data: seasons });
    } catch (error) {
        next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
      try {
          const { id } = req.params;
          const { startDate, endDate, adjustmentValue, ...otherData } = req.body;

          const updateData: any = { ...otherData };
          
          if (startDate) {
            updateData.startDate = new Date(startDate);
          }
          if (endDate) {
            updateData.endDate = new Date(endDate);
          }
          
          if (adjustmentValue !== undefined) {
            updateData.adjustmentValue = parseFloat(adjustmentValue);
          }

          const season = await PeakSeasonService.updateSeason(id, updateData);
          res.status(200).json({ message: 'Peak season berhasil diperbarui.', data: season });
      } catch (error) {
          next(error);
      }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
      try {
          await PeakSeasonService.deleteSeason(req.params.id);
          res.status(200).json({ message: 'Peak season berhasil dihapus.' }); // Mengubah dari 204 menjadi 200 dengan pesan
      } catch (error) {
          next(error);
      }
  }
}

export default new PeakSeasonController();