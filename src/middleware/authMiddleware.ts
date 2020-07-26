import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export class AuthMiddleware {
  /**
   * Authentication middleware
   * @param req
   * @param res
   * @param next
   */
  public handle(req: Request, res: Response, next: NextFunction) {
    const token = req.header("x-auth-token");
    if (!token)
      return res
        .status(401)
        .json({ status: false, data: ["Access denied. No token provided"] });

    try {
      const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
      req["user"] = decoded;
      next();
    } catch (ex) {
      return res.status(400).json({ status: false, data: ["Invalid token."] });
    }
  }
}
