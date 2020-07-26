import * as mongoose from "mongoose";

export const commentSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Ticket",
  },
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["admin", "agent", "customer"],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});
