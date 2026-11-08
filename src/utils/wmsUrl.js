/**
 * Joins the GeoServer base URL from GET wms/{layer} (`baseUrl`) with a layer
 * link (`data.<layer>`, e.g. "wms?SERVICE=WMS&..."), using exactly one "/".
 *
 * Staging returns baseUrl without a trailing slash, so plain concatenation
 * produced ".../geoserver/imis_basewms?..." and every tile request got HTTP 403.
 * Returns "" when either part is missing (screens treat "" as "no layer").
 */
export function joinWmsUrl(baseUrl, path) {
  if (!path || typeof path !== 'string') return '';
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  if (!baseUrl || typeof baseUrl !== 'string') return '';
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/**
 * Points a WMS link at the API's tile proxy (GET api/gis/wms). GeoServer needs a
 * server-side auth key, so tiles must go through the proxy with the user's token.
 * Only the query is kept, whichever base the API returned for the link.
 * Returns "" when the link has no query.
 */
export function wmsProxyUrl(apiBaseUrl, link) {
  if (!link || typeof link !== 'string' || !link.includes('?')) return '';
  const query = link.slice(link.indexOf('?') + 1);
  return `${apiBaseUrl.replace(/\/+$/, '')}/gis/wms?${query}`;
}

/**
 * Transforms a WMS URL from the API into a format compatible with
 * react-native-maps WMSTile component.
 *
 * WMSTile expects these placeholders in the urlTemplate:
 *   {minX}, {minY}, {maxX}, {maxY} — bounding box (EPSG:900913)
 *   {width}, {height} — image dimensions
 *
 * The API may return URLs with hardcoded or parameterized BBOX, WIDTH, HEIGHT.
 * This function replaces them with the correct placeholders so tiles render
 * properly at every zoom level and position.
 */
export function formatWmsUrl(url) {
  if (!url || typeof url !== 'string') return url;

  let formatted = url;

  // Replace BBOX parameter value with WMSTile placeholders
  // Matches BBOX=<anything> up to the next & or end of string
  formatted = formatted.replace(
    /([?&])BBOX=[^&]*/i,
    '$1BBOX={minX},{minY},{maxX},{maxY}',
  );

  // Replace WIDTH parameter value
  formatted = formatted.replace(
    /([?&])WIDTH=[^&]*/i,
    '$1WIDTH={width}',
  );

  // Replace HEIGHT parameter value
  formatted = formatted.replace(
    /([?&])HEIGHT=[^&]*/i,
    '$1HEIGHT={height}',
  );

  // If BBOX param doesn't exist at all, append it
  if (!/BBOX=/i.test(formatted)) {
    formatted += (formatted.includes('?') ? '&' : '?') +
      'BBOX={minX},{minY},{maxX},{maxY}';
  }

  // If WIDTH param doesn't exist, append it
  if (!/WIDTH=/i.test(formatted)) {
    formatted += '&WIDTH={width}';
  }

  // If HEIGHT param doesn't exist, append it
  if (!/HEIGHT=/i.test(formatted)) {
    formatted += '&HEIGHT={height}';
  }

  // Ensure SRS/CRS is set to EPSG:900913 (Web Mercator) which WMSTile uses
  if (/SRS=/i.test(formatted)) {
    formatted = formatted.replace(/([?&])SRS=[^&]*/i, '$1SRS=EPSG:900913');
  } else if (/CRS=/i.test(formatted)) {
    formatted = formatted.replace(/([?&])CRS=[^&]*/i, '$1CRS=EPSG:900913');
  }

  // Ensure FORMAT is image/png for transparency support
  if (/FORMAT=/i.test(formatted)) {
    formatted = formatted.replace(/([?&])FORMAT=[^&]*/i, '$1FORMAT=image/png');
  }

  return formatted;
}


/**
 * Merges WMS links for several layers into one GetMap link, so each map tile is a
 * single request instead of one per layer. Falsy links (hidden layers) are skipped.
 * LAYERS and STYLES keep the given order; GeoServer draws the first one at the bottom.
 * Returns "" when no link is left.
 */
export function mergeWmsLinks(links) {
  const usable = (links || []).filter(
    (link) => typeof link === 'string' && link.includes('?'),
  );
  if (!usable.length) return '';

  const param = (link, name) => {
    const match = link.match(new RegExp(`[?&]${name}=([^&]*)`, 'i'));
    return match ? match[1] : '';
  };
  const layers = usable.map((link) => param(link, 'LAYERS')).join(',');
  const styles = usable.map((link) => param(link, 'STYLES')).join(',');

  const set = (link, name, value) =>
    new RegExp(`[?&]${name}=`, 'i').test(link)
      ? link.replace(new RegExp(`([?&])${name}=[^&]*`, 'i'), `$1${name}=${value}`)
      : `${link}&${name}=${value}`;

  return set(set(usable[0], 'LAYERS', layers), 'STYLES', styles);
}
