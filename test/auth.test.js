import { describe, expect, it } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateSignUpName,
} from "../src/validators/auth.js";

const validUser = {
  firstName: "Rohit",
  lastName: "Chavda",
  email: "rohit@example.com",
  password: "StrongPass1!",
};

describe("signup validation", () => {
  it("accepts a valid user", () => {
    const req = { body: validUser };

    expect(validateSignUpName(req)).toBeNull();
    expect(validateEmail(req)).toBeNull();
    expect(validatePassword(req)).toBeNull();
  });

  it("rejects a weak password", () => {
    expect(
      validatePassword({ body: { ...validUser, password: "password" } }),
    ).toContain("Password must be at least 8 characters");
  });
});
