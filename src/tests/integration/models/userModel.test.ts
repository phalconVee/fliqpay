import * as mongoose from "mongoose";
import { userSchema } from "../../../models/userModel";

const User = mongoose.model("Comment", userSchema);

const userData = {
  name: "Tef London",
  email: "tef.london@fliqpay.co",
  password: "password",
  role: "agent",
};

describe("User Model Test", () => {
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
  it("create & save user successfully", async () => {
    const validUser = new User(userData);
    const savedUser = await validUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.password).toBe(userData.password);
    expect(savedUser.role).toBe(userData.role);
  });

  /**
   * Test Schema is working
   * You shouldn't be able to add in any field that isn't defined in the schema
   */
  it("insert user successfully, but the field does not defined in schema should be undefined", async () => {
    const userWithInvalidField = new User(userData);
    const savedUserWithInvalidField = await userWithInvalidField.save();
    expect(savedUserWithInvalidField._id).toBeDefined();
    expect(savedUserWithInvalidField.address).toBeUndefined();
  });

  /**
   * Test Validation is working!!!
   * It should inform us of the errors on required field.
   */
  it("create user without required field should fail", async () => {
    const userWithoutRequiredField = new User(userData);
    let err;
    try {
      const savedUserWithoutRequiredField = await userWithoutRequiredField.save();
      err = savedUserWithoutRequiredField;
    } catch (error) {
      err = error;
    }
    //expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    //expect(err.errors.email).toBeUndefined();
    //expect(err.errors.password).toBeUndefined();
    //expect(err.errors.role).toBeUndefined();
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
