// src/routers/peakSeason.router.ts
import { Router } from 'express';
import { PeakSeasonController } from '../controllers/peakSeason.controller'; 
import { authMiddleware } from '../middleware/auth.middleware';
import { UserRole } from '../../prisma/generated/prisma';

const router = Router();
const tenantOnly = authMiddleware([UserRole.TENANT]);

// --- PERBAIKAN ---
// Route ini lebih standar. Frontend akan memanggil: GET /api/peak-seasons/by-room/{roomId}
// Ini lebih jelas menunjukkan bahwa kita mengambil data PeakSeason berdasarkan room.
router.get('/by-room/:roomId', tenantOnly, PeakSeasonController.getByRoom);

// Endpoint CRUD untuk peak season (ini sudah benar)
router.post('/', tenantOnly, PeakSeasonController.create);
router.put('/:id', tenantOnly, PeakSeasonController.update);
router.delete('/:id', tenantOnly, PeakSeasonController.delete);

export default router;