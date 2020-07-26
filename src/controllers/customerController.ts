const Joi = require("joi");
import * as bcrypt from "bcryptjs";
import * as mongoose from "mongoose";
import { customerSchema } from "../models/customerModel";
import { Request, Response, NextFunction } from "express";

const rules = Joi.object({
  name: Joi.string().min(5).max(50).required(),
  email: Joi.string().min(5).max(50).email().required(),
  password: Joi.string().min(5).max(10).required(),
  phone: Joi.number().required(),
  //phone: Joi.number().integer().min(0).max(12).required(),
});

const Customer = mongoose.model("Customer", customerSchema);

export class CustomerController {
  /**
   * register customer
   * @param req
   * @param res
   * @param next
   */
  async registerNewCustomer(req: Request, res: Response, next: NextFunction) {
    // request validation
    const { error } = rules.validate(req.body);
    if (error)
      return res
        .status(422)
        .json({ status: false, data: [error.details[0].message] });

    // check if email exists
    let customerExists = await Customer.findOne({ email: req.body.email });
    if (customerExists) {
      return res
        .status(404)
        .json({ status: false, data: ["email already exists"] });
    }

    try {
      let customer = new Customer({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
      });

      // hash password
      const salt = await bcrypt.genSalt(10);
      customer.password = await bcrypt.hash(customer.password, salt);

      customer = await customer.save();

      return res.json({
        status: true,
        data: {
          _id: customer._id,
          name: customer.name,
          created_at: customer.created_at,
        },
      });
    } catch (ex) {
      next(ex);
    }
  }

  /**
   * fetch all customers
   * @param req
   * @param res
   * @param next
   */
  async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await Customer.find();

      return res.json({ status: true, data: customer });
    } catch (ex) {
      next(ex);
    }
  }
}
