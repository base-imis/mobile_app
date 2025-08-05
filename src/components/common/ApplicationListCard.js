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
        )}: #${
          item?.application_id ? item?.application_id : "N/A"
        } `}</Subheading>
        <Icon name={expanded ? "chevron-up" : "chevron-down"} size={22} />
      </Pressable>

      {expanded && (
        <>
          <Divider />
          <Divider />
          {/* <Text>{JSON.stringify(item)}</Text> */}
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
            <Text>{getLabel("Confirmed Emptying Date")}: </Text>
            <Text style={styles.text}>
              {item?.confirmed_emptying_date
                ? item?.confirmed_emptying_date
                : "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text>{getLabel("Owner Name")}: </Text>
            <Text style={styles.text}>
              {item?.owner_name ? item?.owner_name : "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text>{getLabel("Owner Gender")}: </Text>
            <Text style={styles.text}>
              {item?.owner_gender ? item?.owner_gender : "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text>{getLabel("Owner Contact")}: </Text>
            <Text style={styles.text}>
              {item?.owner_contact ? item?.owner_contact : "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text>{getLabel("BIN")}: </Text>
            <Text style={styles.text}>{item?.bin ? item?.bin : "N/A"}</Text>
          </View>
          {/* <View style={styles.row}>
            <Text>{getLabel("Ward")}: </Text>
            <Text style={styles.text}>{item?.ward ? item?.ward : "N/A"}</Text>
          </View> */}
          {/* <View style={styles.row}>
            <Text>{getLabel("Area Name")}: </Text>
            <Text style={styles.text}>
              {item?.ara_name ? item?.ara_name : "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text>{getLabel("Block Name")}: </Text>
            <Text style={styles.text}>
              {item?.block_name ? item?.block_name : "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text>{getLabel("Road Number")}: </Text>
            <Text style={styles.text}>
              {item?.road_number ? item?.road_number : "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text>{getLabel("House Number")}: </Text>
            <Text style={styles.text}>
              {item?.building_house_number
                ? item?.building_house_number
                : "N/A"}
            </Text>
          </View> */}

          <View style={styles.row}>
            <Text>{getLabel("Collapsable Section")}: </Text>
            <Text style={styles.text}>
              {item?.collapsable_section ? item?.collapsable_section : "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text>{getLabel("Road Width (m)")}: </Text>
            <Text style={styles.text}>
              {item?.road_width ? item?.road_width : "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text>{getLabel("Distance From Nearest Mortable Road (m)")}: </Text>
            <Text style={styles.text}>
              {item?.distance_from_nearest_mortable_road
                ? item?.distance_from_nearest_mortable_road
                : "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text>{getLabel("Appropriate Desludging Vehicle")}: </Text>
            <Text style={styles.text}>
              {item?.appropriate_desludging_vehicle_size
                ? item?.appropriate_desludging_vehicle_size
                : "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text>{getLabel("Containment Size")}: </Text>
            <Text style={styles.text}>
              {item?.containment_size ? item?.containment_size : "N/A"}
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
