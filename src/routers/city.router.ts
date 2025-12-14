import { Router } from "express";
import CityController from "../controllers/city.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { UserRole } from "@prisma/client";

class CityRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const tenantOnly = authMiddleware([UserRole.TENANT]);

    this.router.get("/", CityController.getAll);
    this.router.post("/", tenantOnly, CityController.create);
    this.router.patch("/:id", tenantOnly, CityController.update);
    this.router.delete("/:id", tenantOnly, CityController.delete);
  }
}

export default new CityRouter().router;
