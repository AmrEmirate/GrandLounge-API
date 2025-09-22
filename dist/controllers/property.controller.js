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
exports.PropertyController = void 0;
const publicProperty_service_1 = require("../services/publicProperty.service");
const tenantProperty_service_1 = require("../services/tenantProperty.service");
const getTenantId = (req, res) => {
    var _a, _b;
    const tenantId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenant) === null || _b === void 0 ? void 0 : _b.id;
    if (!tenantId) {
        res.status(403).json({ message: 'Akses ditolak. Akun ini bukan tenant.' });
        return null;
    }
    return tenantId;
};
exports.PropertyController = {
    getAll: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield publicProperty_service_1.PublicPropertyService.getProperties(req.query);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({ message: 'Gagal mengambil data properti.' });
        }
    }),
    getOne: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const property = yield publicProperty_service_1.PublicPropertyService.getPropertyById(req.params.id);
            if (!property) {
                return res.status(404).json({ message: 'Properti tidak ditemukan.' });
            }
            res.status(200).json({ data: property });
        }
        catch (error) {
            res.status(500).json({ message: 'Gagal mengambil detail properti.' });
        }
    }),
    getAvailableRooms: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { checkIn, checkOut } = req.query;
            if (!checkIn || !checkOut || typeof checkIn !== 'string' || typeof checkOut !== 'string') {
                return res.status(400).json({ message: 'Parameter checkIn dan checkOut dibutuhkan.' });
            }
            const rooms = yield publicProperty_service_1.PublicPropertyService.getAvailableRooms(id, new Date(checkIn), new Date(checkOut));
            res.status(200).json({ data: rooms });
        }
        catch (error) {
            res.status(500).json({ message: 'Gagal mengambil data kamar yang tersedia.' });
        }
    }),
    getMonthlyAvailability: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { month, year } = req.query;
            if (!month || !year) {
                return res.status(400).json({ message: 'Parameter bulan dan tahun dibutuhkan.' });
            }
            const availability = yield publicProperty_service_1.PublicPropertyService.getMonthlyAvailability(id, Number(month), Number(year));
            res.status(200).json({ data: availability });
        }
        catch (error) {
            res.status(500).json({ message: 'Gagal mengambil data ketersediaan.' });
        }
    }),
    getCities: (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const cities = yield publicProperty_service_1.PublicPropertyService.getCities();
            res.status(200).json({ data: cities });
        }
        catch (error) {
            res.status(500).json({ message: 'Gagal mengambil data kota.' });
        }
    }),
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tenantId = getTenantId(req, res);
            if (!tenantId)
                return;
            const property = yield tenantProperty_service_1.TenantPropertyService.createProperty(req.body, tenantId, req.files);
            res.status(201).json({ message: 'Properti berhasil dibuat.', data: property });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    getPropertiesByTenant: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tenantId = getTenantId(req, res);
            if (!tenantId)
                return;
            const properties = yield tenantProperty_service_1.TenantPropertyService.getPropertiesByTenant(tenantId);
            res.status(200).json({ data: properties });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }),
    getPropertyByIdForTenant: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tenantId = getTenantId(req, res);
            if (!tenantId)
                return;
            const property = yield tenantProperty_service_1.TenantPropertyService.getPropertyDetailForTenant(req.params.id, tenantId);
            res.status(200).json({ data: property });
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }),
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tenantId = getTenantId(req, res);
            if (!tenantId)
                return;
            const property = yield tenantProperty_service_1.TenantPropertyService.updateProperty(req.params.id, tenantId, req.body, req.files);
            res.status(200).json({ message: 'Properti berhasil diperbarui.', data: property });
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }),
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tenantId = getTenantId(req, res);
            if (!tenantId)
                return;
            yield tenantProperty_service_1.TenantPropertyService.deleteProperty(req.params.id, tenantId);
            res.status(200).json({ message: 'Properti berhasil dihapus.' });
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }),
    uploadImage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tenantId = getTenantId(req, res);
            if (!tenantId)
                return;
            if (!req.file)
                return res.status(400).json({ message: 'Tidak ada file yang diupload.' });
            const property = yield tenantProperty_service_1.TenantPropertyService.uploadPropertyImage(req.params.id, tenantId, req.file);
            res.status(200).json({ message: 'Gambar berhasil diupload.', data: property });
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }),
    uploadGallery: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tenantId = getTenantId(req, res);
            if (!tenantId)
                return;
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ message: 'Tidak ada file yang diupload.' });
            }
            const property = yield tenantProperty_service_1.TenantPropertyService.uploadGalleryImages(req.params.id, tenantId, req.files);
            res.status(200).json({ message: 'Gambar galeri berhasil diupload.', data: property });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    getNearbyProperties: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { lat, lon, radius } = req.query;
            if (!lat || !lon) {
                return res.status(400).json({ message: 'Latitude dan Longitude dibutuhkan.' });
            }
            const properties = yield publicProperty_service_1.PublicPropertyService.findNearby(parseFloat(lat), parseFloat(lon), radius ? parseInt(radius) : undefined);
            res.status(200).json({
                message: 'Properti terdekat berhasil ditemukan',
                data: properties
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Gagal mengambil data properti terdekat.' });
        }
    }),
};
