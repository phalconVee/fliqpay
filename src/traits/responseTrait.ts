import { Request, Response } from "express";

export class ResponseTrait {
  res: Response;
  req: Request;

  protected successResponse(message = "Success", data = null) {
    const output = {
      status: true,
      msg: message,
    };

    if (data) {
      output["data"] = data;
    }

    return this.res;
  }

  public failureResponse(message = "Error Occurred", data = []) {
    const output = {
      status: false,
      msg: message,
    };

    if (data.length > 0) {
      output["data"] = data;
    }
    return this.res.json(output);
  }
}
