import { describe, expect, it } from "@jest/globals";
import { parseFooterText } from "../src/utils/footer";

describe("parseFooterText", () => {
  it("reads the array shape returned by staging", () => {
    expect(parseFooterText(["Base IMIS © 2022-2026 | Developed by: Innovative Solution Pvt. Ltd."]))
      .toBe("Base IMIS © 2022-2026 | Developed by: Innovative Solution Pvt. Ltd.");
  });
  it("reads a plain string", () => {
    expect(parseFooterText("  Footer  ")).toBe("Footer");
  });
  it("reads the { left, right.label } object shape", () => {
    expect(parseFooterText({ left: "Base IMIS ©", right: { label: "ISPL" } })).toBe("Base IMIS © ISPL");
  });
  it("returns null for empty or unexpected payloads, so the built-in footer is kept", () => {
    expect(parseFooterText([])).toBeNull();
    expect(parseFooterText("")).toBeNull();
    expect(parseFooterText(null)).toBeNull();
    expect(parseFooterText([42])).toBeNull();
  });
});
