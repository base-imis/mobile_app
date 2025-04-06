import {
  Button,
  Dialog,
  Portal,
  TextInput,
  HelperText,
} from "react-native-paper";
import builder from "xmlbuilder";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import RNFB from "react-native-blob-util";
import { Alert, Platform, ScrollView, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";

import { COLORS, SPACINGS } from "../../core/theme";
import VerticalSpacer from "../common/VerticalSpacer";
import HorizontalSpacer from "../common/HorizontalSpacer";
import { askStoragePermission } from "../../helpers/permissions";
import { addBuildingsData } from "../../store/slices/map.slice";

const SaveDataModal = ({ visible, onClose, onDataSaved }) => {
  const dispatch = useDispatch();
  const { contentsLabel } = useSelector((state) => state.auth);
  const { buildingCoords } = useSelector((state) => state.map);
  const defaultImage =
    "https://st3.depositphotos.com/23594922/31822/v/600/depositphotos_318221368-stock-illustration-missing-picture-page-for-website.jpg";

  const [buildingId, setBuildingId] = useState("");
  const [taxCode, setTaxCode] = useState("");

  const [buildingIdError, setBuildingIdError] = useState(null);
  const [taxCodeError, setTaxCodeError] = useState(null);
  const [assetError, setAssetError] = useState("");
  const getLabel = (key) => contentsLabel?.[key] || key;
  const handleOnSave = () => {
    const isValid = validateData();

    if (isValid) {
      saveDataToKml();
    }
  };

  const validateData = () => {
    setBuildingIdError(null);
    setTaxCodeError(null);

    if (buildingId === "") {
      setBuildingIdError(getLabel("Temporary building code can not be empty!"));
      return false;
    }

    if (taxCode === "") {
      setTaxCodeError(getLabel("Tax Code can not be empty!"));
      return false;
    }

    return true;
  };

  const saveDataToKml = () => {
    const { latitude, longitude } = buildingCoords[0];

    const coords = buildingCoords.map(
      (item) => `${item.longitude},${item.latitude}`
    );
    coords.push(`${longitude},${latitude}`);
    const imageUrl = asset?.uri;
    const xml = builder
      .create("kml", { encoding: "utf-8", standalone: "yes" })
      .att("xmlns", "http://www.opengis.net/kml/2.2")
      .ele("Document")
      // .ele('Style')
      // .att('id', 'buildingStyle')
      // .ele('IconStyle')
      // .ele('Icon')
      // .ele('href', imageUrl) // Reference the image URI from asset
      // .up()
      // .up()
      // .up()
      .ele("Placemark")
      .ele("name", buildingId)
      .up()
      .ele("Polygon")
      .ele("outerBoundaryIs")
      .ele("LinearRing")
      .ele("tessellate", "1")
      .up()
      .ele("coordinates", coords.join(" "))
      .up()
      .end({ pretty: true });

    console.log(Platform.constants.Release);

    if (Platform.constants.Release >= 13) {
      const path = `${RNFB.fs.dirs.DownloadDir}/${buildingId}_${taxCode}.kml`;
      RNFB.fs
        .writeFile(path, xml)
        .then(() => {
          const payload = {
            temp_building_code: buildingId,
            tax_code: taxCode,
            path,
            coords: buildingCoords,
            // imageFile: asset,
          };
          dispatch(addBuildingsData(payload));

          Alert.alert(
            getLabel("Saved"),
            getLabel("Building data saved to local storage"),
            [
              {
                text: getLabel("OK"),
              },
            ]
          );
        })
        .catch((error) => {
          console.log("Error", error);
        })
        .finally(() => {
          onDataSaved();
          setBuildingId("");
          setTaxCode("");
        });

      return;
    }

    askStoragePermission(() => {
      const path = `${RNFB.fs.dirs.DownloadDir}/${buildingId}_${taxCode}.kml`;
      RNFB.fs
        .writeFile(path, xml)
        .then(() => {
          const payload = {
            temp_building_code: buildingId,
            tax_code: taxCode,
            path,
            coords: buildingCoords,
          };
          dispatch(addBuildingsData(payload));

          Alert.alert(
            getLabel("Saved"),
            getLabel("Building data saved to local storage"),
            [
              {
                text: getLabel("OK"),
              },
            ]
          );
        })
        .catch((error) => {
          console.log("Error", error);
        })
        .finally(() => {
          onDataSaved();
          setBuildingId("");
          setTaxCode("");
        });
    });
  };
  const [asset, setAsset] = useState();
  // const [houseImageDialog, setHouseImageDialog] = useState(false);
  // const option = {
  //   mediaType: "photo",
  //   cameraType: "back",
  //   quality: 0.1,
  // };
  // const openCamera = () => {
  //   launchCamera(option, (res) => {
  //     if (res.didCancel) {
  //       setHouseImageDialog(false);
  //       return;
  //     }

  //     if (res?.assets && res.assets[0]?.fileSize > 500000) {
  //       Alert.alert(
  //         "File size error",
  //         "The image size exceeds 5 MB, please select lower size image."
  //       );
  //       return;
  //     }

  //     setAsset(res.assets[0]);
  //     setHouseImageDialog(false);
  //   });
  // };

  // const openGallery = () => {
  //   launchImageLibrary(option, (res) => {
  //     if (res.didCancel) {
  //       setHouseImageDialog(false);

  //       if (res?.assets && res.assets[0]?.fileSize > 500000) {
  //         Alert.alert(
  //           "File size error",
  //           "The image size exceeds 5 MB, please try again"
  //         );
  //         return;
  //       }
  //     }

  //     setAsset(res.assets[0]);
  //     setHouseImageDialog(false);
  //   });
  // };
  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={() => onClose(false)}
        style={{ borderRadius: 16 }}
      >
        <Dialog.Title>{getLabel("Save Building Info")}</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollArea}
          >
            <TextInput
              autoFocus
              mode="outlined"
              value={buildingId}
              onChangeText={setBuildingId}
              error={buildingIdError ? true : false}
              label={getLabel("Temporary Building Code")}
            />
            {buildingIdError && (
              <HelperText style={styles.errorText}>
                {buildingIdError}
              </HelperText>
            )}
            <VerticalSpacer />
            <TextInput
              mode="outlined"
              value={taxCode}
              label={getLabel("Tax Code")}
              onChangeText={setTaxCode}
              error={taxCodeError ? true : false}
            />
            {taxCodeError && (
              <HelperText style={styles.errorText}>{taxCodeError}</HelperText>
            )}
            <VerticalSpacer />
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={() => onClose(false)}>{getLabel("Close")}</Button>
          <HorizontalSpacer size={18} />
          <Button mode="contained" onPress={handleOnSave}>
            {getLabel("Save")}
          </Button>
          <HorizontalSpacer />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default SaveDataModal;

const styles = StyleSheet.create({
  scrollArea: {
    paddingTop: SPACINGS.md,
    paddingBottom: SPACINGS.lg,
  },

  errorText: {
    color: COLORS.error,
  },
  imageContainer: {
    marginTop: 10,
    alignSelf: "center",
    height: 200,
    width: 200,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  uploadImageCard: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderStyle: "dashed",
    borderRadius: 8,
  },
  removeBtn: {
    position: "absolute",
    right: 4,
    bottom: 4,
  },
  uploadImageContainer: {
    gap: 8,
    alignItems: "center",
  },
  uploadImageCardContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 160,
  },
});
