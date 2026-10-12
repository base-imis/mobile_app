import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { getCurrentLocation } from "../../helpers/location";
import { useSelector } from "react-redux";
import { StyleSheet } from "react-native";

// The map is uncontrolled: a controlled `region` prop is re-applied on every
// parent re-render and snaps the camera back while the user is panning. Instead
// the camera animates to the user's location once.
//
// The animation must wait for onMapReady: a cached location often resolves
// before the native map is ready, and Android silently drops animateToRegion
// calls made before then, leaving the camera on the default world view.
const MapComponent = forwardRef(function MapComponent(
  { handleMarkerPress, children, markerdrag },
  ref
) {
  const mapRef = useRef(null);
  const mapReadyRef = useRef(false);
  const pendingRegionRef = useRef(null);
  const { mapType } = useSelector((state) => state.map);

  // Expose the MapView instance (animateToRegion, etc.) to parents that pass a ref
  useImperativeHandle(ref, () => mapRef.current, []);

  const flushPendingRegion = () => {
    if (mapReadyRef.current && pendingRegionRef.current) {
      mapRef.current?.animateToRegion(pendingRegionRef.current, 500);
      pendingRegionRef.current = null;
    }
  };

  const handleMapReady = () => {
    mapReadyRef.current = true;
    flushPendingRegion();
  };

  useEffect(() => {
    let cancelled = false;
    const fetchLocation = async () => {
      try {
        const { coords } = await getCurrentLocation(false);
        if (!cancelled && coords) {
          pendingRegionRef.current = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          flushPendingRegion();
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
      onMapReady={handleMapReady}
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
