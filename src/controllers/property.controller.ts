import { Request, Response } from 'express';
import { PublicPropertyService } from '../services/publicProperty.service';
import { TenantPropertyService } from '../services/tenantProperty.service';
import { AuthRequest } from '../middleware/auth.middleware';

const getTenantId = (req: AuthRequest, res: Response): string | null => {
    const tenantId = req.user?.tenant?.id;
    if (!tenantId) {
        res.status(403).json({ message: 'Akses ditolak. Akun ini bukan tenant.' });
        return null;
    }
    return tenantId;
};

export const PropertyController = {
    getAll: async (req: Request, res: Response) => {
        try {
            const result = await PublicPropertyService.getProperties(req.query);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ message: 'Gagal mengambil data properti.' });
        }
    },

    getOne: async (req: Request, res: Response) => {
        try {
            const property = await PublicPropertyService.getPropertyById(req.params.id);
            if (!property) {
                return res.status(404).json({ message: 'Properti tidak ditemukan.' });
            }
            res.status(200).json({ data: property });
        } catch (error: any) {
            res.status(500).json({ message: 'Gagal mengambil detail properti.' });
        }
    },

    getAvailableRooms: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { checkIn, checkOut } = req.query;
            if (!checkIn || !checkOut || typeof checkIn !== 'string' || typeof checkOut !== 'string') {
                return res.status(400).json({ message: 'Parameter checkIn dan checkOut dibutuhkan.' });
            }
            const rooms = await PublicPropertyService.getAvailableRooms(id, new Date(checkIn), new Date(checkOut));
            res.status(200).json({ data: rooms });
        } catch (error: any) {
            res.status(500).json({ message: 'Gagal mengambil data kamar yang tersedia.' });
        }
    },

    getMonthlyAvailability: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { month, year } = req.query;
            if (!month || !year) {
                return res.status(400).json({ message: 'Parameter bulan dan tahun dibutuhkan.' });
            }
            const availability = await PublicPropertyService.getMonthlyAvailability(id, Number(month), Number(year));
            res.status(200).json({ data: availability });
        } catch (error: any) {
            res.status(500).json({ message: 'Gagal mengambil data ketersediaan.' });
        }
    },

    getCities: async (_req: Request, res: Response) => {
        try {
            const cities = await PublicPropertyService.getCities();
            res.status(200).json({ data: cities });
        } catch (error: any) {
            res.status(500).json({ message: 'Gagal mengambil data kota.' });
        }
    },

    create: async (req: AuthRequest, res: Response) => {
        try {
            const tenantId = getTenantId(req, res);
            if (!tenantId) return;

            const property = await TenantPropertyService.createProperty(
                req.body, tenantId, req.files as { [fieldname: string]: Express.Multer.File[] }
            );
            res.status(201).json({ message: 'Properti berhasil dibuat.', data: property });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },

    getPropertiesByTenant: async (req: AuthRequest, res: Response) => {
        try {
            const tenantId = getTenantId(req, res);
            if (!tenantId) return;

            const properties = await TenantPropertyService.getPropertiesByTenant(tenantId);
            res.status(200).json({ data: properties });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    },

    getPropertyByIdForTenant: async (req: AuthRequest, res: Response) => {
        try {
            const tenantId = getTenantId(req, res);
            if (!tenantId) return;

            const property = await TenantPropertyService.getPropertyDetailForTenant(req.params.id, tenantId);
            res.status(200).json({ data: property });
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    },

    update: async (req: AuthRequest, res: Response) => {
        try {
            const tenantId = getTenantId(req, res);
            if (!tenantId) return;

            const property = await TenantPropertyService.updateProperty(
                req.params.id, tenantId, req.body, req.files as { [fieldname: string]: Express.Multer.File[] }
            );
            res.status(200).json({ message: 'Properti berhasil diperbarui.', data: property });
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    },

    delete: async (req: AuthRequest, res: Response) => {
        try {
            const tenantId = getTenantId(req, res);
            if (!tenantId) return;

            await TenantPropertyService.deleteProperty(req.params.id, tenantId);
            res.status(200).json({ message: 'Properti berhasil dihapus.' });
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    },

    uploadImage: async (req: AuthRequest, res: Response) => {
        try {
            const tenantId = getTenantId(req, res);
            if (!tenantId) return;
            if (!req.file) return res.status(400).json({ message: 'Tidak ada file yang diupload.' });

            const property = await TenantPropertyService.uploadPropertyImage(req.params.id, tenantId, req.file);
            res.status(200).json({ message: 'Gambar berhasil diupload.', data: property });
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    },

    uploadGallery: async (req: AuthRequest, res: Response) => {
        try {
            const tenantId = getTenantId(req, res);
            if (!tenantId) return;
            if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
                return res.status(400).json({ message: 'Tidak ada file yang diupload.' });
            }
            const property = await TenantPropertyService.uploadGalleryImages(req.params.id, tenantId, req.files as Express.Multer.File[]);
            res.status(200).json({ message: 'Gambar galeri berhasil diupload.', data: property });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },

    getNearbyProperties: async (req: Request, res: Response) => {
        try {
            const { lat, lon, radius } = req.query;
            if (!lat || !lon) {
                return res.status(400).json({ message: 'Latitude dan Longitude dibutuhkan.' });
            }

            const properties = await PublicPropertyService.findNearby(
                parseFloat(lat as string),
                parseFloat(lon as string),
                radius ? parseInt(radius as string) : undefined
            );

            res.status(200).json({
                message: 'Properti terdekat berhasil ditemukan',
                data: properties
            });
        } catch (error: any) {
            res.status(500).json({ message: 'Gagal mengambil data properti terdekat.' });
        }
    },
};