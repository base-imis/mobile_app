import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { getCurrentLocation } from "../../helpers/location";
import { useSelector } from "react-redux";
import { StyleSheet } from "react-native";

// The map is uncontrolled: a controlled `region` prop is re-applied on every
// parent re-render and snaps the camera back while the user is panning. Instead
// the camera animates to the user's location once, after it is resolved.
const MapComponent = forwardRef(function MapComponent(
  { handleMarkerPress, children, markerdrag },
  ref
) {
  const mapRef = useRef(null);
  const { mapType } = useSelector((state) => state.map);

  // Expose the MapView instance (animateToRegion, etc.) to parents that pass a ref
  useImperativeHandle(ref, () => mapRef.current, []);

  useEffect(() => {
    let cancelled = false;
    const fetchLocation = async () => {
      try {
        const { coords } = await getCurrentLocation(false);
        if (!cancelled && coords) {
          mapRef.current?.animateToRegion(
            {
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            500
          );
        }
      } catch (error) {}
    };
    fetchLocation();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      maxZoomLevel={30}
      poiClickEnabled={false}
      onPress={handleMarkerPress}
      onLongPress={handleMarkerPress}
      provider={PROVIDER_GOOGLE}
      showsUserLocation
      zoomControlEnabled
      mapType={mapType}
      showsIndoors={false}
      showsBuildings={false}
      moveOnMarkerPress={false}
      scrollEnabled={markerdrag ?? true}
      zoomEnabled={markerdrag ?? true}
      rotateEnabled={markerdrag ?? true}
      // followsUserLocation={true}
      showsPointsOfInterest={false}
    >
      {children}
    </MapView>
  );
});

export default MapComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },
});
