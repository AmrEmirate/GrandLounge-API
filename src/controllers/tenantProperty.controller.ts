import { Response } from "express";
import TenantPropertyService from "../services/tenantProperty.service";
import { AuthRequest } from "../middleware/auth.middleware";

class TenantPropertyController {
  private getTenantId(req: AuthRequest, res: Response): string | null {
    const tenantId = req.user?.tenant?.id;
    if (!tenantId) {
      res
        .status(403)
        .json({ message: "Akses ditolak. Akun ini bukan tenant." });
      return null;
    }
    return tenantId;
  }

  public async create(req: AuthRequest, res: Response) {
    try {
      const tenantId = this.getTenantId(req, res);
      if (!tenantId) return;

      const property = await TenantPropertyService.createProperty(
        req.body,
        tenantId,
        req.files as { [fieldname: string]: Express.Multer.File[] }
      );
      res
        .status(201)
        .json({ message: "Properti berhasil dibuat.", data: property });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public async getPropertiesByTenant(req: AuthRequest, res: Response) {
    try {
      const tenantId = this.getTenantId(req, res);
      if (!tenantId) return;

      const properties = await TenantPropertyService.getPropertiesByTenant(
        tenantId
      );
      res.status(200).json({ data: properties });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public async getPropertyByIdForTenant(req: AuthRequest, res: Response) {
    try {
      const tenantId = this.getTenantId(req, res);
      if (!tenantId) return;

      const property = await TenantPropertyService.getPropertyDetailForTenant(
        req.params.id,
        tenantId
      );
      res.status(200).json({ data: property });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  public async update(req: AuthRequest, res: Response) {
    try {
      const tenantId = this.getTenantId(req, res);
      if (!tenantId) return;

      const property = await TenantPropertyService.updateProperty(
        req.params.id,
        tenantId,
        req.body,
        req.files as { [fieldname: string]: Express.Multer.File[] }
      );
      res
        .status(200)
        .json({ message: "Properti berhasil diperbarui.", data: property });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  public async delete(req: AuthRequest, res: Response) {
    try {
      const tenantId = this.getTenantId(req, res);
      if (!tenantId) return;

      await TenantPropertyService.deleteProperty(req.params.id, tenantId);
      res.status(200).json({ message: "Properti berhasil dihapus." });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  public async uploadImage(req: AuthRequest, res: Response) {
    try {
      const tenantId = this.getTenantId(req, res);
      if (!tenantId) return;
      if (!req.file)
        return res
          .status(400)
          .json({ message: "Tidak ada file yang diupload." });

      const property = await TenantPropertyService.uploadPropertyImage(
        req.params.id,
        tenantId,
        req.file
      );
      res
        .status(200)
        .json({ message: "Gambar berhasil diupload.", data: property });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  public async uploadGallery(req: AuthRequest, res: Response) {
    try {
      const tenantId = this.getTenantId(req, res);
      if (!tenantId) return;
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res
          .status(400)
          .json({ message: "Tidak ada file yang diupload." });
      }
      const property = await TenantPropertyService.uploadGalleryImages(
        req.params.id,
        tenantId,
        req.files as Express.Multer.File[]
      );
      res
        .status(200)
        .json({ message: "Gambar galeri berhasil diupload.", data: property });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new TenantPropertyController();
