import { describe, expect, it } from "@jest/globals";
import { footerLines, linkSegments, parseFooterText } from "../src/utils/footer";

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

describe("footerLines", () => {
  it("splits the API text into trimmed lines at '|'", () => {
    expect(footerLines("Base IMIS © 2022-2026 | Developed by: ISPL")).toEqual([
      "Base IMIS © 2022-2026",
      "Developed by: ISPL",
    ]);
  });
  it("drops empty parts and handles null", () => {
    expect(footerLines(" a ||  ")).toEqual(["a"]);
    expect(footerLines(null)).toEqual([]);
  });
});

describe("linkSegments", () => {
  const LABELS = ["CC BY-NC-SA 4.0", "Innovative Solution Pvt. Ltd."];
  it("marks known labels as links and keeps the surrounding text", () => {
    expect(linkSegments("licensed under CC BY-NC-SA 4.0 here", LABELS)).toEqual([
      { text: "licensed under ", link: null },
      { text: "CC BY-NC-SA 4.0", link: "CC BY-NC-SA 4.0" },
      { text: " here", link: null },
    ]);
  });
  it("treats '.' in a label literally", () => {
    expect(linkSegments("Developed by: Innovative Solution Pvt. Ltd.", LABELS)).toEqual([
      { text: "Developed by: ", link: null },
      { text: "Innovative Solution Pvt. Ltd.", link: "Innovative Solution Pvt. Ltd." },
    ]);
    expect(linkSegments("Innovative Solution PvtX Ltd.", LABELS)).toEqual([
      { text: "Innovative Solution PvtX Ltd.", link: null },
    ]);
  });
  it("returns the whole line when no label is present", () => {
    expect(linkSegments("Base IMIS", LABELS)).toEqual([{ text: "Base IMIS", link: null }]);
  });
});
