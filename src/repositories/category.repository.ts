import { prisma } from '../config/prisma';
import { Category } from "../../prisma/generated/client";

class CategoryRepository {
    public async create(name: string): Promise<Category> {
        return await prisma.category.create({
            data: { name },
        });
    }

    public async findAll(): Promise<Category[]> {
        return await prisma.category.findMany({
            where: { deletedAt: null }, // Filter data aktif
        });
    }

    public async findById(id: string): Promise<Category | null> {
        return await prisma.category.findFirst({
            where: { id, deletedAt: null }, // Filter data aktif
        });
    }

    public async update(id: string, name: string): Promise<Category> {
        return await prisma.category.update({
            where: { id },
            data: { name },
        });
    }

    public async delete(id: string): Promise<Category> {
        return await prisma.category.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}

export default new CategoryRepository();