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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const category_repository_1 = require("../repositories/category.repository");
const prisma_1 = require("../config/prisma");
exports.CategoryService = {
    createCategory: (name) => __awaiter(void 0, void 0, void 0, function* () {
        const existingCategory = yield prisma_1.prisma.category.findUnique({ where: { name } });
        if (existingCategory) {
            throw new Error('Nama kategori sudah ada.');
        }
        return yield category_repository_1.CategoryRepository.create(name);
    }),
    getAllCategories: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield category_repository_1.CategoryRepository.findAll();
    }),
    getCategoryById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const category = yield category_repository_1.CategoryRepository.findById(id);
        if (!category) {
            throw new Error('Kategori tidak ditemukan.');
        }
        return category;
    }),
    updateCategory: (id, name) => __awaiter(void 0, void 0, void 0, function* () {
        yield exports.CategoryService.getCategoryById(id); // Memastikan kategori ada sebelum update
        return yield category_repository_1.CategoryRepository.update(id, name);
    }),
    deleteCategory: (id) => __awaiter(void 0, void 0, void 0, function* () {
        yield exports.CategoryService.getCategoryById(id); // Memastikan kategori ada sebelum dihapus
        return yield category_repository_1.CategoryRepository.delete(id);
    }),
};
