import React from "react";
import { WMSTile } from "react-native-maps";
import { useSelector } from "react-redux";

import { BASE_URL_ENV } from "../../constants/config";
import { mergeWmsLinks, wmsProxyUrl } from "../../utils/wmsUrl";

// WMS overlay that loads through the API proxy with the logged-in user's token.
// `links` are the visible layers' WMS links (falsy = hidden); they are fetched as
// one image per tile, bottom layer first. `authHeader` comes from the
// react-native-maps patch in .yarn/patches.
// No maximumZ: tiles are requested at every zoom, so layers stay visible when the
// map is fully zoomed in.
const SecureWMSTile = ({ links, ...props }) => {
  const token = useSelector((state) => state.auth.token);
  const urlTemplate = wmsProxyUrl(`${BASE_URL_ENV}/api`, mergeWmsLinks(links));

  if (!urlTemplate) return null;

  // A new key per URL rebuilds the overlay when layers are toggled. Changing the
  // URL of an existing WMSTile makes react-native-maps (Android) switch to a plain
  // XYZ provider, so the BBOX placeholders are never filled and tiles come back empty.
  return (
    <WMSTile
      key={urlTemplate}
      tileSize={512}
      {...props}
      urlTemplate={urlTemplate}
      authHeader={`Bearer ${token}`}
    />
  );
};

export default SecureWMSTile;
