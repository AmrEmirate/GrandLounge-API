import CityRepository from '../repositories/city.repository';
import { prisma } from '../config/prisma';
import { City } from '../../prisma/generated/client';
import GeocodingService from './geocoding.service';
import ApiError from '../utils/apiError';

// Tipe data untuk input agar lebih jelas dan aman
type CityCreationInput = {
    name: string;
    provinsi: string;
};

type CityUpdateInput = {
    name: string;
    provinsi: string;
};


class CityService {
    public async createCity(data: CityCreationInput): Promise<City> {
        const existingCity = await prisma.city.findFirst({
            where: { 
                name: data.name,
                deletedAt: null 
            },
        });

        if (existingCity) {
            throw new ApiError(409, 'Nama kota sudah ada.'); // 409 Conflict
        }

        const { latitude, longitude } = await GeocodingService.getFromAddress(`${data.name}, ${data.provinsi}`);

        if (latitude === null || longitude === null) {
            throw new ApiError(500, 'Gagal mendapatkan data geolokasi untuk kota ini.');
        }

        const cityData = { ...data, latitude, longitude };
        return await CityRepository.create(cityData);
    }

    public async getAllCities(): Promise<City[]> {
        return await CityRepository.findAll();
    }

    public async updateCity(id: string, data: CityUpdateInput): Promise<City> {
        const city = await CityRepository.findById(id);
        if (!city) {
            throw new ApiError(404, 'Kota tidak ditemukan.'); // 404 Not Found
        }
        return await CityRepository.update(id, data);
    }

    public async deleteCity(id: string): Promise<City> {
        const city = await CityRepository.findById(id);
        if (!city) {
            throw new ApiError(404, 'Kota tidak ditemukan.'); // 404 Not Found
        }
        return await CityRepository.delete(id);
    }
}

export default new CityService();