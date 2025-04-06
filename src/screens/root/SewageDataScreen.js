import React from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { Button, Caption, Card, Divider, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import HorizontalSpacer from "../../components/common/HorizontalSpacer";
import VerticalSpacer from "../../components/common/VerticalSpacer";

import { COLORS, SPACINGS } from "../../core/theme";
import { removeSewageData } from "../../store/slices/map.slice";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ROUTES } from "../../core/constants/routes";
import { URLS } from "../../core/constants/urls";
import { resetToken } from "../../store/slices/auth.slice";
import { ErrorMessage } from "../../components/errorComponent";
import { Header } from "../../components/headers";
import { BASE_URL_ENV } from "../../constants/config";

const BuildingDataScreen = () => {
  const { contentsLabel } = useSelector((state) => state.auth);
  const getLabel = (key) => contentsLabel?.[key] || key;
  const dispatch = useDispatch();
  const { sewageData } = useSelector((state) => state.map);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  const deleteBuildingData = (index) => {
    Alert.alert(
      getLabel("Confirm delete"),
      getLabel("Are you sure you want to delete this sewer information?"),
      [
        {
          text: getLabel("CANCEL"),
        },
        {
          text: getLabel("DELETE"),
          onPress: () => {
            dispatch(removeSewageData(index));
          },
        },
      ]
    );
  };

  const onUpload = async (item, index) => {
    setLoading(true);

    const token = await AsyncStorage.getItem("token");

    const url = `${BASE_URL_ENV}/api/${URLS.saveSewerData}`;

    const formdata = new FormData();

    formdata.append("bin", item.bin);
    formdata.append("sewer_code", item.sewer_code);

    fetch(url, {
      method: "POST",
      body: formdata,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      redirect: "follow",
    })
      .then((res) => res.json())
      .then((res) => {
        const { success, errors, message } = res;

        if (success) {
          Alert.alert(getLabel("Uploaded"), message);
          dispatch(removeSewageData(index));
        } else {
          if (errors) {
            const { bin, tax_code } = errors;

            if (bin) {
              Alert.alert("Error", bin[0]);
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
    return (
      <Card style={styles.singleData} theme={{ roundness: 2 }}>
        <Card.Content>
          <Caption>{getLabel("Building identification number")}</Caption>
          <Text>{item.bin}</Text>

          <Caption>{getLabel("Sewer Code")}</Caption>
          <Text>{item.sewer_code}</Text>

          {/* <Caption>Path</Caption>
          <Text>{item.path}</Text> */}

          <Caption>{getLabel("Created date")}</Caption>
          <Text>{item.created_date}</Text>
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
            {getLabel("Delete")}
          </Button>
          <HorizontalSpacer size={5} />
          <Button
            compact
            mode="contained"
            contentStyle={styles.btnContent}
            onPress={() => onUpload(item, index)}
          >
            {getLabel("Upload")}
          </Button>
          <HorizontalSpacer size={10} />
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Header title={getLabel("Sewer Data")} />
      {sewageData.length > 0 ? (
        <>
          <LoadingSpinner isVisible={loading} title="Uploading" />
          <FlatList
            data={sewageData}
            contentContainerStyle={styles.contentContainer}
            renderItem={renderBuildlingItems}
            keyExtractor={(_, index) => index}
            ItemSeparatorComponent={VerticalSpacer}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <ErrorMessage
          message={getLabel(
            "You have not added any sewer data into this device"
          )}
        />
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
