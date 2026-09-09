import { describe, expect, it } from "vitest";
import { signUpValidator } from "../src/validators/auth.js";

const validUser = {
  firstName: "Rohit",
  lastName: "Chavda",
  email: "rohit@example.com",
  password: "StrongPass1!",
};

describe("signup validation", () => {
  it("accepts a valid user", () => {
    expect(() => signUpValidator(validUser)).not.toThrow();
  });

  it("rejects a weak password", () => {
    expect(() => signUpValidator({ ...validUser, password: "password" })).toThrow(
      "Password must be at least 8 characters",
    );
  });
});
