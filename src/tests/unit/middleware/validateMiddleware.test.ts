import * as mongoose from "mongoose";

function validateMiddleware(param) {
  if (!mongoose.Types.ObjectId.isValid(param)) {
    return 400;
  }
  return 200;
}

describe("Test Validate Middleware", () => {
  it("should validate object id", () => {
    const objectId = "5f1a14b42ab4896d4b9bd9b3";
    const validate = validateMiddleware(objectId);

    expect(validate).toBe(200);
  });
});
