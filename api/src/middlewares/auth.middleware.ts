import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../modals/user.entity";
import { ERole } from "../enums/user-role.enum";
import dotenv from "dotenv";

dotenv.config();

// For tsoa authentication
export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<User> {
  if (securityName !== "bearerAuth") {
    throw new Error("Unknown security scheme");
  }

  const token = request.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new Error("Please login to perform this action.");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as User;

  // Check scopes/roles if provided
  if (scopes && scopes.length > 0 && !scopes.includes(decoded.role)) {
    throw new Error("Insufficient permissions");
  }

  return decoded;
}

// For regular Express middleware
export const expressAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  expressAuthentication(req, "bearerAuth")
    .then((user) => {
      (req as any).user = user;
      next();
    })
    .catch((err) => {
      const status = err.message.includes("permissions") ? 403 : 401;
      res.status(status).json({
        success: false,
        message: err.message,
      });
    });
};

// Role guards as Express middleware
export const adminGuard = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user?.role !== ERole.ADMIN) {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

export const customerGuard = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if ((req as any).user?.role !== ERole.CUSTOMER) {
    return res.status(403).json({
      success: false,
      message: "Customer access required",
    });
  }
  next();
};
