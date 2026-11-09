const EARTH_RADIUS = 6378137;
const toDegrees = (radians) => (radians * 180) / Math.PI;

// Web Mercator (EPSG:3857) metres to latitude/longitude
const toLatLng = (x, y) => ({
  longitude: toDegrees(x / EARTH_RADIUS),
  latitude: toDegrees(2 * Math.atan(Math.exp(y / EARTH_RADIUS)) - Math.PI / 2),
});

// Map region covering the municipality bbox returned by GET wms/{layer}
// ("minX,minY,maxX,maxY" in EPSG:3857). Returns null when it is unusable.
export const bboxToRegion = (bbox) => {
  const parts = String(bbox ?? "").split(",").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
  const [minX, minY, maxX, maxY] = parts;
  const southWest = toLatLng(minX, minY);
  const northEast = toLatLng(maxX, maxY);
  return {
    latitude: (southWest.latitude + northEast.latitude) / 2,
    longitude: (southWest.longitude + northEast.longitude) / 2,
    latitudeDelta: northEast.latitude - southWest.latitude,
    longitudeDelta: northEast.longitude - southWest.longitude,
  };
};
