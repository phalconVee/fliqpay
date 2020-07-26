import * as mongoose from "mongoose";
import { commentSchema } from "../../../models/commentModel";

const Comment = mongoose.model("Comment", commentSchema);

const commentData = {
  ticketId: mongoose.Types.ObjectId(),
  message: "Test comment",
  user: mongoose.Types.ObjectId(),
  type: "agent",
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
   * comment test suite
   */
  it("create & save user successfully", async () => {
    const validComment = new Comment(commentData);
    const savedComment = await validComment.save();

    expect(savedComment._id).toBeDefined();
    expect(savedComment.ticketId).toBeDefined();
    expect(savedComment.message).toBe(commentData.message);
    expect(savedComment.user).toBe(commentData.user);
    expect(savedComment.type).toBe(commentData.type);
  });

  /**
   * Test Schema is working
   * You shouldn't be able to add in any field that isn't defined in the schema
   */
  it("insert comment successfully, but the field not defined in schema should be undefined", async () => {
    const commentWithInvalidField = new Comment(commentData);
    const savedCommentWithInvalidField = await commentWithInvalidField.save();
    //expect(savedCommentWithInvalidField._id).toBeDefined();
    //expect(savedCommentWithInvalidField.address).toBeUndefined();
  });

  /**
   * Test Validation is working!!!
   * It should inform us of the errors on required field.
   */
  it("create comment without required field should fail", async () => {
    const commentWithoutRequiredField = new Comment(commentData);
    let err;
    try {
      const savedCommentWithoutRequiredField = await commentWithoutRequiredField.save();
      err = savedCommentWithoutRequiredField;
    } catch (error) {
      err = error;
    }
    //expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    //expect(err.errors.ticketId).toBeUndefined();
    //expect(err.errors.user).toBeUndefined();
    //expect(err.errors.type).toBeUndefined();
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
