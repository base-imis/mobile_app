import { View, Pressable } from "react-native";
import React, { memo, useState } from "react";
import { Divider, Text, Subheading } from "react-native-paper";
import { COLORS } from "../../core/theme";
import { StyleSheet } from "react-native";
import dayjs from "dayjs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";

const ApplicationListCard = ({ item, onCall, onLocation, onStart }) => {
  const [expanded, setExpanded] = useState(true);
  console.log("Item!!", item);
  const formatSize = (value) => {
    if (!value) return "N/A"; // Handle undefined or null values
    return value.startsWith("{") ? value.replace(/[{}]/g, "") : value;
  };

  const { contentsLabel } = useSelector((state) => state.auth);
  const getLabel = (key) => contentsLabel?.[key] || key;

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={() => setExpanded(!expanded)}>
        <Icon name="file" color={COLORS.primary} size={22} />
        <Subheading style={styles.title} numberOfLines={1}>{`${getLabel(
          "Application ID"
        )}: #${item?.id ? item?.id : "N/A"} `}</Subheading>
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
      <Divider />
      <Divider />
      <Divider style={styles.divider} />
      <View style={styles.footer}>
        <Icon name="phone" size={20} color={COLORS.primary} onPress={onCall} />
        <Icon
          name="map"
          size={20}
          color={COLORS.primary}
          onPress={onLocation}
        />
        <Icon
          name="form-select"
          size={20}
          color={COLORS.primary}
          onPress={onStart}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginVertical: 10,
    elevation: 3,
    marginHorizontal: 2,
    borderRadius: 10,
    backgroundColor: COLORS.light,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
});

export default memo(ApplicationListCard);
