import React from "react";
import {
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
  RefreshControl,
  View,
  Image,
} from "react-native";
import { Button, Caption, Card, Divider, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import HorizontalSpacer from "../../components/common/HorizontalSpacer";
import VerticalSpacer from "../../components/common/VerticalSpacer";

import { COLORS, SPACINGS } from "../../core/theme";
import { removeBuildingData } from "../../store/slices/map.slice";
import { uploadBuildingData } from "../../service/building_service";

import { useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import mime from "mime";
import RNFB from "react-native-blob-util";
import { ROUTES } from "../../core/constants/routes";
import { useEffect } from "react";
import { resetToken } from "../../store/slices/auth.slice";
import { URLS } from "../../core/constants/urls";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ErrorMessage } from "../../components/errorComponent";
import { Header } from "../../components/headers";
import { BASE_URL_ENV } from "../../constants/config";

const BuildingDataScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { buildingsData } = useSelector((state) => state.map);
  console.log("BuildingData!!", buildingsData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  const deleteBuildingData = (index) => {
    Alert.alert(
      "Confirm delete",
      "Are you sure you want to delete this building information?",
      [
        {
          text: "Cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            dispatch(removeBuildingData(index));
          },
        },
      ]
    );
  };

  const convertDate = (date) => {
    let newDate = date.split("-").reverse();
    let temp = newDate[2];
    newDate[2] = newDate[1];
    newDate[1] = temp;
    newDate = newDate.join("-");
    return newDate;
  };

  const onUpload = async (item, index) => {
    let date = item.created_date.split(",")[0];
    let collected_date = convertDate(date);
    setLoading(true);
    const data = new FormData();

    let kml = "file://" + item.path;

    console.log("kml ", kml);

    data.append("temp_building_code", item.temp_building_code);
    data.append("tax_code", item.tax_code);
    data.append("collected_date", collected_date);
    data.append("kml", {
      uri: kml,
      type: mime.getType(kml),
      name: "building.kml",
    });

    const token = await AsyncStorage.getItem("token");

    const url = `${BASE_URL_ENV}/api/${URLS.uploadBuildingData}`;

    fetch(url, {
      method: "POST",
      body: data,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      redirect: "follow",
    })
      .then((res) => res.json())
      .then((res) => {
        console.log("res", res);

        const { status, success, errors, message } = res;

        if (status || success) {
          Alert.alert("Uploaded", message);
          dispatch(removeBuildingData(index));
          RNFB.fs.unlink(item.path);
        } else {
          if (errors) {
            const { temp_building_code, tax_code } = errors;

            if (temp_building_code) {
              Alert.alert("Error", temp_building_code[0]);
              return;
            } else if (tax_code) {
              Alert.alert("Error", tax_code[0]);
            }
          } else {
            Alert.alert("Error", message);
          }
        }
      })
      .catch((err) => {
        console.log("building err", err);

        const { message } = err?.response?.data;

        setLoading(false);

        if (err?.response?.status === 500) {
          if (message) {
            Alert.alert("Invalid file format", message);
            return;
          }

          Alert.alert(
            "500",
            "Something is wrong, please try again or at a later time."
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderBuildlingItems = ({ item, index }) => {
    console.log("Item!!Render", item?.imageFile);
    return (
      <Card style={styles.singleData} theme={{ roundness: 2 }}>
        <Card.Content
          style={{ flexDirection: "row", justifyContent: "space-between" }}
        >
          <View style={{ width: "100%" }}>
            <Caption>Temporary Building Code</Caption>
            <Text>{item?.temp_building_code}</Text>

            <Caption>Tax Code</Caption>
            <Text>{item?.tax_code}</Text>

            {/* <Caption>Path</Caption>
          <Text>{item.path}</Text> */}

            <Caption>Created date</Caption>
            <Text>{item?.created_date}</Text>
          </View>
        </Card.Content>
        <VerticalSpacer />
        <Divider />
        <VerticalSpacer size={2} />
        <Card.Actions>
          <Button
            compact
            mode="outlined"
            onPress={() => deleteBuildingData(index)}
          >
            Delete
          </Button>
          <HorizontalSpacer size={5} />
          <Button
            compact
            mode="contained"
            contentStyle={styles.btnContent}
            onPress={() => onUpload(item, index)}
          >
            Upload
          </Button>
          <HorizontalSpacer size={10} />
          <Button
            compact
            mode="contained"
            contentStyle={styles.btnContent}
            onPress={() => navigation.navigate(ROUTES.kml_viewer, { item })}
          >
            View on map
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Buildings Data" />
      {buildingsData.length > 0 ? (
        <>
          <LoadingSpinner isVisible={loading} title="Uploading" />
          <FlatList
            data={buildingsData}
            contentContainerStyle={styles.contentContainer}
            renderItem={renderBuildlingItems}
            keyExtractor={(_, index) => index}
            ItemSeparatorComponent={VerticalSpacer}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <ErrorMessage message={"No building data stored in this device"} />
      )}
    </View>
  );
};

export default BuildingDataScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  singleData: {
    elevation: 1,
  },

  contentContainer: {
    padding: SPACINGS.xs,
    paddingBottom: SPACINGS.lg,
  },

  btnContent: {
    backgroundColor: COLORS.primary,
  },

  deleteBtn: {
    backgroundColor: COLORS.error,
  },

  mapBtn: {
    paddingLeft: 20,
    backgroundColor: COLORS.primary,
  },
});
