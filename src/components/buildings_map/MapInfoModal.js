import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Caption,
  Dialog,
  Divider,
  Portal,
  Subheading,
  Text,
} from "react-native-paper";
import { useSelector } from "react-redux";

import HorizontalSpacer from "../common/HorizontalSpacer";
import { COLORS, SPACINGS } from "../../core/theme";

const MapInfoModal = ({ visible, onClose, onNext, buildingCoords }) => {
  const { contentsLabel } = useSelector((state) => state.auth);
  const getLabel = (key) => contentsLabel?.[key] || key;

  const TableHeader = () => {
    return (
      <View style={styles.tableHeader}>
        <Subheading style={styles.tableTitle}>{getLabel("Marker")}</Subheading>

        <Subheading style={styles.tableTitle}>
          {getLabel("Latitude")}
        </Subheading>
        <Subheading style={styles.tableTitle}>
          {getLabel("Longitude")}
        </Subheading>
      </View>
    );
  };
  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={() => onClose(false)}
        style={{ borderRadius: 16 }}
      >
        <Text
          variant="titleLarge"
          style={{ textAlign: "center", fontWeight: "bold" }}
        >
          {getLabel("Building Information")}
        </Text>
        <Divider style={{ marginTop: 16, marginBottom: 6 }} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollArea}
        >
          <TableHeader />
          {buildingCoords?.map((item, index) => {
            return (
              <View style={styles.singleCoord} key={index}>
                <Caption numberOfLines={1} style={styles.txtCoord}>
                  {index + 1}
                </Caption>
                <Caption numberOfLines={1} style={styles.txtCoord}>
                  {item.latitude.toFixed(5)}
                </Caption>
                <Caption numberOfLines={1} style={styles.txtCoord}>
                  {item.longitude.toFixed(5)}
                </Caption>
              </View>
            );
          })}
        </ScrollView>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingHorizontal: 38,
            marginBottom: 22,
          }}
        >
          <Button
            onPress={() => onClose(false)}
            style={{ paddingHorizontal: 8 }}
          >
            {getLabel("Close")}
          </Button>
          <HorizontalSpacer size={18} />
          <Button
            mode="contained"
            onPress={() => onNext()}
            style={{ borderRadius: 8 }}
          >
            {getLabel("Next")}
          </Button>
        </View>
      </Dialog>
    </Portal>
  );
};

export default MapInfoModal;

const styles = StyleSheet.create({
  scrollArea: {
    paddingBottom: SPACINGS.lg,
  },

  tableHeader: {
    flexDirection: "row",
  },

  tableTitle: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.primary,
  },

  singleCoord: {
    flex: 1,
    flexDirection: "row",
  },

  txtCoord: {
    width: "33.33%",
    textAlign: "center",
  },
});
