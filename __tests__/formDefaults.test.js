import { describe, expect, it } from "@jest/globals";
import { formDefaults } from "../src/utils/formDefaults";

describe("formDefaults", () => {
  const openedAt = new Date(2026, 10, 8, 14, 30);

  it("prefills emptying start time with the open time and end time 30 minutes later", () => {
    expect(formDefaults("emptying", openedAt)).toEqual({ start_time: "14:30", end_time: "15:00" });
  });

  it("prefills sludge date, entry time and exit time", () => {
    expect(formDefaults("sludge", openedAt)).toEqual({
      date: "2026-11-08",
      entry_time: "14:30",
      exit_time: "15:00",
    });
  });

  it("keeps the end time on the same day so it stays after the start time", () => {
    expect(formDefaults("emptying", new Date(2026, 10, 8, 23, 45))).toEqual({
      start_time: "23:45",
      end_time: "23:59",
    });
  });

  it("uses 24-hour times", () => {
    expect(formDefaults("emptying", new Date(2026, 10, 8, 9, 5)).start_time).toBe("09:05");
  });

  it("has no defaults for other forms", () => {
    expect(formDefaults("building", openedAt)).toEqual({});
  });
});
