import * as mongoose from "mongoose";

export const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: "Enter a name",
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
    unique: true,
  },
  password: {
    type: String,
    maxlength: 255,
    required: true,
  },
  phone: {
    type: Number,
    minlength: 0,
    maxlength: 12,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});
