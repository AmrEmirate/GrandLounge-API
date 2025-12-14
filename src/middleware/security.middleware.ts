import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { Application } from "express";

export const configureSecurityMiddleware = (app: Application) => {
  app.use(helmet());

  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    })
  );
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message:
      "Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Terlalu banyak request. Silakan coba lagi nanti.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
