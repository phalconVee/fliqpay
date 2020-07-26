import { Request, Response, NextFunction } from "express";
import HttpException from "../exceptions/HttpException";

export class ErrorMiddleware {
  /**
   * Error handler middlerware
   * @param err
   * @param req
   * @param res
   * @param next
   */
  public handle(
    err: HttpException,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    res.status(status).send({
      status,
      message,
    });
  }
}
