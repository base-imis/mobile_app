import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { FAB } from "react-native-paper";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";

import { COLORS } from "../../core/theme";
import { getWardWmsLink } from "../../service/building_service";
import { bboxToRegion } from "../../utils/mapRegion";

// The municipality extent does not change while the app runs
let cachedRegion = null;

// Zooms the map to the municipality, taken from the bbox the WMS API returns.
// Hidden until a usable bbox is known.
const ZoomToCityButton = ({ mapRef, bottom = 175 }) => {
  const [region, setRegion] = useState(cachedRegion);

  useEffect(() => {
    if (cachedRegion) return undefined;
    let active = true;
    getWardWmsLink()
      .then((response) => {
        const found = bboxToRegion(response?.data?.bbox);
        if (found) {
          cachedRegion = found;
          if (active) setRegion(found);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!region) return null;

  return (
    <FAB
      animated={false}
      accessibilityLabel="Zoom to municipality"
      style={[styles.fab, { bottom }]}
      icon={() => <MaterialIcon name="location-city" size={25} color="white" />}
      onPress={() => mapRef.current?.animateToRegion(region, 1000)}
    />
  );
};

export default ZoomToCityButton;

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    marginLeft: 15,
    backgroundColor: COLORS.primary,
  },
});
