import { Router } from "express";
import AmenityController from "../controllers/amenity.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { UserRole } from "@prisma/client";

class AmenityRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const tenantOnly = authMiddleware([UserRole.TENANT]);

    this.router.post("/", tenantOnly, AmenityController.create);
    this.router.get("/", tenantOnly, AmenityController.getAll);
    this.router.patch("/:id", tenantOnly, AmenityController.update);
    this.router.delete("/:id", tenantOnly, AmenityController.delete);
  }
}

export default new AmenityRouter().router;
