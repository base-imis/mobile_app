import React, {useRef, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {INITIAL_LOCATION} from '../../core/constants/map';
import {useSelector} from 'react-redux';
import MapView, {Polygon, PROVIDER_GOOGLE} from 'react-native-maps';
import {askLocationPermission} from '../../helpers/permissions';
import {COLORS} from '../../core/theme';
import {Header} from '../../components/headers';

const ApplicantMapScreen = ({route}) => {
  const mapRef = useRef();

  const {mapType} = useSelector(state => state.map);
  const {item} = route.params;

  const [location, setLocation] = useState({
    ...INITIAL_LOCATION,
    longitude: item.geometry.coordinates[0][0][0][0],
    latitude: item.geometry.coordinates[0][0][0][1],
    longitudeDelta: 0,
    latitudeDelta: 0,
  });

  const [coords, setCoords] = useState([]);

  useEffect(() => {
    askLocationPermission(async () => {
      let coordinates = item.geometry.coordinates[0][0].map(item => {
        return Object.assign({}, {longitude: item[0], latitude: item[1]});
      });

      setCoords(coordinates);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Applicant Location" />
      <MapView
        onLayout={() => {
          mapRef.current.setMapBoundaries(
            {latitude: 27.678, longitude: 85.442},
            {latitude: 27.587, longitude: 85.327},
          );

          mapRef.current.animateToRegion(location);
        }}
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
        {coords.length >= 1 && (
          <>
            <Polygon
              geodesic={false}
              strokeWidth={2}
              strokeColor={COLORS.error}
              fillColor="rgba(45,87,250,0.07)"
              coordinates={coords}
            />
          </>
        )}
      </MapView>
    </View>
  );
};

export default ApplicantMapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },
});
