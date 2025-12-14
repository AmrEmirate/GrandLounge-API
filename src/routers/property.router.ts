import { Router } from "express";
import PropertyController from "../controllers/property.controller";
import TenantPropertyController from "../controllers/tenantProperty.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { UserRole } from "@prisma/client";
import roomRouter from "./room.router";
import upload from "../middleware/upload.middleware";
import { validate, PropertyValidator } from "../middleware/validators";

class PropertyRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const tenantOnly = authMiddleware([UserRole.TENANT]);

    this.router.get("/", PropertyController.getAll.bind(PropertyController));
    this.router.get(
      "/nearby",
      PropertyController.getNearbyProperties.bind(PropertyController)
    );
    this.router.get("/:id", PropertyController.getOne.bind(PropertyController));
    this.router.get(
      "/:id/availability",
      PropertyController.getMonthlyAvailability.bind(PropertyController)
    );
    this.router.get(
      "/:id/available-rooms",
      PropertyController.getAvailableRooms.bind(PropertyController)
    );

    this.router.use("/my-properties/:propertyId/rooms", tenantOnly, roomRouter);

    this.router.post(
      "/",
      tenantOnly,
      upload.fields([
        { name: "mainImage", maxCount: 1 },
        { name: "galleryImages", maxCount: 10 },
      ]),
      validate(PropertyValidator.create),
      TenantPropertyController.create.bind(TenantPropertyController)
    );

    this.router.get(
      "/my-properties/all",
      tenantOnly,
      TenantPropertyController.getPropertiesByTenant.bind(
        TenantPropertyController
      )
    );

    this.router.get(
      "/my-properties/:id",
      tenantOnly,
      TenantPropertyController.getPropertyByIdForTenant.bind(
        TenantPropertyController
      )
    );

    this.router.patch(
      "/my-properties/:id",
      tenantOnly,
      upload.fields([
        { name: "mainImage", maxCount: 1 },
        { name: "galleryImages", maxCount: 10 },
      ]),
      validate(PropertyValidator.update),
      TenantPropertyController.update.bind(TenantPropertyController)
    );

    this.router.delete(
      "/my-properties/:id",
      tenantOnly,
      TenantPropertyController.delete.bind(TenantPropertyController)
    );

    this.router.patch(
      "/my-properties/:id/upload-image",
      tenantOnly,
      upload.single("propertyImage"),
      TenantPropertyController.uploadImage.bind(TenantPropertyController)
    );

    this.router.post(
      "/my-properties/:id/gallery",
      tenantOnly,
      upload.array("galleryImages", 10),
      TenantPropertyController.uploadGallery.bind(TenantPropertyController)
    );
  }
}

export default new PropertyRouter().router;
