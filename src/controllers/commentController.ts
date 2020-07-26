const Joi = require("joi");
import * as mongoose from "mongoose";
import { ticketSchema } from "../models/ticketModel";
import { customerSchema } from "../models/customerModel";
import { commentSchema } from "../models/commentModel";
import { Request, Response, NextFunction } from "express";

const userRule = Joi.object({
  ticketId: Joi.string().required(),
  message: Joi.string().min(5).max(255).required(),
});

const customerRule = Joi.object({
  ticketId: Joi.string().required(),
  message: Joi.string().min(5).max(255).required(),
  email: Joi.string().email().required(),
});

const Comment = mongoose.model("Comment", commentSchema);
const Ticket = mongoose.model("Ticket", ticketSchema);
const User = mongoose.model("Comment", commentSchema);
const Customer = mongoose.model("Customer", customerSchema);

export class CommentController {
  /**
   * add user comment to a ticket
   * @param req
   * @param res
   */
  async addUserComment(req: Request, res: Response, next: NextFunction) {
    // request validation
    const { error } = userRule.validate(req.body);
    if (error)
      return res
        .status(422)
        .json({ status: false, data: [error.details[0].message] });

    const user = await User.find({ _id: req["user"]._id });
    if (!user) {
      return res.status(404).json({ status: false, data: ["user not found."] });
    }

    try {
      let comment = new Comment({
        ticketId: req.body.ticketId,
        message: req.body.message,
        user: req["user"]._id,
        type: req["user"].role,
      });

      comment.save((err, value) => {
        if (err) {
          return res.status(500).json({ status: false, data: [err.message] });
        }
        return res.json({
          status: true,
          data: value,
        });
      });
    } catch (ex) {
      next(ex);
    }
  }

  /**
   * add customer comment on a ticket
   * only if support agent has commented
   * @param req
   * @param res
   * @param next
   */
  async addCustomerComment(req: Request, res: Response, next: NextFunction) {
    const { error } = customerRule.validate(req.body);
    if (error)
      return res
        .status(422)
        .json({ status: false, data: [error.details[0].message] });

    //validate customer
    const customer = await Customer.findOne({ email: req.body.email });
    if (!customer) {
      return res
        .status(400)
        .json({ status: false, data: ["customer not found."] });
    }

    try {
      // check if customer created the ticket
      const isTicketCreatedByCustomer = await Ticket.findById(req.body.ticketId)
        .where("requestedBy")
        .equals(customer._id);
      if (!isTicketCreatedByCustomer) {
        return res.json({
          status: false,
          data: ["you are not allowed to comment on this ticket"],
        });
      }

      // check if user (agent or admin) has commented on ticket
      const hasAgentHasCommented = await Comment.findOne({
        ticketId: req.body.ticketId,
        $or: [{ type: "agent" }, { type: "admin" }],
      }).limit(1);

      if (!hasAgentHasCommented) {
        return res.json({
          status: false,
          data: ["you can't comment on this ticket for now."],
        });
      }

      let comment = new Comment({
        ticketId: req.body.ticketId,
        message: req.body.message,
        user: customer._id,
        type: "customer",
      });

      comment.save((err, value) => {
        if (err) {
          return res.status(500).json({ status: true, data: [err.message] });
        }
        return res.json({
          status: true,
          data: value,
        });
      });
    } catch (ex) {
      next(ex);
    }
  }

  /**
   * get all comments on the system
   * populate with their respective ticket
   * @param req
   * @param res
   * @param next
   */
  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const comments = await Comment.find().populate("ticketId");

      return res.json({ status: true, data: comments });
    } catch (ex) {
      next(ex);
    }
  }
}
