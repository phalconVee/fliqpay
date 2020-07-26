import * as jwt from "jsonwebtoken";
const Joi = require("joi");
import * as bcrypt from "bcryptjs";
import * as mongoose from "mongoose";
import { userSchema } from "../models/userModel";
import { Request, Response, NextFunction } from "express";

const loginRules = Joi.object({
  email: Joi.string().min(5).max(50).email().required(),
  password: Joi.string().min(5).max(255).required(),
});

const registerRules = Joi.object({
  name: Joi.string().min(5).max(50).required(),
  email: Joi.string().min(5).max(50).email().required(),
  password: Joi.string().min(5).max(255).required(),
  role: Joi.string().min(5).max(6).required(),
});

/** generate web token */
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWT_PRIVATE_KEY
  );
};

const User = mongoose.model("User", userSchema);

export class UserController {
  /**
   * user login
   * @param req
   * @param res
   * @param next
   */
  async login(req: Request, res: Response, next: NextFunction) {
    const { error } = loginRules.validate(req.body);
    if (error)
      return res
        .status(422)
        .json({ status: false, data: [error.details[0].message] });

    let user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).json({ status: false, data: ["email not found"] });

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res
        .status(401)
        .json({ status: false, data: ["invalid email or password"] });

    try {
      const token = user.generateAuthToken();

      return res.json({
        status: true,
        token: token,
        data: {
          _id: user._id,
          role: user.role,
        },
      });
    } catch (ex) {
      next(ex);
    }
  }

  /**
   * create users
   * @param req
   * @param res
   */
  async createUser(req: Request, res: Response, next: NextFunction) {
    const { error } = registerRules.validate(req.body);
    if (error)
      return res
        .status(422)
        .json({ status: false, data: [error.details[0].message] });

    // check if email exists
    let userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res
        .status(409)
        .json({ status: false, data: ["email already exists"] });
    }

    try {
      let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
      });

      // hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);

      user = await user.save();

      return res.json({
        status: true,
        data: {
          _id: user._id,
          name: user.name,
          created_at: user.created_at,
        },
      });
    } catch (ex) {
      next(ex);
    }
  }

  /**
   * get current user
   * @param req
   * @param res
   * @param next
   */
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req["user"]._id).select("-password");

      return res.json({ status: true, data: user });
    } catch (ex) {
      next(ex);
    }
  }

  /**
   * get all User
   * @param req
   * @param res
   * @param next
   */
  async getAllUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.find({});

      return res.json({ status: true, data: user });
    } catch (ex) {
      next(ex);
    }
  }
}
