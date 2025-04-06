import React, { useRef, useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { INITIAL_LOCATION } from "../../core/constants/map";

import { useDispatch, useSelector } from "react-redux";
import MapView, { Polygon, PROVIDER_GOOGLE, WMSTile } from "react-native-maps";
import { COLORS } from "../../core/theme";
import {
  getBuildingWmslink,
  getRoadWmsLink,
  getWardWmsLink,
} from "../../service/building_service";
import { ROUTES } from "../../core/constants/routes";
import { resetToken } from "../../store/slices/auth.slice";
import { FAB } from "react-native-paper";
import IonIcon from "react-native-vector-icons/Ionicons";
import WmsView from "../../components/common/WmsView";
import { Header } from "../../components/headers";
import { getCenter } from "geolib";

const KmlViewerMapScreen = ({ route, navigation }) => {
  const mapRef = useRef();
  const [location, setLocation] = useState(INITIAL_LOCATION);
  const { mapType } = useSelector((state) => state.map);
  const { contentsLabel } = useSelector((state) => state.auth);
  const { item } = route.params;
  console.log("item", item);
  const getLabel = (key) => contentsLabel?.[key] || key;
  const dispatch = useDispatch();

  const [wmsLink, setWmslink] = useState("");
  const [roadWmsLink, setRoadWmsLink] = useState("");
  const [wardWmsLink, setWardWmsLink] = useState("");
  const [showWmsDialog, setShowWmsDialog] = useState(false);
  const [showWmsLink, setShowWmsLink] = useState(false);
  const [roadWms, setRoadWms] = useState(false);
  const [wardWms, setWardWms] = useState(false);

  const getWmsLink = () => {
    getBuildingWmslink()
      .then((response) => {
        const { success, data, error } = response.data;

        console.log("wms", response.data.baseUrl + data.buildings);

        setWmslink(response.data.baseUrl + data.buildings);
      })
      .catch((err) => {
        console.log("Error", err);
        if (err?.response?.status === 500) {
          Alert.alert(
            "500",
            "Something is wrong, please try again or at a later time."
          );
        }
      });
  };

  const roadLink = () => {
    getRoadWmsLink()
      .then((response) => {
        const { success, data, error } = response.data;

        console.log("road", response.data);

        setRoadWmsLink(response.data.baseUrl + data.roads);
      })
      .catch((err) => {
        console.log("Error", err);
        if (err?.response?.status === 500) {
          Alert.alert(
            "500",
            "Something is wrong, please try again or at a later time."
          );
        }
      });
  };

  const wardLink = () => {
    getWardWmsLink()
      .then((response) => {
        const { success, data, error } = response.data;

        setWardWmsLink(response.data.baseUrl + data.wards);
      })
      .catch((err) => {
        console.log("Error", err);
        if (err?.response?.status === 500) {
          Alert.alert(
            "500",
            "Something is wrong, please try again or at a later time."
          );
        }
      });
  };

  useEffect(() => {
    getLocation();
    // setLocation({
    //   ...location,
    //   latitude: item.coords[0].latitude,
    //   longitude: item.coords[0].longitude,
    // });

    getWmsLink();
    roadLink();
    wardLink();
  }, []);
  const getLocation = (async) => {
    try {
      if (item) {
        const coordinates = item?.coords;
        const center = getCenter(coordinates);
        if (center) {
          setLocation({
            ...location,
            latitude: center?.latitude,
            longitude: center?.longitude,
          });
        }
        console.log("Coordinates", center);
      }
    } catch (error) {}
  };
  return (
    <View style={styles.container}>
      <Header
        title={getLabel("Building Location")}
        showMapStyle={location ? true : false}
      />
      {location && (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={location}
            region={location}
            provider={PROVIDER_GOOGLE}
            showsUserLocation
            zoomControlEnabled
            mapType={mapType}
            showsIndoors={false}
            minZoomLevel={17}
            showsBuildings={false}
            moveOnMarkerPress={false}
            showsPointsOfInterest={false}
          >
            {/* <Polyline
              coordinates={'file://' + item.path}
              strokeColor={'orange'}
              strokeWidth={6}
              lineCap="round"
              lineDashPattern={[0]}
            /> */}

            {item?.coords.length > 0 && (
              <Polygon
                strokeWidth={2}
                strokeColor={COLORS.error}
                coordinates={[...item.coords, item.coords[0]]}
                fillColor="rgba(45,87,250,0.07)"
              />
            )}
            {showWmsLink && (
              <WMSTile
                urlTemplate={wmsLink}
                zIndex={1}
                opacity={0.5}
                tileSize={512}
              />
            )}
            {roadWms && (
              <WMSTile
                urlTemplate={roadWmsLink}
                zIndex={1}
                opacity={0.5}
                tileSize={512}
              />
            )}
            {wardWms && (
              <WMSTile
                urlTemplate={wardWmsLink}
                zIndex={1}
                opacity={0.5}
                tileSize={512}
              />
            )}
          </MapView>
          <FAB
            animated={false}
            style={styles.fab}
            icon={() => <IonIcon name="layers" size={25} color="white" />}
            onPress={() => setShowWmsDialog(true)}
          />
          <WmsView
            visible={showWmsDialog}
            mode="Building"
            onDismiss={() => setShowWmsDialog(false)}
            onWmsPress={() => setShowWmsLink(!showWmsLink)}
            onRoadWmsPress={() => setRoadWms(!roadWms)}
            onWardWmsPress={() => setWardWms(!wardWms)}
            isWmsOn={showWmsLink}
            isRoadWmsOn={roadWms}
            isWardWmsOn={wardWms}
          />
        </>
      )}
    </View>
  );
};

export default KmlViewerMapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    bottom: 110,
    marginLeft: 15,
    backgroundColor: COLORS.primary,
  },
});
