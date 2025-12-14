import { Router } from "express";
import CategoryController from "../controllers/category.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { UserRole } from "@prisma/client";
import { validate, CategoryValidator } from "../middleware/validators";

class CategoryRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const tenantOnly = authMiddleware([UserRole.TENANT]);

    this.router.get("/", CategoryController.getAll.bind(CategoryController));
    this.router.post(
      "/",
      tenantOnly,
      validate(CategoryValidator.create),
      CategoryController.create.bind(CategoryController)
    );
    this.router.get(
      "/:id",
      tenantOnly,
      CategoryController.getById.bind(CategoryController)
    );
    this.router.patch(
      "/:id",
      tenantOnly,
      validate(CategoryValidator.update),
      CategoryController.update.bind(CategoryController)
    );
    this.router.delete(
      "/:id",
      tenantOnly,
      CategoryController.delete.bind(CategoryController)
    );
  }
}

export default new CategoryRouter().router;
