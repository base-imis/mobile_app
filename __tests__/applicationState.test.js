import { describe, expect, it } from "@jest/globals";
import {
  getTripProgress,
  isAnfPending,
  toBool,
  toNumber,
} from "../src/utils/applicationState";

describe("toBool", () => {
  // Spec §3: the API mixes booleans, integers and string booleans
  it.each([
    [true, true],
    [false, false],
    [1, true],
    [0, false],
    ["true", true],
    ["TRUE", true],
    ["1", true],
    ["false", false],
    ["0", false],
    ["", false],
    [null, false],
    [undefined, false],
  ])("toBool(%p) -> %p", (input, expected) => {
    expect(toBool(input)).toBe(expected);
  });
});

describe("toNumber", () => {
  it("parses numeric strings", () => {
    expect(toNumber("12.5")).toBe(12.5);
  });
  it("falls back for non-numeric input", () => {
    expect(toNumber(null, 7)).toBe(7);
    expect(toNumber("abc", 3)).toBe(3);
  });
});

describe("isAnfPending", () => {
  it("trusts is_anf when present, in any encoding", () => {
    expect(isAnfPending({ is_anf: true, bin: "B1" })).toBe(true);
    expect(isAnfPending({ is_anf: "false", bin: null })).toBe(false);
    expect(isAnfPending({ is_anf: 0 })).toBe(false);
  });
  it("falls back to a missing BIN for payloads without is_anf", () => {
    expect(isAnfPending({ bin: null })).toBe(true);
    expect(isAnfPending({ bin: "B000123" })).toBe(false);
  });
});

describe("getTripProgress", () => {
  it("reads string trip numbers", () => {
    expect(getTripProgress({ emptying_trip_no: "1", trip_count: "3" })).toEqual({
      done: 1,
      total: 3,
    });
  });
  it("treats a missing trip_count as a single trip", () => {
    expect(getTripProgress({})).toEqual({ done: 0, total: 1 });
  });
});
