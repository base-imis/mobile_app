import { describe, expect, it } from "@jest/globals";
import { joinWmsUrl } from "../src/utils/wmsUrl";

describe("joinWmsUrl", () => {
  const link = "wms?SERVICE=WMS&LAYERS=imis_base%3Abuildings_layer";

  it("adds the missing slash (staging: baseUrl without trailing slash -> HTTP 403)", () => {
    expect(
      joinWmsUrl("https://geoserver-staging.innovativesolution.com.np/geoserver/imis_base", link)
    ).toBe("https://geoserver-staging.innovativesolution.com.np/geoserver/imis_base/wms?SERVICE=WMS&LAYERS=imis_base%3Abuildings_layer");
  });

  it("does not double the slash when the base already ends with one", () => {
    expect(joinWmsUrl("https://gs.example/geoserver/ws/", "/" + link)).toBe(
      "https://gs.example/geoserver/ws/" + link
    );
  });

  it("keeps an already absolute link", () => {
    expect(joinWmsUrl("https://ignored", "https://gs.example/wms?x=1")).toBe("https://gs.example/wms?x=1");
  });

  it("returns an empty string when a part is missing", () => {
    expect(joinWmsUrl("https://gs.example", undefined)).toBe("");
    expect(joinWmsUrl(undefined, link)).toBe("");
  });
});
