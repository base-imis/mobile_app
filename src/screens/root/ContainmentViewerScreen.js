import React, {useRef, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {INITIAL_LOCATION} from '../../core/constants/map';
import {useSelector} from 'react-redux';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {Header} from '../../components/headers';

const ContainmentViewerScreen = ({route}) => {
  const mapRef = useRef();
  const [location, setLocation] = useState(INITIAL_LOCATION);
  const {mapType} = useSelector(state => state.map);
  const {item} = route.params;

  useEffect(() => {
    setLocation({
      ...location,
      latitude: item.latitude,
      longitude: item.longitude,
    });
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Containment Location" />
      <MapView
        onLayout={() =>
          mapRef.current.setMapBoundaries(
            {latitude: 27.678, longitude: 85.442},
            {latitude: 27.587, longitude: 85.327},
          )
        }
        ref={mapRef}
        style={styles.map}
        initialRegion={location}
        region={location}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        zoomControlEnabled
        mapType={mapType}
        showsIndoors={false}
        minZoomLevel={13}
        showsBuildings={false}
        moveOnMarkerPress={false}
        showsPointsOfInterest={false}>
        <Marker
          coordinate={{
            latitude: item.latitude,
            longitude: item.longitude,
          }}
        />
      </MapView>
    </View>
  );
};

export default ContainmentViewerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },
});
