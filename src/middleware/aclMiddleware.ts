import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export class AclMiddleware {
  /**
   * Authorization middleware
   * @param req
   * @param res
   * @param next
   */
  public handle(req: Request, res: Response, next: NextFunction) {
    if (req["user"].role !== "admin")
      return res.status(403).json({
        status: false,
        data: ["Access denied. Not sufficient authorization"],
      });

    next();
  }
}
