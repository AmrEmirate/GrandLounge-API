import { Request, Response } from "express";
import PublicPropertyService from "../services/publicProperty.service";
import { AuthRequest } from "../middleware/auth.middleware";

class PropertyController {
  public async getAll(req: Request, res: Response) {
    try {
      const result = await PublicPropertyService.getProperties(req.query);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Gagal mengambil data properti." });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const property = await PublicPropertyService.getPropertyById(
        req.params.id
      );
      if (!property) {
        return res.status(404).json({ message: "Properti tidak ditemukan." });
      }
      res.status(200).json({ data: property });
    } catch (error: any) {
      res.status(500).json({ message: "Gagal mengambil detail properti." });
    }
  }

  public async getAvailableRooms(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { checkIn, checkOut } = req.query;
      if (
        !checkIn ||
        !checkOut ||
        typeof checkIn !== "string" ||
        typeof checkOut !== "string"
      ) {
        return res
          .status(400)
          .json({ message: "Parameter checkIn dan checkOut dibutuhkan." });
      }
      const rooms = await PublicPropertyService.getAvailableRooms(
        id,
        new Date(checkIn),
        new Date(checkOut)
      );
      res.status(200).json({ data: rooms });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Gagal mengambil data kamar yang tersedia." });
    }
  }

  public async getMonthlyAvailability(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { month, year } = req.query;
      if (!month || !year) {
        return res
          .status(400)
          .json({ message: "Parameter bulan dan tahun dibutuhkan." });
      }
      const availability = await PublicPropertyService.getMonthlyAvailability(
        id,
        Number(month),
        Number(year)
      );
      res.status(200).json({ data: availability });
    } catch (error: any) {
      res.status(500).json({ message: "Gagal mengambil data ketersediaan." });
    }
  }

  public async getCities(_req: Request, res: Response) {
    try {
      const cities = await PublicPropertyService.getCities();
      res.status(200).json({ data: cities });
    } catch (error: any) {
      res.status(500).json({ message: "Gagal mengambil data kota." });
    }
  }

  public async getNearbyProperties(req: Request, res: Response) {
    try {
      const { lat, lon, radius } = req.query;
      if (!lat || !lon) {
        return res
          .status(400)
          .json({ message: "Latitude dan Longitude dibutuhkan." });
      }

      const properties = await PublicPropertyService.findNearby(
        parseFloat(lat as string),
        parseFloat(lon as string),
        radius ? parseInt(radius as string) : undefined
      );

      res.status(200).json({
        message: "Properti terdekat berhasil ditemukan",
        data: properties,
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Gagal mengambil data properti terdekat." });
    }
  }

  public async getPublicStats(_req: Request, res: Response) {
    try {
      const stats = await PublicPropertyService.getPublicStats();
      res.status(200).json({ data: stats });
    } catch (error: any) {
      res.status(500).json({ message: "Gagal mengambil data statistik." });
    }
  }

  public async getPopularDestinations(_req: Request, res: Response) {
    try {
      const destinations = await PublicPropertyService.getPopularDestinations();
      res.status(200).json({ data: destinations });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Gagal mengambil data destinasi populer." });
    }
  }
}

export default new PropertyController();
