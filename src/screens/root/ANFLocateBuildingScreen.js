import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  Chip,
  Divider,
  FAB,
  Icon,
  Text,
  useTheme,
} from "react-native-paper";
import { Marker, Polygon, WMSTile } from "react-native-maps";
import IonIcon from "react-native-vector-icons/Ionicons";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { COLORS } from "../../core/theme";
import { formatWmsUrl } from "../../utils/wmsUrl";
import { getCurrentLocation } from "../../helpers/location";
import {
  getBuildingWmslink,
  getRoadWmsLink,
  getWardWmsLink,
  getContainmentWmslink,
  getBuildingByPoint,
  resolveAnf,
} from "../../service/building_service";
import WmsView from "../../components/common/WmsView";
import MapComponent from "../../components/mapcomponent/MapComponent";
import { usePermissionContext } from "../../hooks/PermissionContext";
import { ErrorMessage } from "../../components/errorComponent";
import { Header } from "../../components/headers";
import AddBuildingForm from "../../components/anf/AddBuildingForm";
import AddContainmentForm from "../../components/anf/AddContainmentForm";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ANFLocateBuildingScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { contentsLabel } = useSelector((state) => state.auth);
  const { permissionStatus, locationEnabled, requestPermissions } =
    usePermissionContext();
  const getLabel = (key) => contentsLabel?.[key] || key;

  const { applicationId, onBuildingSelected } = route.params || {};

  // Map state
  const [location, setLocation] = useState(null);
  const [wmslinks, setWmslink] = useState(null);
  const [roadWmsLink, setRoadWmsLink] = useState(null);
  const [wardWmsLink, setWardWmsLink] = useState(null);
  const [containmentWmsLink, setContainmentWmsLink] = useState(null);
  const [showWmsLink, setShowWmsLink] = useState(true);
  const [roadWms, setRoadWms] = useState(true);
  const [wardWms, setWardWms] = useState(true);
  const [containmentWms, setContainmentWms] = useState(true);
  const [showWmsDialog, setShowWmsDialog] = useState(false);

  // ANF state
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [bottomSheetMode, setBottomSheetMode] = useState(null);
  // modes: 'building_info' | 'no_building' | 'lookup_error' | 'add_building' | 'add_containment' | null
  const [tappedCoordinate, setTappedCoordinate] = useState(null);
  // The containment the user picked to link (a building can have several)
  const [selectedContainmentId, setSelectedContainmentId] = useState(null);
  const [lookupError, setLookupError] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  const bottomSheetRef = useRef(null);
  const mapComponentRef = useRef(null);

  // Fetch location with retry logic
  const locationRetryRef = useRef(0);
  const fetchLocation = useCallback(async () => {
    try {
      const response = await getCurrentLocation(true);
      if (response?.coords) {
        setLocation(response.coords);
        locationRetryRef.current = 0;
      } else {
        throw new Error("No coordinates found");
      }
    } catch (error) {

      // If this is a React component error (not a real location error), retry
      if (error.isComponentError || (!error.code && !error.PERMISSION_DENIED)) {
        locationRetryRef.current += 1;
        if (locationRetryRef.current < 3) {
          setTimeout(() => fetchLocation(), 500);
          return;
        }
        // After 3 retries leave the map where it is; the user can pan manually.
        return;
      }
      
      if (error.code === 1 || error.code === 2) {
        await requestPermissions();
      }
    }
  }, [requestPermissions]);

  useEffect(() => {
    if (permissionStatus && locationEnabled) {
      fetchLocation();
    } else {
      requestPermissions();
    }
  }, [permissionStatus, locationEnabled, fetchLocation]);

  // Fetch WMS links
  useEffect(() => {
    getWmsLink();
    roadLink();
    wardLink();
    containmentLink();
  }, []);

  const getWmsLink = () => {
    getBuildingWmslink()
      .then((response) => {
        const { data } = response.data;
        setWmslink(formatWmsUrl(response.data.baseUrl + data.buildings));
      })
      .catch((err) => console.log("WMS Error:", err));
  };

  const roadLink = () => {
    getRoadWmsLink()
      .then((response) => {
        const { data } = response.data;
        setRoadWmsLink(formatWmsUrl(response.data.baseUrl + data.roads));
      })
      .catch((err) => console.log("Road WMS Error:", err));
  };

  const wardLink = () => {
    getWardWmsLink()
      .then((response) => {
        const { data } = response.data;
        setWardWmsLink(formatWmsUrl(response.data.baseUrl + data.wards));
      })
      .catch((err) => console.log("Ward WMS Error:", err));
  };

  const containmentLink = () => {
    getContainmentWmslink()
      .then((response) => {
        const { data } = response.data;
        setContainmentWmsLink(formatWmsUrl(response.data.baseUrl + data.containments));
      })
      .catch((err) => console.log("Containment WMS Error:", err));
  };

  // Handle map press — look up the building at the tapped point
  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    await lookupBuilding({ latitude, longitude });
  };

  const lookupBuilding = async (coordinate) => {
    setTappedCoordinate(coordinate);
    setSelectedContainmentId(null);
    setLookupError(null);
    setLoadingInfo(true);

    const result = await queryBuildingAtLocation(
      coordinate.latitude,
      coordinate.longitude
    );

    if (result.status === "found") {
      const building = result.building;
      setSelectedBuilding(building);
      // Pre-select when there is exactly one containment; otherwise the user chooses.
      if (building.containments.length === 1) {
        setSelectedContainmentId(building.containments[0].id);
      }
      setBottomSheetMode("building_info");
    } else if (result.status === "not_found") {
      setSelectedBuilding(null);
      setBottomSheetMode("no_building");
    } else {
      // Spec §7: on lookup failure keep the map context and offer a retry.
      // Treating it as "no building" would invite creating a duplicate building.
      setSelectedBuilding(null);
      setLookupError(result.message);
      setBottomSheetMode("lookup_error");
    }

    setLoadingInfo(false);
    bottomSheetRef.current?.snapToIndex(0);
  };

  // GET map/building-by-point -> { found, building, containments }
  // Returns { status: "found" | "not_found" | "error", building?, message? }
  const queryBuildingAtLocation = async (lat, lng) => {
    try {
      const response = await getBuildingByPoint(lat, lng);
      const body = response.data || {};
      const data = body.data ?? body;
      const building = data?.building ?? null;

      if (data?.found === false || !building) {
        return { status: "not_found" };
      }

      const containments = (
        data.containments ||
        building.containments ||
        []
      ).filter((c) => c && c.id !== undefined && c.id !== null);

      return {
        status: "found",
        building: {
          bin: building.bin || null,
          owner_name: building.owner_name || building.house_owner || null,
          ward: building.ward || null,
          house_number: building.house_number || null,
          road_code: building.road_code || null,
          structure_type:
            building.structure_type_name ||
            building.structure_type ||
            building.building_type ||
            null,
          number_of_floors:
            building.number_of_floors || building.floor_count || null,
          containments,
          geometry: building.geometry || null,
        },
      };
    } catch (err) {
      return {
        status: "error",
        message:
          err?.response?.data?.message ||
          getLabel("Could not look up the building. Check your connection and try again."),
      };
    }
  };

  // Link the selected building + containment to the ANF application
  const handleSelectBuilding = async () => {
    const bin = selectedBuilding?.bin;
    if (!bin || !selectedContainmentId) {
      Alert.alert(
        getLabel("Select a containment"),
        getLabel("Choose which containment belongs to this application.")
      );
      return;
    }

    if (!applicationId) {
      goBackWithRefresh({
        building_id: bin,
        containment_id: selectedContainmentId,
        building_info: selectedBuilding,
      });
      return;
    }

    setLoadingInfo(true);
    try {
      const res = await resolveAnf(applicationId, {
        bin,
        containment_id: selectedContainmentId,
      });
      if (res.data?.status === true || res.data?.success === true) {
        Alert.alert(
          getLabel("Success"),
          getLabel("Building linked and application resolved successfully."),
          [{ text: getLabel("OK"), onPress: () => goBackWithRefresh() }]
        );
      } else {
        Alert.alert(
          getLabel("Error"),
          res.data?.message || getLabel("Failed to resolve ANF.")
        );
      }
    } catch (err) {
      // e.g. 422: containment already used by another active application
      Alert.alert(
        getLabel("Error"),
        err?.response?.data?.message || getLabel("Failed to resolve application.")
      );
    } finally {
      setLoadingInfo(false);
    }
  };

  const goBackWithRefresh = (anfResultPayload = null) => {
    const returnRoute = route.params?.returnRoute;
    if (returnRoute) {
      // navigate() to an existing screen in the stack pops this screen
      // and merges the new params into the target screen.
      navigation.navigate({
        name: returnRoute,
        params: { 
          refreshAnf: Date.now(), // use timestamp so the param always changes
          ...(anfResultPayload && { anfResult: anfResultPayload }),
        },
        merge: true,
      });
    } else {
      // Fallback: just go back
      navigation.goBack();
    }
  };

  // Handle building + containment added
  // NOTE: The backend storeBuildingDataMobile already resolves ANF when
  // request->id (applicationId) is present. We do NOT call resolveAnf again.
  const handleBuildingAdded = async (data) => {
    const bin = data?.bin;
    const containment_id = data?.containment_id || "";

    if (applicationId) {
      // Server already resolved ANF — just navigate back with refresh
      Alert.alert(
        getLabel("Success"),
        getLabel("Building saved and linked successfully."),
        [{ text: getLabel("OK"), onPress: () => goBackWithRefresh() }]
      );
    } else {
      Alert.alert(getLabel("Success"), getLabel("Building and containment saved."), [
        { text: getLabel("OK"), onPress: () => goBackWithRefresh({ building_id: bin, containment_id, building_info: data }) }
      ]);
    }
  };

  // Handle containment added to existing building
  // NOTE: The backend addContainment already resolves ANF when request->id
  // (applicationId) is present. We do NOT call resolveAnf again.
  const handleContainmentAdded = async (data) => {
    const bin = selectedBuilding?.bin || data?.bin;
    const containment_id = data?.id || data?.containment_id || "";

    if (applicationId) {
      // Server already resolved ANF — just navigate back with refresh
      Alert.alert(
        getLabel("Success"),
        getLabel("Containment saved and linked successfully."),
        [{ text: getLabel("OK"), onPress: () => goBackWithRefresh() }]
      );
    } else {
      Alert.alert(getLabel("Success"), getLabel("Containment saved successfully."), [
        { text: getLabel("OK"), onPress: () => goBackWithRefresh({ building_id: bin, containment_id, building_info: selectedBuilding }) }
      ]);
    }
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current?.close();
    setBottomSheetMode(null);
  };

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.3}
        pressBehavior="close"
      />
    ),
    []
  );

  // Bottom sheet snap points based on mode
  const isFormMode =
    bottomSheetMode === "add_building" || bottomSheetMode === "add_containment";
  const snapPoints = useMemo(
    () => (isFormMode ? ["90%"] : ["55%", "85%"]),
    [isFormMode]
  );

  const renderBottomSheetContent = () => {
    if (bottomSheetMode === "add_building") {
      return (
        <BottomSheetScrollView
          style={styles.sheetContent}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={styles.sheetHeader}>
            <MaterialIcon name="home-plus" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.sheetTitle}>
              {getLabel("Add Building & Containment")}
            </Text>
          </View>
          <AddBuildingForm
            includeContainment={true}
            coordinate={tappedCoordinate}
            onSuccess={handleBuildingAdded}
            onCancel={closeBottomSheet}
            submitTitle={getLabel("Save")}
            savedBuildingBin={selectedBuilding?.bin}
            lat={tappedCoordinate?.latitude}
            lng={tappedCoordinate?.longitude}
            applicationId={applicationId}
          />
        </BottomSheetScrollView>
      );
    }

    if (bottomSheetMode === "add_containment") {
      return (
        <BottomSheetScrollView
          style={styles.sheetContent}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={styles.sheetHeader}>
            <MaterialIcon name="plus-circle" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.sheetTitle}>
              {getLabel("Add Containment")}
            </Text>
          </View>
          <AddContainmentForm
            buildingBin={selectedBuilding?.bin}
            applicationId={applicationId}
            lat={tappedCoordinate?.latitude || selectedBuilding?.lat || null}
            lng={tappedCoordinate?.longitude || selectedBuilding?.lng || null}
            onSuccess={handleContainmentAdded}
            onCancel={closeBottomSheet}
          />
        </BottomSheetScrollView>
      );
    }

    if (bottomSheetMode === "lookup_error") {
      return (
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.noDataContainer}>
            <View style={styles.noBuildingIconWrap}>
              <View style={[styles.noBuildingIconCircle, { backgroundColor: "#FEF2F2" }]}>
                <MaterialIcon name="wifi-alert" size={32} color="#DC2626" />
              </View>
            </View>
            <Text variant="titleLarge" style={styles.noDataTitle}>
              {getLabel("Lookup Failed")}
            </Text>
            <Text variant="bodyMedium" style={styles.noDataSubtitle}>
              {lookupError}
            </Text>
            <View style={styles.noBuildingActions}>
              <Button
                mode="contained"
                icon="refresh"
                onPress={() => tappedCoordinate && lookupBuilding(tappedCoordinate)}
                style={styles.noBuildingCta}
                contentStyle={styles.noBuildingCtaContent}
                labelStyle={styles.noBuildingCtaLabel}
              >
                {getLabel("Retry")}
              </Button>
              <Button
                mode="text"
                onPress={closeBottomSheet}
                labelStyle={styles.noBuildingCancelLabel}
              >
                {getLabel("Cancel")}
              </Button>
            </View>
          </View>
        </BottomSheetView>
      );
    }

    if (bottomSheetMode === "no_building") {
      return (
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.noDataContainer}>
            {/* Icon with background circle */}
            <View style={styles.noBuildingIconWrap}>
              <View style={styles.noBuildingIconCircle}>
                <MaterialIcon
                  name="home-search-outline"
                  size={32}
                  color="#1E4D78"
                />
              </View>
            </View>

            <Text variant="titleLarge" style={styles.noDataTitle}>
              {getLabel("No Building Found")}
            </Text>
            <Text variant="bodyMedium" style={styles.noDataSubtitle}>
              {getLabel("No building record exists at this location.")}
              {tappedCoordinate && (
                `\n📍 ${tappedCoordinate.latitude.toFixed(5)}, ${tappedCoordinate.longitude.toFixed(5)}`
              )}
            </Text>

            {/* CTA Button */}
            <View style={styles.noBuildingActions}>
              <Button
                mode="contained"
                icon="home-plus"
                onPress={() => {
                  setBottomSheetMode("add_building");
                  bottomSheetRef.current?.snapToIndex(0);
                }}
                style={styles.noBuildingCta}
                contentStyle={styles.noBuildingCtaContent}
                labelStyle={styles.noBuildingCtaLabel}
              >
                {getLabel("Add Building & Containment")}
              </Button>
              <Button
                mode="text"
                onPress={closeBottomSheet}
                labelStyle={styles.noBuildingCancelLabel}
              >
                {getLabel("Cancel")}
              </Button>
            </View>
          </View>
        </BottomSheetView>
      );
    }

    if (bottomSheetMode === "building_info" && selectedBuilding) {
      const hasContainment = selectedBuilding.containments.length > 0;

      return (
        <BottomSheetScrollView style={styles.sheetContent}>
          {/* Building Info */}
          <View style={styles.infoSection}>
            <View style={styles.sectionRow}>
              <MaterialIcon name="home" size={20} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {getLabel("Building Info")}
              </Text>
            </View>
            <Divider style={styles.sectionDivider} />
            <InfoRow label="Owner" value={selectedBuilding.owner_name} />
            <InfoRow label="Ward No" value={selectedBuilding.ward} />
            <InfoRow label="House No" value={selectedBuilding.house_number} />
            <InfoRow label="Road Code" value={selectedBuilding.road_code} />
            <InfoRow label="Floors" value={selectedBuilding.floor_count || selectedBuilding.number_of_floors} />
            <InfoRow label="Structure" value={selectedBuilding.structure_type_name || selectedBuilding.structure_type} />
          </View>

          {/* Containment Info */}
          <View style={styles.infoSection}>
            <View style={styles.sectionRow}>
              <MaterialIcon name="water" size={20} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {getLabel("Containment Info")}
              </Text>
            </View>
            <Divider style={styles.sectionDivider} />
            {hasContainment ? (
              <>
                {selectedBuilding.containments.length > 1 && (
                  <Text style={styles.selectHint}>
                    {getLabel("Select the containment for this application:")}
                  </Text>
                )}
                {selectedBuilding.containments.map((cont, idx) => {
                  const isSelected = selectedContainmentId === cont.id;
                  const volume = cont.size || cont.containment_size || cont.volume;
                  return (
                    <Pressable
                      key={String(cont.id)}
                      onPress={() => setSelectedContainmentId(cont.id)}
                      style={[
                        styles.containmentCard,
                        isSelected && {
                          borderColor: theme.colors.primary,
                          backgroundColor: "#EEF4FA",
                        },
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                    >
                      <View style={styles.containmentCardHeader}>
                        <MaterialIcon
                          name={isSelected ? "radiobox-marked" : "radiobox-blank"}
                          size={20}
                          color={isSelected ? theme.colors.primary : "#9CA3AF"}
                        />
                        <Text style={[styles.containmentCardTitle, { color: theme.colors.primary }]}>
                          {getLabel("Containment")} #{cont.id}
                        </Text>
                      </View>
                      <InfoRow
                        label="Type"
                        value={cont.type || cont.containment_type || cont.type_name || "N/A"}
                      />
                      <InfoRow label="Volume" value={volume ? `${volume} m³` : null} />
                      <InfoRow label="Construction Date" value={cont.construction_date} />
                    </Pressable>
                  );
                })}
              </>
            ) : (
              <View style={styles.warningRow}>
                <MaterialIcon
                  name="alert"
                  size={20}
                  color="#F59E0B"
                />
                <Text style={styles.warningText}>
                  {getLabel("No containment linked to this building.")}
                </Text>
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actionContainer}>
            {!hasContainment && (
              <Button
                mode="contained-tonal"
                icon="plus-circle"
                onPress={() => {
                  setBottomSheetMode("add_containment");
                  bottomSheetRef.current?.snapToIndex(0);
                }}
                style={styles.actionBtn}
              >
                {getLabel("Add Containment")}
              </Button>
            )}
            {hasContainment && (
              <Button
                mode="contained"
                icon="check-circle"
                onPress={handleSelectBuilding}
                disabled={!selectedContainmentId || loadingInfo}
                style={styles.actionBtn}
              >
                {getLabel("Link Selected Containment")}
              </Button>
            )}
          </View>
        </BottomSheetScrollView>
      );
    }

    return null;
  };


  return (
    <View style={styles.container}>
      <Header
        title={getLabel("Building Map")}
        hideBackAction={false}
        showRemoveMarker={true}
        showMapStyle={true}
        onClearMap={() => setTappedCoordinate(null)}
      />
      <>
        <MapComponent
            ref={mapComponentRef}
            handleMarkerPress={handleMapPress}
            markerdrag={true}
          >
            {/* Tapped location marker */}
            {tappedCoordinate && (
              <Marker
                coordinate={tappedCoordinate}
                pinColor="#F59E0B"
              >
                <View>
                  <Image
                    source={require("../../../assets/images/marker1.png")}
                    style={{ height: 40, width: 40 }}
                  />
                </View>
              </Marker>
            )}

            {/* WMS Layers */}
            {showWmsLink && wmslinks && (
              <WMSTile
                urlTemplate={wmslinks}
                zIndex={1}
                opacity={0.5}
                tileSize={512}
                maximumZ={20}
                minimumZ={10}
                tileCacheMaxAge={604800}
              />
            )}
            {roadWms && roadWmsLink && (
              <WMSTile
                urlTemplate={roadWmsLink}
                zIndex={2}
                opacity={0.5}
                tileSize={512}
                maximumZ={20}
                minimumZ={10}
                tileCacheMaxAge={604800}
              />
            )}
            {wardWms && wardWmsLink && (
              <WMSTile
                urlTemplate={wardWmsLink}
                zIndex={3}
                opacity={0.5}
                tileSize={512}
                maximumZ={20}
                minimumZ={10}
                tileCacheMaxAge={604800}
              />
            )}
            {containmentWms && containmentWmsLink && (
              <WMSTile
                urlTemplate={containmentWmsLink}
                zIndex={4}
                opacity={0.8}
                tileSize={512}
                maximumZ={20}
                minimumZ={10}
                tileCacheMaxAge={604800}
              />
            )}
          </MapComponent>

          {/* Loading indicator */}
          {loadingInfo && (
            <View style={styles.loadingOverlay}>
              <Card style={styles.loadingCard}>
                <Card.Content style={styles.loadingContent}>
                  <MaterialIcon
                    name="map-search"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text>{getLabel("Searching for building...")}</Text>
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Instruction chip */}
          {!bottomSheetMode && !loadingInfo && (
            <View style={styles.instructionContainer}>
              <Chip
                icon="gesture-tap"
                style={styles.instructionChip}
                textStyle={styles.instructionText}
              >
                {getLabel("Tap on the map to locate a building")}
              </Chip>
            </View>
          )}



          {/* Recentre on the user's location */}
          <FAB
            animated={false}
            style={[styles.zoomToLayer, { backgroundColor: "#1E4D78" }]}
            icon={() => (
              <MaterialIcon name="crosshairs-gps" size={25} color="white" />
            )}
            onPress={() => {
              if (!location) {
                fetchLocation();
                return;
              }
              mapComponentRef.current?.animateToRegion(
                {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.008,
                  longitudeDelta: 0.008,
                },
                1000
              );
            }}
          />

          {/* WMS Layer toggle */}
          <FAB
            animated={false}
            style={[styles.fab, { backgroundColor: COLORS.primary }]}
            icon={() => (
              <IonIcon name="layers" size={25} color="white" />
            )}
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
            isContainmentWmsOn={containmentWms}
            onContainmentWmsPress={() => setContainmentWms(!containmentWms)}
          />

          {/* Bottom Sheet */}
          {bottomSheetMode && (
            <BottomSheet
              ref={bottomSheetRef}
              index={0}
              snapPoints={snapPoints}
              enablePanDownToClose
              onClose={() => setBottomSheetMode(null)}
              backgroundStyle={{
                backgroundColor: theme.colors.background,
              }}
              handleIndicatorStyle={{
                backgroundColor: theme.colors.onSurfaceVariant,
              }}
              backdropComponent={renderBackdrop}
            >
              {renderBottomSheetContent()}
            </BottomSheet>
          )}
        </>
    </View>
  );
};

// Reusable info row
const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value || "N/A"}</Text>
  </View>
);

