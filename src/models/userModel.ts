import * as mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
    minlength: 5,
    maxlength: 255,
    required: true,
  },
  role: {
    type: String,
    maxlength: 6,
    required: true,
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
});
