const request = require("supertest");
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import * as mongoose from "mongoose";
import app from "../../../app";

import { customerSchema } from "../../../models/customerModel";
import { commentSchema } from "../../../models/commentModel";
import { ticketSchema } from "../../../models/ticketModel";
import { userSchema } from "../../../models/userModel";

const Customer = mongoose.model("Customer", customerSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Ticket = mongoose.model("Ticket", ticketSchema);
const User = mongoose.model("User", userSchema);

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWT_PRIVATE_KEY
  );
};

let server;

describe("Project Suite Test", () => {
  // conect to mongodb by using mongoose
  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGO_URL,
      { useNewUrlParser: true, useCreateIndex: true },
      (err) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
      }
    );

    server = app.listen(process.env.PORT);
  });

  /**
   * Remove all the data for all db collections.
   */
  afterEach(async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  });

  /**
   * Remove and close the db and server.
   */
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    server.close();
  });

  it("should be able to hit the entry endpoint", async () => {
    const response = await request(server).get("/");

    expect(response.status).toBe(200);
  });

  it("should login a user", async () => {
    const user = new User({
      name: "Marco Vanbasten",
      email: "marco@fliqpay.co",
      password: "password",
      role: "admin",
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    const response = await request(server).post("/api/login").send({
      email: user.email,
      password: "password",
    });

    expect(response.status).toBe(200);
  });

  it("should fetch current logged in user", async () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      role: "admin",
    };
    const user = new User(payload);
    const token = user.generateAuthToken();
    const res = await request(server)
      .get("/api/user/me")
      .set("x-auth-token", token);

    expect(res.status).toBe(200);
  });

  it("should return 403 if proper access level is not met", async () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      role: "agent",
    };
    const user = new User(payload);
    const token = user.generateAuthToken();
    const res = await request(server)
      .get("/api/user")
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should create and save new user", async () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      role: "admin",
    };

    const newUser = {
      name: "Raul Gonzalez",
      email: "raul@fliqpay.co",
      password: "secret",
      role: "agent",
    };

    const user = new User(payload);
    const token = user.generateAuthToken();
    const res = await request(server)
      .post("/api/user")
      .set("x-auth-token", token)
      .send(newUser);

    expect(res.status).toBe(200);
  });

  it("should fetch customers", async () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      role: "admin",
    };

    const user = new User(payload);
    const token = user.generateAuthToken();
    const res = await request(server)
      .get("/api/customer")
      .set("x-auth-token", token);

    expect(res.status).toBe(200);
  });

  it("should create and save new customer", async () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      role: "admin",
    };

    const customer = {
      name: "Luka Modric",
      email: "luka@fliqpay.co",
      password: "secret",
      phone: "09133396477",
    };

    const user = new User(payload);
    const token = user.generateAuthToken();
    const res = await request(server)
      .post("/api/customer")
      .set("x-auth-token", token)
      .send(customer);

    expect(res.status).toBe(200);
  });

  it("should return tickets", async () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      role: "admin",
    };

    const user = new User(payload);
    const token = user.generateAuthToken();
    const res = await request(server)
      .get("/api/ticket")
      .set("x-auth-token", token);

    expect(res.status).toBe(200);
  });

  it("should return 401 if user is not logged in", async () => {
    const ticket = new Ticket({
      topic: "website",
      subject: "a sample subject",
      message: " a sample message",
      requestedBy: mongoose.Types.ObjectId(),
      isClosed: false,
    });

    await ticket.save();

    const res = await request(server).get("/api/ticket/" + ticket._id);

    expect(res.status).toBe(401);
  });

  it("should fetch ticket with ticketId", async () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      role: "admin",
    };

    const user = new User(payload);
    const token = user.generateAuthToken();

    const ticket = new Ticket({
      topic: "website",
      subject: "a sample subject",
      message: " a sample message",
      requestedBy: mongoose.Types.ObjectId(),
      isClosed: false,
    });

    await ticket.save();

    const res = await request(server)
      .get("/api/ticket/" + ticket._id)
      .set("x-auth-token", token);

    expect(res.status).toBe(200);
  });

  it("should close ticket with ticketId", async () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      role: "agent",
    };

    const user = new User(payload);
    const token = user.generateAuthToken();

    const ticket = new Ticket({
      topic: "website",
      subject: "a sample subject",
      message: " a sample message",
      requestedBy: mongoose.Types.ObjectId(),
      isClosed: false,
    });

    await ticket.save();

    const res = await request(server)
      .post("/api/ticket/close/" + ticket._id)
      .set("x-auth-token", token)
      .send({
        isClosed: true,
      });

    expect(res.status).toBe(200);
  });

  it("should generate csv report on tickets closed within the last one month", async () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      role: "agent",
    };

    const user = new User(payload);
    const token = user.generateAuthToken();

    await request(server)
      .get("/api/report/ticket")
      .set("x-auth-token", token)
      .expect("content-type", "text/csv; charset=utf-8");
  });

  it("should add user comment", async () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      role: "agent",
    };

    const user = new User(payload);
    const token = user.generateAuthToken();

    const comment = {
      ticketId: "5f1a14b42ab4896d4b9bd9b3",
      message: "I will go ahead to close",
    };

    const res = await request(server)
      .post("/api/ticket/comment/user")
      .set("x-auth-token", token)
      .send(comment);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject(comment);
  });

  it("should allow customer create ticket", async () => {
    const customer = new Customer({
      name: "Timi Dakolo",
      email: "timiboi@yahoo.co.uk",
      password: "secret",
      phone: "09133396477",
    });

    await customer.save();

    const ticket = {
      topic: "account",
      subject: "How to enable 2-factor authentication",
      message:
        "I am tyring to enable 2-factor authentication on my host account",
      email: "timiboi@yahoo.co.uk",
    };

    const res = await request(server).post("/api/ticket/create").send(ticket);

    expect(res.status).toBe(200);
  });
});
