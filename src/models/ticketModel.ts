import * as mongoose from "mongoose";

export const ticketSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    enum: ["account", "billing", "website"],
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 50,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 255,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    //ref: 'Customer'
  },
  isClosed: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});
