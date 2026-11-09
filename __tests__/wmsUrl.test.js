import { describe, expect, it } from "@jest/globals";
import { joinWmsUrl, mergeWmsLinks, wmsProxyUrl } from "../src/utils/wmsUrl";

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

describe("wmsProxyUrl", () => {
  const api = "https://imis.example/api";
  const query = "SERVICE=WMS&LAYERS=imis_base%3Abuildings_layer&BBOX={minX},{minY},{maxX},{maxY}";

  it("sends a direct GeoServer link through the API proxy, keeping the tile placeholders", () => {
    expect(wmsProxyUrl(api, `https://gs.example/geoserver/ws/wms?${query}`)).toBe(
      `${api}/gis/wms?${query}`
    );
  });

  it("does not double the path when the backend already returns the proxy", () => {
    expect(wmsProxyUrl(`${api}/`, `${api}/gis/wms/wms?${query}`)).toBe(`${api}/gis/wms?${query}`);
  });

  it("returns an empty string for a missing link or one without a query", () => {
    expect(wmsProxyUrl(api, "")).toBe("");
    expect(wmsProxyUrl(api, undefined)).toBe("");
    expect(wmsProxyUrl(api, "https://gs.example/wms")).toBe("");
  });
});

describe("mergeWmsLinks", () => {
  const link = (layer, style) =>
    `https://gs.example/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS=imis_base:${layer}&STYLES=imis_base:${style}&FORMAT=image/png&BBOX={minX},{minY},{maxX},{maxY}`;

  it("puts every layer in one request, first layer at the bottom", () => {
    const merged = mergeWmsLinks([
      link("buildings_layer", "buildings_layer_none"),
      link("roadlines_layer", "roadlines_layer_width"),
    ]);
    expect(merged).toBe(
      "https://gs.example/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS=imis_base:buildings_layer,imis_base:roadlines_layer&STYLES=imis_base:buildings_layer_none,imis_base:roadlines_layer_width&FORMAT=image/png&BBOX={minX},{minY},{maxX},{maxY}",
    );
  });

  it("skips hidden layers", () => {
    expect(mergeWmsLinks([false, link("wards_layer", "wards_layer_none"), null])).toBe(
      link("wards_layer", "wards_layer_none"),
    );
  });

  it("keeps the layer and style counts equal when a link has no STYLES", () => {
    const merged = mergeWmsLinks([
      "https://gs.example/wms?LAYERS=imis_base:wards_layer",
      link("roadlines_layer", "roadlines_layer_width"),
    ]);
    expect(merged).toContain("LAYERS=imis_base:wards_layer,imis_base:roadlines_layer");
    expect(merged).toContain("STYLES=,imis_base:roadlines_layer_width");
  });

  it("returns an empty string when nothing is visible", () => {
    expect(mergeWmsLinks([false, null, ""])).toBe("");
    expect(mergeWmsLinks(undefined)).toBe("");
  });
});
