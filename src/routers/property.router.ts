import { Router } from "express";
import PropertyController from "../controllers/property.controller";
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
      PropertyController.create.bind(PropertyController)
    );

    this.router.get(
      "/my-properties/all",
      tenantOnly,
      PropertyController.getPropertiesByTenant.bind(PropertyController)
    );

    this.router.get(
      "/my-properties/:id",
      tenantOnly,
      PropertyController.getPropertyByIdForTenant.bind(PropertyController)
    );

    this.router.patch(
      "/my-properties/:id",
      tenantOnly,
      upload.fields([
        { name: "mainImage", maxCount: 1 },
        { name: "galleryImages", maxCount: 10 },
      ]),
      validate(PropertyValidator.update),
      PropertyController.update.bind(PropertyController)
    );

    this.router.delete(
      "/my-properties/:id",
      tenantOnly,
      PropertyController.delete.bind(PropertyController)
    );

    this.router.patch(
      "/my-properties/:id/upload-image",
      tenantOnly,
      upload.single("propertyImage"),
      PropertyController.uploadImage.bind(PropertyController)
    );

    this.router.post(
      "/my-properties/:id/gallery",
      tenantOnly,
      upload.array("galleryImages", 10),
      PropertyController.uploadGallery.bind(PropertyController)
    );
  }
}

export default new PropertyRouter().router;
