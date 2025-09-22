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
exports.CategoryController = void 0;
const category_service_1 = require("../services/category.service");
exports.CategoryController = {
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const category = yield category_service_1.CategoryService.createCategory(req.body.name);
            res.status(201).json({ message: 'Kategori berhasil dibuat.', data: category });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    getAll: (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const categories = yield category_service_1.CategoryService.getAllCategories();
            res.status(200).json({ data: categories });
        }
        catch (error) {
            res.status(500).json({ message: 'Gagal mengambil data kategori.' });
        }
    }),
    getById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Perubahan: Menghapus Number()
            const category = yield category_service_1.CategoryService.getCategoryById(req.params.id);
            res.status(200).json({ data: category });
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }),
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Perubahan: Menghapus Number()
            const category = yield category_service_1.CategoryService.updateCategory(req.params.id, req.body.name);
            res.status(200).json({ message: 'Kategori berhasil diperbarui.', data: category });
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }),
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Perubahan: Menghapus Number()
            yield category_service_1.CategoryService.deleteCategory(req.params.id);
            res.status(200).json({ message: 'Kategori berhasil dihapus.' });
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }),
};
