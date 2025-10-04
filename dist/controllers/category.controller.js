"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const category_service_1 = __importDefault(require("../services/category.service"));
const apiError_1 = __importDefault(require("../utils/apiError"));
class CategoryController {
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name } = req.body;
                if (!name) {
                    throw new apiError_1.default(400, 'Category name is required.');
                }
                const category = yield category_service_1.default.createCategory(name);
                res.status(201).json({ message: 'Kategori berhasil dibuat.', data: category });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAll(_req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield category_service_1.default.getAllCategories();
                res.status(200).json({ data: categories });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const category = yield category_service_1.default.getCategoryById(id);
                res.status(200).json({ data: category });
            }
            catch (error) {
                next(error);
            }
        });
    }
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { name } = req.body;
                if (!name) {
                    throw new apiError_1.default(400, 'Category name is required for update.');
                }
                const category = yield category_service_1.default.updateCategory(id, name);
                res.status(200).json({ message: 'Kategori berhasil diperbarui.', data: category });
            }
            catch (error) {
                next(error);
            }
        });
    }
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield category_service_1.default.deleteCategory(id);
                res.status(200).json({ message: 'Kategori berhasil dihapus.' });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new CategoryController();
