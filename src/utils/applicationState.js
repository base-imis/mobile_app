// Interprets application workflow state returned by GET /api/assessed-applications.
// See "ANF and Multi-Trip API Implementation Specification" §3, §5, §6.

// The API mixes booleans, integers and strings ("true", "0", ...) for the same
// flag, so a plain truthiness check would treat the string "false" as true.
export const toBool = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "true" || v === "1" || v === "yes";
  }
  return false;
};

export const toNumber = (value, fallback = 0) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

// An application is pending ANF until a building and containment are linked.
// `is_anf` is authoritative; older payloads without it fall back to a missing BIN.
export const isAnfPending = (item) => {
  if (item && item.is_anf !== undefined && item.is_anf !== null) {
    return toBool(item.is_anf);
  }
  return !item?.bin;
};

// Trip progress for display, e.g. "Trip 2 of 3".
export const getTripProgress = (item) => ({
  done: toNumber(item?.emptying_trip_no),
  total: Math.max(1, toNumber(item?.trip_count, 1)),
});

/**
 * Decide what the emptying list card should offer for an application.
 *
 * Returns one of:
 *   "locate"  - ANF unresolved: open the ANF map to link a building/containment
 *   "first"   - start trip 1
 *   "next"    - record the next trip of a multi-trip application
 *   "blocked" - nothing allowed right now (e.g. waiting for the FSTP disposal
 *               of the previous trip to catch up)
 *
 * Relevant fields on `item`: is_anf, can_add_emptying, emptying_add_mode
 * ("first" | "next"), emptying_trip_no, sludge_trip_no, trip_count.
 *
 * Spec §6 notes the server can report can_add_emptying = "true" for an
 * unresolved first-trip ANF application even though save-emptying rejects it.
 */
export const getEmptyingAction = (item) => {
  // TODO(rajan): see the request in the conversation - this placeholder only
  // distinguishes ANF from non-ANF and ignores trip/disposal sequencing.
  if (isAnfPending(item)) return "locate";
  return "first";
};
