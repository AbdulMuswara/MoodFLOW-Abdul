import type { Timestamp } from "firebase/firestore";
import { formatMemberSince, initials } from "./profileDisplayUtils";

describe("formatMemberSince", () => {
  it("returns em dash when createdAt is missing", () => {
    expect(formatMemberSince(undefined)).toBe("—");
  });

  it("returns em dash when toDate is missing", () => {
    expect(formatMemberSince({} as unknown as Timestamp)).toBe("—");
  });

  it("formats a valid Firestore timestamp", () => {
    const ts = {
      toDate: () => new Date(Date.UTC(2024, 0, 15)),
    } as unknown as Timestamp;
    expect(formatMemberSince(ts)).toMatch(/Jan/);
    expect(formatMemberSince(ts)).toMatch(/2024/);
  });

  it("returns em dash when toDate throws", () => {
    const ts = {
      toDate: () => {
        throw new Error("bad");
      },
    } as unknown as Timestamp;
    expect(formatMemberSince(ts)).toBe("—");
  });
});

describe("initials", () => {
  it("uses first and last initials when both present", () => {
    expect(initials("Jane", "Doe", "x")).toBe("JD");
  });

  it("uses only first when last is empty", () => {
    expect(initials("Sam", "", "ignored")).toBe("S");
  });

  it("uses two chars from fallback when no first initial", () => {
    expect(initials("", "", "ab")).toBe("AB");
  });

  it("uses single fallback char when shorter than two", () => {
    expect(initials("", "", "z")).toBe("Z");
  });

  it("returns question mark when nothing usable", () => {
    expect(initials("", "", "")).toBe("?");
  });

  it("trims whitespace before computing", () => {
    expect(initials("  A  ", "  B  ", "")).toBe("AB");
  });
});
