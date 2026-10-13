import { View, Pressable } from "react-native";
import React, { memo, useState } from "react";
import { Chip, Divider, Text, Subheading, Button } from "react-native-paper";
import { COLORS } from "../../core/theme";
import { StyleSheet } from "react-native";
import dayjs from "dayjs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import {
  getEmptyingAction,
  getTripProgress,
  isAnfPending,
} from "../../utils/applicationState";

const ApplicationListCard = ({ item, onCall, onLocation, onStart }) => {
  const [expanded, setExpanded] = useState(true);
  const formatSize = (value) => {
    if (value === undefined || value === null || value === "") return "N/A";
    // Sizes can arrive as numbers or as "{2}"-style strings
    const str = String(value);
    return str.startsWith("{") ? str.replace(/[{}]/g, "") : str;
  };

  const { contentsLabel } = useSelector((state) => state.auth);
  const getLabel = (key) => contentsLabel?.[key] || key;

  const isAnf = isAnfPending(item);
  const action = getEmptyingAction(item);
  const trip = getTripProgress(item);
  const hasLocation = !!item?.geometry?.coordinates;

  return (
    <View style={styles.container}>
      <View style={styles.cardBox}>
        <Pressable style={styles.header} onPress={() => setExpanded(!expanded)}>
          <Icon name="file" color={COLORS.primary} size={22} />
          <Subheading style={styles.title} numberOfLines={1}>{`${getLabel(
            "Application ID"
          )}: #${item?.id ? item?.id : "N/A"} `}</Subheading>
          {trip.total > 1 && (
            <Chip compact style={styles.tripBadge} textStyle={styles.tripBadgeText}>
              {`${getLabel("Trip")} ${Math.min(trip.done + 1, trip.total)}/${trip.total}`}
            </Chip>
          )}
          {isAnf && (
            <Chip
              compact
              style={styles.anfBadge}
              textStyle={styles.anfBadgeText}
            >
              ANF
            </Chip>
          )}
          <Icon name={expanded ? "chevron-up" : "chevron-down"} size={22} />
        </Pressable>

        {expanded && (
          <>
            <Divider />
            <Divider />
            <Divider style={styles.divider} />
            <View style={styles.row}>
              <Text>{getLabel("Application Date")}: </Text>
              <Text style={styles.text}>
                {item?.application_date
                  ? dayjs(item?.application_date).format("DD MMMM YYYY")
                  : "N/A"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text>{getLabel("House Number")}: </Text>
              <Text style={styles.text}>
                {item?.building_house_number
                  ? item?.building_house_number
                  : "N/A"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text>{getLabel("BIN")}: </Text>
              <Text style={styles.text}>{item?.bin ? item?.bin : "N/A"}</Text>
            </View>
            <View style={styles.row}>
              <Text>{getLabel("Ward")}: </Text>
              <Text style={styles.text}>{item?.ward ? item?.ward : "N/A"}</Text>
            </View>
            <View style={styles.row}>
              <Text>{getLabel("Applicant's Name")}: </Text>
              <Text style={styles.text}>
                {item?.applicant_name ? item?.applicant_name : "N/A"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text>{getLabel("Applicant's Gender")}:</Text>
              <Text style={styles.text}>{item?.applicant_gender ?? "N/A"}</Text>
            </View>
            <View style={styles.row}>
              <Text>{getLabel("Applicant's Contact")}:</Text>
              <Text style={styles.text}>
                {item?.applicant_contact ? item?.applicant_contact : "N/A"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text>{getLabel("Emergency Desluding Status")}:</Text>
              <Text style={styles.text}>
                {item?.emergency_desludging_status ? "Yes" : "No"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text>{getLabel("Preferred Desludging Vehicle Size (m³)")}:</Text>
              <Text style={styles.text}>
                {item?.desludging_vehicle_size
                  ? item?.desludging_vehicle_size
                  : "N/A"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text>{getLabel("Road width (m)")}: </Text>
              <Text style={styles.text}>{item?.carrying_width ?? "N/A"}</Text>
            </View>
            {item?.containment_id && (
              <View style={styles.row}>
                <Text>{getLabel("Containment Id")}: </Text>
                <Text style={styles.text}>
                  {formatSize(item?.containment_id)}
                </Text>
              </View>
            )}
            {item?.containment_size && (
              <View style={styles.row}>
                <Text>{getLabel("Containment Size (m³)")}:</Text>
                <Text style={styles.text}>
                  {formatSize(item?.containment_size)}
                </Text>
              </View>
            )}
            <View style={styles.row}>
              <Text>{getLabel("Proposed Emptying Date")}:</Text>
              <Text style={styles.text}>
                {item?.proposed_emptying_date
                  ? dayjs(item?.proposed_emptying_date).format("DD MMMM YYYY")
                  : "N/A"}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          style={styles.button}
          mode="contained"
          onPress={onCall}
          accessibilityLabel={getLabel("Call")}
        >
          <Icon name="phone" size={20} />
        </Button>
        <Button
          style={styles.button}
          mode="contained"
          onPress={onLocation}
          disabled={!hasLocation}
          accessibilityLabel={getLabel("Open in maps")}
        >
          <Icon name="map" size={20} />
        </Button>
        <Button
          style={[styles.button, isAnf && styles.locateButton]}
          mode="contained"
          onPress={onStart}
          disabled={action === "blocked"}
          accessibilityLabel={
            isAnf ? getLabel("Locate building") : getLabel("Open form")
          }
        >
          <Icon name={isAnf ? "map-search" : "form-select"} size={20} />
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,

    marginHorizontal: 2,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: COLORS.light,
    overflow: "hidden",
  },
  cardBox: {
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  title: {
    fontWeight: "bold",
    overflow: "hidden",
    paddingHorizontal: 30,
  },
  row: {
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    paddingHorizontal: 5,
  },
  divider: {
    marginBottom: 10,
  },
  footer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#eaeaea",
    paddingVertical: 10,
    gap: 16,
    paddingHorizontal: 10,
  },
  button: {
    flexGrow: 1,
  },
  anfBadge: {
    backgroundColor: "#C0392B",
    borderRadius: 4,
    marginHorizontal: 4,
  },
  locateButton: {
    backgroundColor: "#C0392B",
  },
  tripBadge: {
    backgroundColor: "#1E4D78",
    borderRadius: 4,
    marginHorizontal: 4,
  },
  tripBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  anfBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default memo(ApplicationListCard);
