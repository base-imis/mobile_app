import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { Button, Dialog, HelperText, Portal } from "react-native-paper";

import { COLORS, SPACINGS } from "../../core/theme";

import { useDispatch } from "react-redux";
import { addSewageData } from "../../store/slices/map.slice";
import HorizontalSpacer from "../common/HorizontalSpacer";
import SearchableSheet from "../common/SearchableSheet";
import VerticalSpacer from "../common/VerticalSpacer";
import { getBuildings, getSewerCode } from "../../service/building_service";

const SaveSewageModal = ({ visible, onClose, onDataSaved }) => {
  const dispatch = useDispatch();

  const [buildingId, setBuildingId] = useState("");
  const [sewerId, setSewerId] = useState("");

  const [buildingIdError, setBuildingIdError] = useState(null);
  const [taxCodeError, setTaxCodeError] = useState(null);

  const [sewers, setSewers] = useState([]);
  const [buildings, setBuildings] = useState([]);
  // console.log('buildingsssssasasa', buildings);
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
      setBuildingIdError("Building identification number can not be empty!");
      return false;
    }

    if (sewerId === "") {
      setTaxCodeError("Sewer Id can not be empty!");
      return false;
    }

    return true;
  };

  const saveDataToKml = () => {
    const payload = {
      bin: buildingId,
      sewer_code: sewerId,
    };

    dispatch(addSewageData(payload));

    Alert.alert("Saved", "Sewer data saved to local storage");

    onDataSaved();
    setBuildingId("");
    setSewerId("");
  };

  const fetchBuildings = () => {
    getBuildings()
      .then((res) => {
        const { status, data } = res.data;
        if (status === 200) {
          setBuildings(data);
        }
      })
      .catch((err) => {
        console.log("errWhileFetchingBuilding", err);
      });
  };

  const fetchSewers = () => {
    getSewerCode()
      .then((res) => {
        const { status, data } = res.data;

        if (status === 200) {
          setSewers(data);
        }
      })
      .catch((err) => {
        console.log("errWhileFetchingSewer", err);
      });
  };

  useEffect(() => {
    fetchBuildings();
    fetchSewers();
  }, []);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={() => onClose(false)}>
        <Dialog.Title>Save Sewer Info</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollArea}
          >
            <SearchableSheet
              selectedValue={buildingId}
              onItemSelect={(id) => {
                setBuildingId(id);
                setBuildingIdError("");
              }}
              placeholder="BIN"
              title="Select BIN"
              mode="outlined"
              onClearPress={() => setBuildingId("")}
              data={buildings}
            />
            {buildingIdError && (
              <HelperText style={styles.errorText}>
                {buildingIdError}
              </HelperText>
            )}
            <VerticalSpacer />
            <SearchableSheet
              selectedValue={sewerId}
              onItemSelect={(id) => {
                setTaxCodeError("");
                setSewerId(id);
              }}
              placeholder="Sewer Code"
              title="Select sewer"
              mode="outlined"
              onClearPress={() => setSewerId("")}
              data={sewers}
            />
            {taxCodeError && (
              <HelperText style={styles.errorText}>{taxCodeError}</HelperText>
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={() => onClose(false)}>Close</Button>
          <HorizontalSpacer size={18} />
          <Button mode="contained" onPress={handleOnSave}>
            Save
          </Button>
          <HorizontalSpacer />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default SaveSewageModal;

const styles = StyleSheet.create({
  scrollArea: {
    paddingTop: SPACINGS.md,
    paddingBottom: SPACINGS.lg,
  },

  errorText: {
    color: COLORS.error,
  },
});
