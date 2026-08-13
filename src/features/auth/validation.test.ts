import { describe, expect, it } from "vitest";

import { validateCredentials } from "@/features/auth/validation";

function credentials(email: string, password: string) {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("password", password);

  return formData;
}

describe("validateCredentials", () => {
  it("normalizes a valid email and preserves the password", () => {
    const result = validateCredentials(
      credentials("  Reader@Example.com ", "secret123"),
      "sign-in",
    );

    expect(result).toEqual({
      credentials: {
        email: "reader@example.com",
        password: "secret123",
      },
      errors: {},
      valid: true,
    });
  });

  it("rejects an invalid email and a short password", () => {
    const result = validateCredentials(
      credentials("not-an-email", "123"),
      "sign-up",
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual({
      email: "validation.email.invalid",
      password: "validation.password.too_short",
    });
  });

  it("rejects an overlong password", () => {
    const result = validateCredentials(
      credentials("reader@example.com", "a".repeat(73)),
      "sign-up",
    );

    expect(result.errors.password).toBe("validation.password.too_long");
  });

  it("rejects a sign-up password containing only spaces", () => {
    const result = validateCredentials(
      credentials("reader@example.com", "      "),
      "sign-up",
    );

    expect(result.errors.password).toBe("validation.password.only_spaces");
  });
});
