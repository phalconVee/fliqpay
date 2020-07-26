import * as mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";

export class ValidateObjectIdMiddleware {
  /**
   * Object id validator middleware
   * @param req
   * @param res
   * @param next
   */
  public handle(req: Request, res: Response, next: NextFunction) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).json({
        status: false,
        data: ["invalid id passed " + req.params.id],
      });

    next();
  }
}
