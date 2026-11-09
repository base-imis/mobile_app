import { describe, expect, it } from "@jest/globals";
import { bboxToRegion } from "../src/utils/mapRegion";

describe("bboxToRegion", () => {
  // bbox returned by GET wms/{layer} on staging (EPSG:3857)
  const staging = "9499294.829600912,3201237.9884866863,9505273.468106326,3207651.002046891";

  it("centres on the municipality extent", () => {
    const region = bboxToRegion(staging);
    expect(region.longitude).toBeCloseTo(85.3601, 3);
    expect(region.latitude).toBeCloseTo(27.6462, 3);
  });

  it("spans the whole extent", () => {
    const region = bboxToRegion(staging);
    expect(region.longitudeDelta).toBeCloseTo(0.0537, 3);
    expect(region.latitudeDelta).toBeCloseTo(0.0510, 3);
  });

  it("returns null for a missing or malformed bbox", () => {
    expect(bboxToRegion(undefined)).toBeNull();
    expect(bboxToRegion("")).toBeNull();
    expect(bboxToRegion("1,2,3")).toBeNull();
    expect(bboxToRegion("a,b,c,d")).toBeNull();
  });
});
