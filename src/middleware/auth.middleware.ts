import { Request, Response, NextFunction } from "express";
import { verifyToken as verifyJwt } from "../utils/jwt";
import { prisma } from "../config/prisma";
import { UserRole } from "@prisma/client";
import { JwtPayload, verify } from "jsonwebtoken";
import logger from "../utils/logger";

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (roles: UserRole[] = []) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Akses ditolak, tidak ada token." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyJwt(token);

    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Token tidak valid atau sudah kedaluwarsa." });
    }

    try {
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.id,
          deletedAt: null,
        },
        include: {
          tenant: true,
        },
      });

      if (!user) {
        return res.status(401).json({ message: "User tidak ditemukan." });
      }

      if (!user.verified) {
        return res
          .status(403)
          .json({ message: "Akun Anda belum terverifikasi." });
      }

      req.user = user;

      if (roles.length > 0) {
        if (!roles.includes(user.role)) {
          return res.status(403).json({
            message: "Anda tidak memiliki hak akses untuk sumber daya ini.",
          });
        }

        if (roles.includes(UserRole.TENANT) && !user.tenant) {
          return res.status(403).json({
            message:
              "Akses ditolak. Data tenant tidak ditemukan untuk akun ini.",
          });
        }
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
  };
};

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];

    logger.info(`Token verification attempt`);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token is missing",
      });
    }

    const tokenKey = process.env.TOKEN_KEY;
    if (!tokenKey) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const checkToken = verify(token, tokenKey);

    res.locals.descript = checkToken as JwtPayload;
    (req as any).user = checkToken;

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const isTenant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;

    if (!user || user.role !== "TENANT") {
      res.status(403).json({
        success: false,
        message: "Forbidden: Access is restricted to tenants.",
      });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!tenant) {
      res.status(403).json({
        success: false,
        message: "Forbidden: Tenant profile not found for this user.",
      });
      return;
    }

    req.user.tenant = tenant;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error during tenant verification.",
    });
  }
};

export const isUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = (req as any).user;
  if (!user) {
    res.status(403).json({
      success: false,
      message: "No user found in token",
    });
    return;
  }

  if (user.role !== "USER") {
    res.status(403).json({
      success: false,
      message: `Access denied: Role is ${user.role}, expected USER`,
    });
    return;
  }

  next();
};
