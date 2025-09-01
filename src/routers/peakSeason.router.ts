// src/routers/peakSeason.router.ts
import { Router } from 'express';
import { peakSeasonController } from '../controllers/peakSeason.controller'; 
import { isTenant } from '../middleware/isTenant';

const router = Router();

// Endpoint untuk mendapatkan semua season milik satu kamar
router.get('/room/:roomId', isTenant, peakSeasonController.getSeasons);

// Endpoint CRUD untuk peak season
router.post('/', isTenant, peakSeasonController.createSeason);
router.put('/:id', isTenant, peakSeasonController.updateSeason);
router.delete('/:id', isTenant, peakSeasonController.deleteSeason);

export default router;