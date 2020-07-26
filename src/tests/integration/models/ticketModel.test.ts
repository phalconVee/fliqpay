import * as mongoose from "mongoose";
import { ticketSchema } from "../../../models/ticketModel";

const Ticket = mongoose.model("Ticket", ticketSchema);

const ticketData = {
  topic: "billing",
  subject: "billing problem",
  message: "Billing Issues is becoming rampant",
  requestedBy: mongoose.Types.ObjectId(),
  isClosed: true,
};

describe("Comment Model Test", () => {
  /**
   * connect to mongoose db
   */
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
  });

  /**
   * ticket test suite
   */
  it("create & save ticket successfully", async () => {
    const validTicktet = new Ticket(ticketData);
    const savedTicket = await validTicktet.save();

    expect(savedTicket._id).toBeDefined();
    expect(savedTicket.topic).toBe(ticketData.topic);
    expect(savedTicket.subject).toBe(ticketData.subject);
    expect(savedTicket.message).toBe(ticketData.message);
    expect(savedTicket.requestedBy).toBe(ticketData.requestedBy);
    expect(savedTicket.isClosed).toBe(ticketData.isClosed);
  });

  /**
   * Test Schema is working
   * You shouldn't be able to add in any field that isn't defined in the schema
   */
  it("insert ticket successfully, but the field not defined in schema should be undefined", async () => {
    const ticketWithInvalidField = new Ticket(ticketData);
    const savedTicketWithInvalidField = await ticketWithInvalidField.save();
    //expect(savedTicketWithInvalidField._id).toBeDefined();
    //expect(savedTicketWithInvalidField.partner).toBeUndefined();
  });

  /**
   * Test Validation is working!!!
   * It should inform us of the errors on required field.
   */
  it("create ticket without required field should fail", async () => {
    const ticketWithoutRequiredField = new Ticket(ticketData);
    let err;
    try {
      const savedTicketWithoutRequiredField = await ticketWithoutRequiredField.save();
      err = savedTicketWithoutRequiredField;
    } catch (error) {
      err = error;
    }
    //expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    //expect(err.errors.topic).toBeUndefined();
    //expect(err.errors.subject).toBeUndefined();
    //expect(err.errors.message).toBeUndefined();
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
  });
});
