import { prisma } from '../config/prisma';
import { City } from '../../prisma/generated/client';

type CityCreationData = {
    name: string;
    provinsi: string;
    latitude: number;
    longitude: number;
};

type CityUpdateData = {
    name: string;
    provinsi: string;
};

class CityRepository {
    public async create(data: CityCreationData): Promise<City> {
        return await prisma.city.create({
            data: data,
        });
    }

    public async findAll(): Promise<City[]> {
        return await prisma.city.findMany({
            where: { deletedAt: null }, 
        });
    }

    public async findById(id: string): Promise<City | null> {
        return await prisma.city.findFirst({
            where: { id, deletedAt: null }, 
        });
    }

    public async update(id: string, data: CityUpdateData): Promise<City> {
        return await prisma.city.update({
            where: { id },
            data: data,
        });
    }

    public async delete(id: string): Promise<City> {
        return await prisma.city.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}

export default new CityRepository();