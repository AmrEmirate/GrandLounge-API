import { prisma } from '../config/prisma';
import { Amenity } from '../../prisma/generated/client';

class AmenityRepository {
    public async create(name: string): Promise<Amenity> {
        return await prisma.amenity.create({
            data: { name },
        });
    }

    public async findAll(): Promise<Amenity[]> {
        return await prisma.amenity.findMany({
            where: { deletedAt: null }, 
        });
    }

    public async findById(id: string): Promise<Amenity | null> {
        return await prisma.amenity.findFirst({
            where: { id, deletedAt: null }, 
        });
    }

    public async update(id: string, name: string): Promise<Amenity> {
        return await prisma.amenity.update({
            where: { id },
            data: { name },
        });
    }

    public async delete(id: string): Promise<Amenity> {
        return await prisma.amenity.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}

export default new AmenityRepository();