export default ANFLocateBuildingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    bottom: 110,
    marginLeft: 15,
  },
  zoomToLayer: {
    position: "absolute",
    bottom: 175,
    marginLeft: 15,
  },
  loadingOverlay: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
  },
  loadingCard: {
    elevation: 4,
  },
  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  instructionContainer: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },
  instructionChip: {
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 20,
  },
  instructionText: {
    color: "white",
    fontSize: 13,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingTop: 4,
  },
  sheetTitle: {
    fontWeight: "bold",
  },
  noDataContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 8,
  },
  noDataTitle: {
    fontWeight: "bold",
    textAlign: "center",
    color: "#1A1C1E",
    marginTop: 4,
  },
  noDataSubtitle: {
    textAlign: "center",
    color: "#6B7C8D",
    lineHeight: 20,
    marginBottom: 4,
  },
  noBuildingIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(30, 77, 120, 0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  noBuildingIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(30, 77, 120, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  noBuildingActions: {
    width: "100%",
    gap: 4,
    marginTop: 8,
  },
  noBuildingCta: {
    borderRadius: 12,
    backgroundColor: "#1E4D78",
  },
  noBuildingCtaContent: {
    height: 48,
  },
  noBuildingCtaLabel: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  noBuildingCancelLabel: {
    color: "#6B7C8D",
    fontSize: 14,
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontWeight: "bold",
  },
  sectionDivider: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  infoLabel: {
    color: "#6B7280",
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    maxWidth: SCREEN_WIDTH * 0.55,
    textAlign: "right",
  },
  selectHint: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 8,
  },
  containmentCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  containmentCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  containmentCardTitle: {
    fontWeight: "bold",
    marginLeft: 6,
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: "#FEF3C7",
    borderRadius: 6,
  },
  warningText: {
    color: "#92400E",
    fontSize: 14,
    flex: 1,
  },
  actionContainer: {
    gap: 10,
    marginTop: 8,
    marginBottom: 24,
  },
  actionBtn: {
    borderRadius: 8,
  },
  cancelBtn: {
    borderRadius: 8,
    marginTop: 4,
  },
});
