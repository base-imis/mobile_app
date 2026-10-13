import { describe, expect, it } from "@jest/globals";
import {
  getEmptyingAction,
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

describe("getEmptyingAction", () => {
  const app = (overrides) => ({
    is_anf: false,
    bin: "B000123",
    trip_count: 3,
    emptying_trip_no: 0,
    sludge_trip_no: 0,
    can_add_emptying: true,
    ...overrides,
  });

  it("sends unresolved ANF to the map even if the server says it can add (spec §6)", () => {
    expect(getEmptyingAction(app({ is_anf: true, can_add_emptying: "true" }))).toBe("locate");
  });

  it("respects an explicit server refusal", () => {
    expect(getEmptyingAction(app({ can_add_emptying: "false" }))).toBe("blocked");
  });

  // Three-trip progression from spec §5
  it.each([
    ["scheduled", 0, 0, "first"],
    ["trip 1 emptied, not yet disposed", 1, 0, "blocked"],
    ["trip 1 disposed", 1, 1, "next"],
    ["trip 2 emptied, not yet disposed", 2, 1, "blocked"],
    ["trip 2 disposed", 2, 2, "next"],
    ["all trips emptied", 3, 2, "blocked"],
    ["all trips disposed", 3, 3, "blocked"],
  ])("%s (emptied %i, disposed %i) -> %s", (_label, emptied, disposed, expected) => {
    expect(
      getEmptyingAction(app({ emptying_trip_no: emptied, sludge_trip_no: disposed }))
    ).toBe(expected);
  });

  it("parses trip numbers sent as strings", () => {
    expect(
      getEmptyingAction(app({ emptying_trip_no: "1", sludge_trip_no: "1", trip_count: "2" }))
    ).toBe("next");
  });

  it("recomputes from trip numbers when can_add_emptying is absent", () => {
    expect(getEmptyingAction({ bin: "B1", trip_count: 1 })).toBe("first");
    expect(getEmptyingAction({ bin: "B1", trip_count: 1, emptying_trip_no: 1 })).toBe("blocked");
  });

  it("keeps single-trip applications working (regression, spec §18)", () => {
    expect(getEmptyingAction(app({ trip_count: 1 }))).toBe("first");
  });
});
