// src/controllers/peakSeason.controller.ts
import { Request, Response } from 'express';
import { peakSeasonService } from '../services/peakSeason.service';

export const peakSeasonController = {
  async getSeasons(req: Request, res: Response) {
    const { roomId } = req.params;
    const seasons = await peakSeasonService.getSeasonsByRoom(roomId);
    res.status(200).json(seasons);
  },

  async createSeason(req: Request, res: Response) {
    const newSeason = await peakSeasonService.createSeason(req.body);
    res.status(201).json(newSeason);
  },

  async updateSeason(req: Request, res: Response) {
    const { id } = req.params;
    const updatedSeason = await peakSeasonService.updateSeason(id, req.body);
    res.status(200).json(updatedSeason);
  },

  async deleteSeason(req: Request, res: Response) {
    const { id } = req.params;
    await peakSeasonService.deleteSeason(id);
    res.status(204).send();
  }
};