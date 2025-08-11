import { useDispatch, useSelector } from "react-redux";
import { Alert, StyleSheet, View } from "react-native";
import React, { useRef, useEffect, useState } from "react";
import MapView, { Marker, PROVIDER_GOOGLE, WMSTile } from "react-native-maps";

import { INITIAL_LOCATION } from "../../core/constants/map";

import {
  storeContainmentCoords,
  removeContainmentCoords,
} from "../../store/slices/map.slice";
import { getCurrentLocation } from "../../helpers/location";
import { askLocationPermission } from "../../helpers/permissions";
import { FAB } from "react-native-paper";
import MapInfoButton from "../../components/containment_map/MapInfoButton";
import MapInfoModal from "../../components/containment_map/MapInfoModal";
import SaveDataModal from "../../components/containment_map/SaveDataModal";

import WmsView from "../../components/common/WmsView";
import {
  getContainmentWmslink,
  getRoadWmsLink,
  getWardWmsLink,
} from "../../service/building_service";
import { ROUTES } from "../../core/constants/routes";
import IonIcon from "react-native-vector-icons/Ionicons";
import { resetToken } from "../../store/slices/auth.slice";
import { COLORS } from "../../core/theme";

const BuildingMapScreen = ({ navigation }) => {
  const mapRef = useRef();
  const dispatch = useDispatch();
  const [location, setLocation] = useState(INITIAL_LOCATION);
  const [modalVisible, setModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);

  const { containmentCoords, mapType } = useSelector((state) => state.map);
  const [wmslinks, setWmslink] = useState("");
  const [showWmsLink, setShowWmsLink] = useState(false);
  const [showWmsDialog, setShowWmsDialog] = useState(false);

  const [roadWmsLink, setRoadWmsLink] = useState("");

  const [wardWmsLink, setWardWmsLink] = useState("");

  const [roadWms, setRoadWms] = useState(false);
  const [wardWms, setWardWms] = useState(true);

  const getWmsLink = () => {
    getContainmentWmslink()
      .then((response) => {
        const { success, data, error } = response.data;

        setWmslink(data.wmslinks);
      })
      .catch((err) => {
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

        setRoadWmsLink(data.wmslinks);
      })
      .catch((err) => {
        console.log("Error!!", err);
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

        setWardWmsLink(data.wmslinks);
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
    askLocationPermission(async () => {
      const position = await getCurrentLocation();
      setLocation({
        ...location,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });

    getWmsLink();
    roadLink();
    wardLink();

    return () => dispatch(removeContainmentCoords());
  }, []);

  const handlePressOnMap = (event) => {
    // take latlng out from event object
    const { latitude, longitude } = event.nativeEvent.coordinate;

    // animate to the same latlng and push to coords array state
    dispatch(storeContainmentCoords({ latitude, longitude }));
  };

  const handlePressOnMarker = () => {
    Alert.alert(
      "Delete",
      "Are you sure you want to remove the marker from the map?",
      [
        {
          text: "Yes",
          onPress: () => dispatch(removeContainmentCoords()),
        },
        {
          text: "Cancel",
        },
      ]
    );
  };

  const onDragEnd = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const payload = { latitude, longitude };
    dispatch(storeContainmentCoords(payload));
  };

  const closeVisibleModals = () => {
    dispatch(removeContainmentCoords());
    setModalVisible(false);
    setSaveModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <MapView
        onLayout={() =>
          mapRef.current.setMapBoundaries(
            { latitude: 27.669721, longitude: 85.337964 },
            { latitude: 27.589734, longitude: 85.416529 }
          )
        }
        ref={mapRef}
        style={styles.map}
        initialRegion={location}
        onPress={handlePressOnMap}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        zoomControlEnabled
        mapType={mapType}
        showsIndoors={false}
        showsBuildings={false}
        minZoomLevel={13}
        moveOnMarkerPress={false}
        showsPointsOfInterest={false}
      >
        {containmentCoords && (
          <Marker
            draggable
            coordinate={containmentCoords}
            onDragEnd={onDragEnd}
            onPress={handlePressOnMarker}
          />
        )}

        {showWmsLink && (
          <WMSTile
            urlTemplate={wmslinks}
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
      <MapInfoButton onPress={setModalVisible} />

      <FAB
        animated={false}
        style={styles.fab}
        icon={() => <IonIcon name="layers" size={25} color="white" />}
        onPress={() => setShowWmsDialog(true)}
      />

      <WmsView
        visible={showWmsDialog}
        mode="Containment"
        onDismiss={() => setShowWmsDialog(false)}
        onWmsPress={() => setShowWmsLink(!showWmsLink)}
        onRoadWmsPress={() => setRoadWms(!roadWms)}
        onWardWmsPress={() => setWardWms(!wardWms)}
        isWmsOn={showWmsLink}
        isRoadWmsOn={roadWms}
        isWardWmsOn={wardWms}
      />

      <MapInfoModal
        visible={modalVisible}
        onClose={setModalVisible}
        onNext={() => setSaveModalVisible(true)}
      />
      <SaveDataModal
        visible={saveModalVisible}
        onClose={setSaveModalVisible}
        onDataSaved={closeVisibleModals}
      />
    </View>
  );
};

export default BuildingMapScreen;

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
