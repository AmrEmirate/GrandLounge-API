import { Amenity } from '../../prisma/generated/client';
import AmenityRepository from '../repositories/amenity.repository';
import { prisma } from '../config/prisma';
import ApiError from '../utils/apiError';

class AmenityService {
    public async createAmenity(name: string): Promise<Amenity> {
        const existingAmenity = await prisma.amenity.findFirst({ 
            where: { 
                name,
                deletedAt: null 
            } 
        });
        
        if (existingAmenity) {
            throw new ApiError(409, 'Nama fasilitas sudah ada.'); // 409 Conflict
        }
        return await AmenityRepository.create(name);
    }

    public async getAllAmenities(): Promise<Amenity[]> {
        return await AmenityRepository.findAll();
    }

    public async updateAmenity(id: string, name: string): Promise<Amenity> {
        const amenity = await AmenityRepository.findById(id);
        if (!amenity) {
            throw new ApiError(404, 'Fasilitas tidak ditemukan.'); // 404 Not Found
        }
        return await AmenityRepository.update(id, name);
    }

    public async deleteAmenity(id: string): Promise<Amenity> {
        const amenity = await AmenityRepository.findById(id);
        if (!amenity) {
            throw new ApiError(404, 'Fasilitas tidak ditemukan.'); // 404 Not Found
        }
        return await AmenityRepository.delete(id);
    }
}

export default new AmenityService();