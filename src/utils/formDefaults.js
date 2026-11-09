import dayjs from "dayjs";

const TIME = "HH:mm"; // 24-hour, as the API validates (date_format:H:i)

// Values to prefill when a form opens. `openedAt` is captured once per screen so
// a reload of the fields does not move the times while the user is filling in.
export const formDefaults = (type, openedAt) => {
  const start = dayjs(openedAt);
  // End stays on the same day, otherwise "after:start_time" fails near midnight
  const later = start.add(30, "minute");
  const end = later.isSame(start, "day") ? later : start.endOf("day");

  if (type === "emptying") {
    return { start_time: start.format(TIME), end_time: end.format(TIME) };
  }
  if (type === "sludge") {
    return {
      date: start.format("YYYY-MM-DD"),
      entry_time: start.format(TIME),
      exit_time: end.format(TIME),
    };
  }
  return {};
};
