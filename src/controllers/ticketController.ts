const Joi = require("joi");
const moment = require("moment");
const { Parser } = require("json2csv");
import * as mongoose from "mongoose";
import { ticketSchema } from "../models/ticketModel";
import { customerSchema } from "../models/customerModel";
import { commentSchema } from "../models/commentModel";
import { Request, Response, NextFunction } from "express";

const rules1 = Joi.object({
  email: Joi.string().email().required(),
  topic: Joi.string().required(),
  subject: Joi.string().min(5).max(50).required(),
  message: Joi.string().min(5).max(255).required(),
});

const rules2 = Joi.object({
  isClosed: Joi.boolean().required(),
});

const Ticket = mongoose.model("Ticket", ticketSchema);
const Customer = mongoose.model("Customer", customerSchema);
const Comment = mongoose.model("Comment", commentSchema);

export class TicketController {
  /**
   * create support request
   * @param req
   * @param res
   */
  async createTicket(req: Request, res: Response, next: NextFunction) {
    const { error } = rules1.validate(req.body);
    if (error)
      return res
        .status(422)
        .json({ status: false, data: [error.details[0].message] });

    const customer = await Customer.findOne({ email: req.body.email });
    if (!customer) {
      res.status(400).json({ status: false, data: ["customer not found."] });
    }

    try {
      const ticket = new Ticket({
        topic: req.body.topic,
        subject: req.body.subject,
        message: req.body.message,
        requestedBy: customer._id,
        isClosed: 0,
      });

      await ticket.save();

      return res.json({
        status: true,
        data: { _id: ticket._id, created_at: ticket.created_at },
      });
    } catch (ex) {
      next(ex);
    }
  }

  /**
   * get all tickets
   * @param req
   * @param res
   * @param next
   */
  async getTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const tickets = await Ticket.find();

      return res.json({ status: true, data: tickets });
    } catch (ex) {
      next(ex);
    }
  }

  /**
   * get ticket
   * @param req
   * @param res
   * @param next
   */
  async getTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await Ticket.findById(req.params.id);

      return res.json({ status: true, data: ticket });
    } catch (ex) {
      next(ex);
    }
  }

  /**
   * get ticket with comments
   * @param req
   * @param res
   * @param next
   */
  async getTicketWithComments(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await Ticket.findById(req.params.id);

      const comment = await Comment.find({ ticketId: req.params.ticketId });

      return res.json({
        status: true,
        data: {
          ticket: ticket,
          comments: comment,
        },
      });
    } catch (ex) {
      next(ex);
    }
  }

  /**
   * customer view status of previous request
   * @param req
   * @param res
   * @param next
   */
  async getCustomerPreviousTicketStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const customer = await Customer.findOne({ email: req.body.email });
    if (!customer) {
      return res
        .status(400)
        .json({ status: false, data: ["customer not found."] });
    }

    try {
      const ticket = await Ticket.find({ requestedBy: customer._id })
        .sort({
          created_at: -1,
        })
        .limit(2);

      return res.json({
        status: true,
        data: {
          isClosed: ticket[1].isClosed,
          created_at: ticket[1].created_at,
        },
      });
    } catch (ex) {
      next(ex);
    }
  }

  /**
   * close ticket
   * set isClosed to true
   * @param req
   * @param res
   */
  async closeTicket(req: Request, res: Response, next: NextFunction) {
    const { error } = rules2.validate(req.body);
    if (error)
      return res
        .status(422)
        .json({ status: false, data: [error.details[0].message] });

    try {
      const ticket = await Ticket.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true }
      );

      return res.json({ status: true, data: ticket });
    } catch (ex) {
      next(ex);
    }
  }

  /**
   * generate report for tickets closed
   * in the last one month
   * CSV or PDF
   * @param req
   * @param res
   * @param next
   */
  async getTicketsClosedInLastOneMonth(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const startDate = moment().subtract(30, "days").toDate(); //30 days ago
      const endDate = moment().toDate(); //today

      Ticket.find(
        { isClosed: true, created_at: { $gte: startDate, $lt: endDate } },
        (err, docs) => {
          if (err) {
            return res.status(500).json({ status: false, data: err });
          }

          const timestamp = moment().valueOf();

          const fields = [
            {
              label: "TICKET_ID",
              value: "_id",
            },
            {
              label: "TOPIC",
              value: "topic",
            },
            {
              label: "SUBJECT",
              value: "subject",
            },
            {
              label: "CUSTOMER_ID",
              value: "requestedBy",
            },
            {
              label: "TICKET_STATUS",
              value: "isClosed",
            },
            {
              label: "DATE_FILED",
              value: "created_at",
            },
          ];

          const json2csvParser = new Parser({ fields });
          const csv = json2csvParser.parse(docs);

          res.attachment(`${timestamp}.csv`);
          res.status(200).send(csv);
          //return res.json({ status: true, data: docs });
        }
      );
    } catch (ex) {
      next(ex);
    }
  }
}
