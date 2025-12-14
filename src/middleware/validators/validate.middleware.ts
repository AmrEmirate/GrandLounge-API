import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import logger from "../../utils/logger";

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => {
        if ("path" in err) {
          return `${err.path}: ${err.msg}`;
        }
        return err.msg;
      });

      logger.error(
        `Validation Error [${req.method} ${req.path}]: ${JSON.stringify(
          errorMessages
        )}`
      );

      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors.array().map((err) => ({
          field: "path" in err ? err.path : "unknown",
          message: err.msg,
        })),
      });
    }

    logger.info(`Validation Passed [${req.method} ${req.path}]`);

    next();
  };
};
