import { Request, Response, NextFunction } from 'express';
import CityService from '../services/city.service';
import ApiError from '../utils/apiError';

class CityController {
    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const city = await CityService.createCity(req.body);
            res.status(201).json({ message: 'Kota berhasil dibuat.', data: city });
        } catch (error: any) {
            next(error);
        }
    }

    public async getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const cities = await CityService.getAllCities();
            res.status(200).json({ data: cities });
        } catch (error: any) {
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const city = await CityService.updateCity(req.params.id, req.body);
            res.status(200).json({ message: 'Kota berhasil diperbarui.', data: city });
        } catch (error: any) {
            next(error);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await CityService.deleteCity(req.params.id);
            res.status(200).json({ message: 'Kota berhasil dihapus.' });
        } catch (error: any) {
            next(error);
        }
    }
}

export default new CityController();