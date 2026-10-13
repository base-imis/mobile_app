"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Appbar,
  Menu,
  useTheme,
  type MD3Theme,
  Portal,
  Text,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  resetToken,
  setContentsLabel,
  setCurrentLang,
  setLanguages,
} from "../../store/slices/auth.slice";
import { logoutService } from "../../service/auth_service";
import {
  resetBuildingCoords,
  toogleMapType,
} from "../../store/slices/map.slice";
import colors from "../../core/theme/colors";
import {
  getContentsLabel,
  getLanguagesList,
  getTreatmentPlantCapacity,
} from "../../service/supervisor_service";
import { toNumber } from "../../utils/applicationState";

// Import the check icon
import { List } from "react-native-paper";

interface IRegistrationHeaderProps {
  hideBackAction?: boolean;
  title?: string;
  showRemoveMarker?: boolean;
  showMapStyle?: boolean;
  showFstpCapacity?: boolean;
  type?: string;
  onClearMap?: () => void;
  onMapPress?: () => void;
}

export default function Header({
  hideBackAction = false,
  showRemoveMarker = false,
  showMapStyle = false,
  showFstpCapacity = false,
  title,
  type = "",
  onClearMap,
  onMapPress,
}: IRegistrationHeaderProps) {
  console.log("type", type);
  const navigation = useNavigation();
  const { contentsLabel, currentLanguage, languages } = useSelector(
    (state) => state.auth
  );
  const getLabel = (key: string) => contentsLabel?.[key] || key;
  const route = useRoute();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  // const [languages, setLanguages] = useState([]);
  console.log("Languages", languages);
  const theme = useTheme();
  const dispatch = useDispatch();

  console.log("CurrentLanguage", currentLanguage);

  const onPressBackAction = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const hideMenu = () => setMenuVisible(false);
  const showMenu = () => setMenuVisible(true);

  const handleLogOut = () => {
    hideMenu();
    logoutService()
      .then((res) => console.log("log out", res.data))
      .catch((err) => console.log(err))
      .finally(() => {
        dispatch(resetToken());
      });
  };
  const handleToogleMapType = () => dispatch(toogleMapType());
  const handleResetBuildingCoords = () => {
    if (onClearMap) {
      onClearMap();
    } else {
      dispatch(resetBuildingCoords());
    }
  };

  // FSTP daily capacity (GET get-treatment-plant)
  const [fstpVisible, setFstpVisible] = useState(false);
  const [fstpData, setFstpData] = useState<any>(null);
  const [fstpLoading, setFstpLoading] = useState(false);
  const [fstpError, setFstpError] = useState<string | null>(null);

  const handleOpenFstp = async () => {
    setFstpVisible(true);
    setFstpLoading(true);
    setFstpError(null);
    try {
      const res = await getTreatmentPlantCapacity();
      setFstpData(res.data?.data ?? res.data);
    } catch (err: any) {
      setFstpData(null);
      setFstpError(
        err?.response?.data?.message || getLabel("Could not load FSTP capacity.")
      );
    } finally {
      setFstpLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      getLanguagesList()
        .then((response) => {
          console.log("Response", response?.data);

          if (response?.data?.languages) {
            dispatch(setLanguages(response?.data?.languages));
            console.log("Response!", response?.data);
          }
        })
        .catch((err) => {
          console.log("Error!!", err);
          return;
        });
    } catch (error) {
      console.error("Failed to fetch languages:", error);
    }
  };

  useEffect(() => {
    if (languages && languages.length > 0 && !currentLanguage) {
      const firstLangCode = languages[0];
      console.log("SettingCUrrentLNagas 222", firstLangCode);
      handleLanguageChange(firstLangCode);
    }
  }, [languages, currentLanguage]);

  const handleLanguageChange = async (langCode: string) => {
    try {
      if (langCode) {
        dispatch(setCurrentLang(langCode));
        getContentsLabel(langCode)
          .then((response) => {
            if (response.data && Object.keys(response.data).length > 0) {
              dispatch(setContentsLabel(response.data));
            } else {
              dispatch(setContentsLabel([]));
              console.error("No data in response:", response);
            }
          })
          .catch((err) => {
            dispatch(setContentsLabel([]));
            console.log("Error!!", err);

            return;
          });
      }

      // Call API to get content labels for selected language
      // const response = await getContentLabels(langCode)

      // // Update Redux state with new language and content
      // dispatch(setLanguage(langCode))
      // dispatch(setContentLabels(response.data))

      // Close the bottom sheet
      bottomSheetRef.current?.close();
    } catch (error) {
      console.error("Failed to fetch content labels:", error);
    }
  };

  const openLanguageSheet = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <>
      <Appbar.Header
        style={{
          backgroundColor: theme.colors.primary,
          // Home's profile hero continues the app bar colour, so no seam there
          borderBottomWidth: type === "home" ? 0 : 0.5,
          borderColor: colors.lightGrey,
        }}
      >
        <StatusBar
          backgroundColor={theme.colors.primary}
          barStyle="light-content"
        />
        {!hideBackAction && (
          <Appbar.BackAction
            onPress={onPressBackAction}
            color={theme.colors.onPrimary}
          />
        )}

        <Appbar.Content
          title={title ? title : route?.name}
          style={{ marginLeft: hideBackAction ? 18 : 0 }}
          color={theme.colors.onPrimary}
        />
        {onMapPress && (
          <Appbar.Action
            icon="map-marker"
            onPress={onMapPress}
            color={theme.colors.onPrimary}
            style={{ opacity: 0.9 }}
          />
        )}
        {showRemoveMarker && (
          <Appbar.Action
            icon="layers-remove"
            onPress={handleResetBuildingCoords}
            color={theme.colors.onPrimary}
            style={{ opacity: 0.9 }}
          />
        )}
        {showMapStyle && (
          <Appbar.Action
            icon="map"
            onPress={handleToogleMapType}
            color={theme.colors.onPrimary}
            style={{ opacity: 0.9 }}
          />
        )}
        {showFstpCapacity && (
          <Appbar.Action
            icon="water"
            onPress={handleOpenFstp}
            color={theme.colors.onPrimary}
            style={{ opacity: 0.9, marginRight: -4 }}
            accessibilityLabel={getLabel("FSTP Capacity")}
          />
        )}
        <TouchableOpacity
          style={styles(theme).languageButton}
          onPress={openLanguageSheet}
        >
          <Icon name="language" color={theme.colors.onPrimary} size={18} />
          <Text style={styles(theme).languageText}>
            {currentLanguage && currentLanguage.toUpperCase()}
          </Text>
        </TouchableOpacity>
        {type === "home" && (
          <>
            <Menu
              visible={menuVisible}
              onDismiss={hideMenu}
              anchor={
                <Appbar.Action
                  icon="dots-vertical"
                  onPress={showMenu}
                  color={theme.colors.onPrimary}
                  style={{ marginRight: -4 }}
                />
              }
            >
              <Menu.Item onPress={handleLogOut} title={getLabel("Log out")} />
            </Menu>
          </>
        )}
      </Appbar.Header>

      {/* Language Selection Bottom Sheet */}
      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={["50%"]}
          enableDynamicSizing={false}
          enablePanDownToClose={true}
          backgroundStyle={{ backgroundColor: theme.colors.background }}
          handleIndicatorStyle={{
            backgroundColor: theme.colors.onSurfaceVariant,
          }}
          backdropComponent={renderBackdrop}
        >
          {/* The title is the list header: as a sibling BottomSheetView, bottom-sheet
              v5 overlapped it with the first row. */}
          <BottomSheetFlatList
            ListHeaderComponent={
              <Text style={styles(theme).bottomSheetTitle}>Select Language</Text>
            }
            data={languages}
            keyExtractor={(item) => item}
            contentContainerStyle={styles(theme).bottomSheetContainer}
            renderItem={({ item: lang }) => {
              const isSelected =
                currentLanguage?.toLowerCase() === lang?.toLowerCase();
              return (
                <TouchableOpacity
                  style={[
                    styles(theme).languageItem,
                    isSelected && styles(theme).selectedLanguageItem,
                  ]}
                  onPress={() => handleLanguageChange(lang)}
                >
                  <View style={styles(theme).languageItemContent}>
                    <Text
                      style={[
                        styles(theme).languageItemText,
                        isSelected && styles(theme).selectedLanguageItemText,
                      ]}
                    >
                      {lang?.toUpperCase()}
                    </Text>

                    {isSelected && (
                      <List.Icon
                        icon="check"
                        color={theme.colors.primary}
                        style={styles(theme).checkIcon}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </BottomSheet>
      </Portal>

      {/* FSTP Capacity Modal */}
      <Modal
        visible={fstpVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFstpVisible(false)}
      >
        <View style={styles(theme).fstpOverlay}>
          <View style={styles(theme).fstpContainer}>
            <View style={styles(theme).fstpHeader}>
              <Text style={styles(theme).fstpTitle}>
                {getLabel("FSTP Capacity")}
              </Text>
              <TouchableOpacity onPress={() => setFstpVisible(false)}>
                <Icon name="close" size={24} color={theme.colors.onBackground} />
              </TouchableOpacity>
            </View>
            {!!fstpData?.date_display && (
              <Text style={styles(theme).fstpDate}>{fstpData.date_display}</Text>
            )}
            {fstpLoading ? (
              <View style={{ alignItems: "center", paddingVertical: 24 }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : fstpError ? (
              <View style={{ alignItems: "center", paddingVertical: 24 }}>
                <Text style={{ textAlign: "center", color: theme.colors.error, marginBottom: 12 }}>
                  {fstpError}
                </Text>
                <TouchableOpacity onPress={handleOpenFstp}>
                  <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>
                    {getLabel("Retry")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : fstpData?.plants?.length > 0 ? (
              <ScrollView style={{ maxHeight: 400 }}>
                {fstpData.plants.map((plant: any) => {
                  // Values may arrive as strings; parse before doing arithmetic
                  const capacity = toNumber(plant.capacity_per_day);
                  const remaining = toNumber(plant.remaining_capacity, capacity);
                  const used = capacity - remaining;
                  const pct =
                    capacity > 0
                      ? Math.max(0, Math.min(100, (used / capacity) * 100))
                      : 0;
                  const isOverflow = remaining < 0;
                  return (
                    <View key={String(plant.id)} style={styles(theme).fstpPlantCard}>
                      <Text style={styles(theme).fstpPlantName}>{plant.name}</Text>
                      {!!plant.location && (
                        <Text style={styles(theme).fstpPlantLocation}>{plant.location}</Text>
                      )}
                      <View style={styles(theme).fstpBarBg}>
                        <View
                          style={[
                            styles(theme).fstpBarFill,
                            {
                              width: `${pct}%`,
                              backgroundColor: isOverflow
                                ? "#e53935"
                                : pct > 80
                                ? "#fb8c00"
                                : "#43a047",
                            },
                          ]}
                        />
                      </View>
                      <View style={styles(theme).fstpBarLabels}>
                        <Text style={styles(theme).fstpBarLabelText}>
                          {getLabel("Used")}: {used.toFixed(1)} m³
                        </Text>
                        <Text style={styles(theme).fstpBarLabelText}>
                          {getLabel("Capacity")}: {capacity} m³/day
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles(theme).fstpRemaining,
                          { color: isOverflow ? "#e53935" : "#43a047" },
                        ]}
                      >
                        {getLabel("Remaining")}: {remaining.toFixed(1)} m³
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  paddingVertical: 24,
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                {getLabel("No data available")}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      paddingTop: 12,
      backgroundColor: "red",
    },
    languageButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
    },
    languageText: {
      color: theme.colors.onPrimary,
      fontWeight: "bold",
    },
    bottomSheetContainer: {
      padding: 16,
    },
    bottomSheetTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 16,
      color: theme.colors.onBackground,
    },
    languageItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    languageItemContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    selectedLanguageItem: {
      backgroundColor: theme.colors.primaryContainer,
    },
    languageItemText: {
      fontSize: 16,
      color: theme.colors.onBackground,
    },
    selectedLanguageItemText: {
      color: theme.colors.primary,
      fontWeight: "bold",
    },
    checkIcon: {
      margin: 0,
    },
    fstpOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    fstpContainer: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 32,
    },
    fstpHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    fstpTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.onBackground,
    },
    fstpDate: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 16,
    },
    fstpPlantCard: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
    },
    fstpPlantName: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.onBackground,
      marginBottom: 2,
    },
    fstpPlantLocation: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 10,
    },
    fstpBarBg: {
      height: 10,
      borderRadius: 5,
      backgroundColor: "#e0e0e0",
      overflow: "hidden",
      marginBottom: 6,
    },
    fstpBarFill: {
      height: "100%",
      borderRadius: 5,
    },
    fstpBarLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    fstpBarLabelText: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
    },
    fstpRemaining: {
      fontSize: 13,
      fontWeight: "600",
      marginTop: 4,
    },
  });
