import { BottomSheetTextInput, BottomSheetView } from "@gorhom/bottom-sheet";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet/src";
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Divider, Portal, Text, TextInput, Title } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";

const SearchableSheet = ({
  mode = "flat",
  placeholder = "Data",
  selectedValue,
  data = [],
  title = "Select item",
  left,
  onItemSelect,
  onEndReached,
  onClearPress,
  onChangeText,
}) => {
  const { contentsLabel } = useSelector((state) => state.auth);
  const getLabel = (key) => contentsLabel?.[key] || key;
  const [query, setQuery] = useState("");

  const ref = useRef(null);

  const snapPoints = ["50%", "90%"];

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={() => ref.current?.close()}
      />
    ),
    []
  );

  const filteredData = useMemo(
    () =>
      data.filter((item) => item?.toLowerCase()?.includes(query.toLowerCase())),
    [data, query]
  );

  const selected = useMemo(
    () => data.find((item) => item.toString().includes(selectedValue)),
    [data, selectedValue]
  );

  return (
    <View>
      <Pressable onPress={() => ref.current?.expand()}>
        <TextInput
          value={selected && selected === selectedValue ? selected : ""}
          label={placeholder}
          style={styles.input}
          mode={mode}
          editable={false}
          left={left ? <TextInput.Icon icon={left} /> : null}
        />
      </Pressable>

      <Portal>
        <BottomSheet
          ref={ref}
          style={{ padding: 10 }}
          backdropComponent={renderBackdrop}
          snapPoints={snapPoints}
          enablePanDownToClose
          index={-1}
        >
          <BottomSheetView
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 10,
            }}
          >
            <Title style={styles.title}>{title}</Title>
            <Pressable
              onPress={() => {
                setQuery("");
                ref.current?.close();
                if (onClearPress !== undefined) {
                  onClearPress();
                }
              }}
            >
              <Text style={{ fontWeight: "bold" }}>{getLabel("Clear")}</Text>
            </Pressable>
          </BottomSheetView>
          <TextInput
            placeholder={getLabel("Search")}
            underlineStyle={{
              display: "none",
            }}
            theme={{
              roundness: 10,
            }}
            style={{
              backgroundColor: "#fff",
              elevation: 3,
              width: "99%",
              alignSelf: "center",
              borderRadius: 10,
              marginVertical: 10,
              paddingHorizontal: 10,
            }}
            value={query}
            onChangeText={(text) => {
              setQuery(text);

              if (onChangeText !== undefined) {
                onChangeText(text);
              }
            }}
          />
          <BottomSheetFlatList
            data={filteredData}
            contentContainerStyle={{ padding: 10 }}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <>
                <Pressable
                  style={styles.item}
                  onPress={() => {
                    ref.current?.close();
                    onItemSelect(item);

                    setQuery("");
                  }}
                >
                  <Text>{item}</Text>
                  <Icon
                    name={
                      item === selectedValue
                        ? "radiobox-marked"
                        : "radiobox-blank"
                    }
                    size={22}
                  />
                </Pressable>
                <Divider />
                <Divider />
                <Divider />
              </>
            )}
            onEndReached={onEndReached}
          />
        </BottomSheet>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    marginVertical: 10,
  },
  title: {
    fontWeight: "bold",
  },
  item: {
    marginVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default memo(SearchableSheet);
