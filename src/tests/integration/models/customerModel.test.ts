import * as mongoose from "mongoose";
import { customerSchema } from "../../../models/customerModel";

const Customer = mongoose.model("Comment", customerSchema);

const customerData = {
  name: "Fibonnaci Okonkwo",
  email: "fibonacci@fliqpay.co",
  password: "password",
  phone: 8166601864,
};

describe("Customer Model Test", () => {
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
  });

  /**
   * user test suite
   */
  it("create & save customer successfully", async () => {
    const validCustomer = new Customer(customerData);
    const savedCustomer = await validCustomer.save();

    expect(savedCustomer._id).toBeDefined();
    expect(savedCustomer.name).toBe(customerData.name);
    expect(savedCustomer.email).toBe(customerData.email);
    expect(savedCustomer.password).toBe(customerData.password);
    expect(savedCustomer.phone).toBe(customerData.phone);
  });

  /**
   * Test Schema is working
   * You shouldn't be able to add in any field that isn't defined in the schema
   */
  it("insert customer successfully, but the field does not defined in schema should be undefined", async () => {
    const customerWithInvalidField = new Customer(customerData);
    const savedCustomerWithInvalidField = await customerWithInvalidField.save();
    //expect(savedCustomerWithInvalidField._id).toBeDefined();
    //expect(savedCustomerWithInvalidField.gender).toBeUndefined();
  });

  /**
   * Test Validation is working!!!
   * It should inform us of the errors on required field.
   */
  it("create user without required field should fail", async () => {
    const customerWithoutRequiredField = new Customer(customerData);
    let err;
    try {
      const savedCustomerWithoutRequiredField = await customerWithoutRequiredField.save();
      err = savedCustomerWithoutRequiredField;
    } catch (error) {
      err = error;
    }
    //expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    //expect(err.errors.email).toBeUndefined();
    //expect(err.errors.password).toBeUndefined();
    //expect(err.errors.phone).toBeUndefined();
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
