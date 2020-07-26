require("dotenv").config();
import * as jwt from "jsonwebtoken";
import * as mongoose from "mongoose";
import { userSchema } from "../../../models/userModel";

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWT_PRIVATE_KEY
  );
};

const User = mongoose.model("User", userSchema);

describe("user generate auth token", () => {
  it("should return a valid JWT", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      role: "admin",
    };
    const user = new User(payload);
    const token = user.generateAuthToken();

    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

    expect(decoded).toMatchObject(payload);
  });
});
