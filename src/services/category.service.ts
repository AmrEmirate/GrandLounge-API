import { Category } from '../../prisma/generated/client';
import CategoryRepository from '../repositories/category.repository';
import { prisma } from '../config/prisma';
import ApiError from '../utils/apiError';

class CategoryService {
    public async createCategory(name: string): Promise<Category> {
        const existingCategory = await prisma.category.findFirst({
            where: {
                name,
                deletedAt: null,
            },
        });

        if (existingCategory) {
            throw new ApiError(409, 'Nama kategori sudah ada.'); 
        }
        return await CategoryRepository.create(name);
    }

    public async getAllCategories(): Promise<Category[]> {
        return await CategoryRepository.findAll();
    }

    public async getCategoryById(id: string): Promise<Category | null> {
        const category = await CategoryRepository.findById(id);
        if (!category) {
              throw new ApiError(404, 'Kategori tidak ditemukan.');
          }
        return category;
    } 

    public async updateCategory(id: string, name: string): Promise<Category> {
        await this.getCategoryById(id);
        return await CategoryRepository.update(id, name);
    }

    public async deleteCategory(id: string): Promise<Category> {
        await this.getCategoryById(id);
        return await CategoryRepository.delete(id);
    }
}

export default new CategoryService();