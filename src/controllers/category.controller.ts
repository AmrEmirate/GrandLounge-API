import { Request, Response, NextFunction } from 'express';
import CategoryService from '../services/category.service';
import ApiError from '../utils/apiError';

class CategoryController {
    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name } = req.body;
            if (!name) {
                throw new ApiError(400, 'Category name is required.');
            }
            const category = await CategoryService.createCategory(name);
            res.status(201).json({ message: 'Kategori berhasil dibuat.', data: category });
        } catch (error) {
            next(error);
        }
    }

    public async getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await CategoryService.getAllCategories();
            res.status(200).json({ data: categories });
        } catch (error) {
            next(error);
        }
    }

    public async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const category = await CategoryService.getCategoryById(id);
            res.status(200).json({ data: category });
        } catch (error) {
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            if (!name) {
                throw new ApiError(400, 'Category name is required for update.');
            }
            const category = await CategoryService.updateCategory(id, name);
            res.status(200).json({ message: 'Kategori berhasil diperbarui.', data: category });
        } catch (error) {
            next(error);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await CategoryService.deleteCategory(id);
            res.status(200).json({ message: 'Kategori berhasil dihapus.' });
        } catch (error) {
            next(error);
        }
    }
}

export default new CategoryController();