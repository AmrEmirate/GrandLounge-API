import { CityRepository } from '../repositories/city.repository';
import { prisma } from '../config/prisma';
import { City } from '../../prisma/generated/client';
import { GeocodingService } from './geocoding.service';

export const CityService = {
  createCity: async (data: { name: string; provinsi: string }): Promise<City> => {
    const existingCity = await prisma.city.findUnique({ where: { name: data.name } });
    if (existingCity) {
      throw new Error('Nama kota sudah ada.');
    }

    const { latitude, longitude } = await GeocodingService.getFromAddress(`${data.name}, ${data.provinsi}`);

    if (latitude === null || longitude === null) {
      throw new Error('Gagal mendapatkan data geolokasi untuk kota ini.');
    }

    const cityData = { ...data, latitude, longitude };
    return await CityRepository.create(cityData);
  },

  getAllCities: async (): Promise<City[]> => {
    return await CityRepository.findAll();
  },

  updateCity: async (id: string, data: { name: string; provinsi: string }): Promise<City> => {
    const city = await CityRepository.findById(id);
    if (!city) {
      throw new Error('Kota tidak ditemukan.');
    }
    return await CityRepository.update(id, data);
  },

  deleteCity: async (id: string): Promise<City> => {
    const city = await CityRepository.findById(id);
    if (!city) {
      throw new Error('Kota tidak ditemukan.');
    }
    return await CityRepository.delete(id);
  },
};