import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/api-error";
import { ERole } from "../enums/user-role.enum";

export const adminGuard = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user?.role !== ERole.ADMIN) {
    return next(ApiError.forbidden("Admin access required"));
  }
  next();
};

export const customerGuard = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if ((req as any).user?.role !== ERole.CUSTOMER) {
    return next(ApiError.forbidden("Customer access required"));
  }
  next();
};

export const roleGuard =
  (roles: ERole[]) => (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user?.role || !roles.includes((req as any).user.role)) {
      return next(ApiError.forbidden("Insufficient permissions"));
    }
    next();
  };
