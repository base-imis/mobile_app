import { View, Pressable } from "react-native";
import React, { memo, useState } from "react";
import { Divider, Text, Subheading, Button } from "react-native-paper";
import { COLORS } from "../../core/theme";
import { StyleSheet } from "react-native";
import dayjs from "dayjs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";

const ApplicationListSludgeCard = ({ item, onCall, onLocation, onStart }) => {
  const [expanded, setExpanded] = useState(true);
  const formatSize = (value) => {
    if (!value) return "N/A"; // Handle undefined or null values
    // Sizes can arrive as numbers or as "{2}"-style strings
    const str = String(value);
    return str.startsWith("{") ? str.replace(/[{}]/g, "") : str;
  };

  const { contentsLabel } = useSelector((state) => state.auth);
  const getLabel = (key) => contentsLabel?.[key] || key;

  return (
    <View style={styles.container}>
      <View style={styles.cardBox}>
        <Pressable style={styles.header} onPress={() => setExpanded(!expanded)}>
          <Icon name="file" color={COLORS.primary} size={22} />
          <Subheading style={styles.title} numberOfLines={1}>{`${getLabel(
            "Application ID"
          )}: #${
            item?.application_id ? item?.application_id : "N/A"
          } `}</Subheading>
          <Icon name={expanded ? "chevron-up" : "chevron-down"} size={22} />
        </Pressable>

        {expanded && (
          <>
            <Divider />
            <Divider />
            <Divider style={styles.divider} />

            {/* {Object.keys(item).map((k) => (
              <>
                <Text>
                  {k}:{JSON.stringify(item[k])}
                </Text>
                {}
              </>
            ))} */}

            <View style={styles.row}>
              <Text>{getLabel("House Number")}: </Text>
              <Text style={styles.text}>
                {item?.house_number ? item?.house_number : "N/A"}
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
              <Text>{getLabel("Service Provider Contact")}:</Text>
              <Text style={styles.text}>
                {item?.service_provider_contact
                  ? item?.service_provider_contact
                  : "N/A"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text>{getLabel("Vehicle Plate Number")}:</Text>
              <Text style={styles.text}>
                {item?.vehicle_license_plate_number ?? "N/A"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text>{getLabel("Sludge Volume (m³)")}: </Text>
              <Text style={styles.text}>{item?.volume_of_sludge ?? "N/A"}</Text>
            </View>

            <View style={styles.row}>
              <Text>{getLabel("Emptied Date")}: </Text>
              <Text style={styles.text}>
                {dayjs(item?.emptied_date).format("DD MMMM YYYY")}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.footer}>
        {/* <Button style={styles.button} mode="contained" onPress={onCall}>
          <Icon
            name="phone"
            size={20}
            // color={COLORS.primary}
          />
        </Button>
        <Button style={styles.button} mode="contained" onPress={onLocation}>
          <Icon
            name="map"
            size={20}
            // color={COLORS.primary}
          />
        </Button> */}

        <Button style={styles.button} mode="contained" onPress={onStart}>
          <Icon name="form-select" size={20} />
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
});

export default memo(ApplicationListSludgeCard);
