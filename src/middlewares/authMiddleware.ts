import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import asyncHandler from "../middlewares/asyncHandler";
import { IUser } from "../models/User";
import User from "../models/User";
import dotenv from "dotenv";
dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const protect = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token;
    token = req.cookies.jwt;
    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.TOKEN_SECRET as string,
        ) as JwtPayload;
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
          throw new Error("User not found");
        }
        req.user = user;
        next();
      } catch (error) {
        console.error(error);
        throw new Error("No authorized, please login");
      }
    } else {
      throw new Error("No authorized, please login");
    }
  },
);

export const admin = asyncHandler(
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === "ADMIN") {
      next();
    } else {
      res.status(401);
      throw new Error("No authorized as an admin");
    }
  },
);
