import { Request, Response, NextFunction } from 'express';
import AmenityService from '../services/amenity.service';

class AmenityController {
    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ message: 'Amenity name is required.' });
            }
            const amenity = await AmenityService.createAmenity(name);
            res.status(201).json({ message: 'Fasilitas berhasil dibuat.', data: amenity });
        } catch (error: any) {
            next(error);
        }
    }
//
    public async getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const amenities = await AmenityService.getAllAmenities();
            res.status(200).json({ data: amenities });
        } catch (error: any) {
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ message: 'Amenity name is required for update.' });
            }
            const amenity = await AmenityService.updateAmenity(id, name);
            res.status(200).json({ message: 'Fasilitas berhasil diperbarui.', data: amenity });
        } catch (error: any) {
            next(error);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await AmenityService.deleteAmenity(id);
            res.status(200).json({ message: 'Fasilitas berhasil dihapus.' });
        } catch (error: any) {
            next(error);
        }
    }
}

export default new AmenityController();