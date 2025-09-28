import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import RoomService from '../services/room.service';
import {RoomAvailabilityService } from '../services/roomAvailability.service';
import ApiError from '../utils/apiError';

class RoomController {
    private getTenantIdFromRequest = (req: AuthRequest): string => {
        const tenantId = (req.user as any)?.tenant?.id;
        if (!tenantId) {
            throw new ApiError(403, 'Akses ditolak. Akun ini bukan tenant.');
        }
        return tenantId;
    }

    public create = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const tenantId = this.getTenantIdFromRequest(req);
            const { propertyId } = req.params;
            const room = await RoomService.createRoom(tenantId, propertyId, req.body);
            res.status(201).json({ message: 'Kamar berhasil dibuat.', data: room });
        } catch (error) {
            next(error);
        }
    }

    public getAllByProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const tenantId = this.getTenantIdFromRequest(req);
            const { propertyId } = req.params;
            const rooms = await RoomService.getRoomsByProperty(tenantId, propertyId);
            res.status(200).json({ data: rooms });
        } catch (error) {
            next(error);
        }
    }

    public getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const tenantId = this.getTenantIdFromRequest(req);
            const { propertyId, roomId } = req.params;
            const room = await RoomService.getRoomById(tenantId, propertyId, roomId);
            if (!room) {
                throw new ApiError(404, 'Kamar tidak ditemukan.');
            }
            res.status(200).json({ data: room });
        } catch (error) {
            next(error);
        }
    }

    public update = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const tenantId = this.getTenantIdFromRequest(req);
            const { propertyId, roomId } = req.params;
            const room = await RoomService.updateRoom(tenantId, propertyId, roomId, req.body);
            res.status(200).json({ message: 'Kamar berhasil diperbarui.', data: room });
        } catch (error) {
            next(error);
        }
    }

    public delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const tenantId = this.getTenantIdFromRequest(req);
            const { propertyId, roomId } = req.params;
            await RoomService.deleteRoom(tenantId, propertyId, roomId);
            res.status(200).json({ message: 'Kamar berhasil dihapus.' });
        } catch (error) {
            next(error);
        }
    }

    public getMonthlyAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const tenantId = this.getTenantIdFromRequest(req);
            const { propertyId, roomId } = req.params;
            const { month, year } = req.query;

            if (!month || !year) {
                throw new ApiError(400, 'Parameter bulan dan tahun dibutuhkan.');
            }

            const availability = await RoomAvailabilityService.getMonthlyAvailability(
                tenantId, propertyId, roomId, Number(month), Number(year)
            );
            res.status(200).json({ data: availability });
        } catch (error) {
            next(error);
        }
    }
}

export default new RoomController();