import { authErrorMessage } from "./settingsAuthErrors";

describe("authErrorMessage", () => {
  it("maps wrong password codes", () => {
    expect(authErrorMessage("auth/wrong-password")).toBe("Current password is incorrect.");
    expect(authErrorMessage("auth/invalid-credential")).toBe("Current password is incorrect.");
  });

  it("maps requires recent login", () => {
    expect(authErrorMessage("auth/requires-recent-login")).toContain("sign out");
  });

  it("maps weak password", () => {
    expect(authErrorMessage("auth/weak-password")).toContain("6 characters");
  });

  it("maps provider and credential conflicts", () => {
    expect(authErrorMessage("auth/provider-already-linked")).toContain("already set");
    expect(authErrorMessage("auth/credential-already-in-use")).toContain("already used");
    expect(authErrorMessage("auth/email-already-in-use")).toContain("already associated");
  });

  it("maps popup cancelled", () => {
    expect(authErrorMessage("auth/popup-closed-by-user")).toContain("cancelled");
  });

  it("returns generic message for unknown codes", () => {
    expect(authErrorMessage("auth/unknown")).toBe("Something went wrong. Please try again.");
    expect(authErrorMessage("")).toBe("Something went wrong. Please try again.");
  });
});
