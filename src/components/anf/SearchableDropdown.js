import React, { useState, useCallback, useMemo, useRef } from "react";
import { StyleSheet, TouchableOpacity, View, FlatList } from "react-native";
import { Text, TextInput, useTheme, Divider } from "react-native-paper";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../../core/theme/colors";

const SearchableDropdown = ({
  label,
  placeholder,
  options = [],
  value,
  onSelect,
  error,
  disabled = false,
}) => {
  const theme = useTheme();
  const bottomSheetRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    const found = options.find(
      (opt) => String(opt.value) === String(value)
    );
    return found ? found.label : "";
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const openSheet = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setSearchQuery("");
    setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(0);
    }, 100);
  }, [disabled]);

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setIsOpen(false);
    setSearchQuery("");
  }, []);

  const handleSelect = useCallback(
    (item) => {
      onSelect(item.value);
      closeSheet();
    },
    [onSelect, closeSheet]
  );

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <>
      <TouchableOpacity
        onPress={openSheet}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <View
          style={[
            styles.selector,
            {
              backgroundColor: colors.fieldsColor,
              borderBottomColor: error
                ? theme.colors.error
                : colors.darkGrey,
              borderBottomWidth: error ? 2 : 0.6,
              opacity: disabled ? 0.6 : 1,
            },
          ]}
        >
          <View style={styles.selectorContent}>
            <Text
              style={[
                styles.selectorText,
                {
                  color: selectedLabel
                    ? theme.colors.onSurface
                    : "#767A7D",
                },
              ]}
              numberOfLines={1}
            >
              {selectedLabel || placeholder || `Select ${label}`}
            </Text>
            <Icon
              name="chevron-down"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
          {!!label && (
            <Text style={styles.floatingLabel}>{label}</Text>
          )}
        </View>
      </TouchableOpacity>

      {isOpen && (
        <Portal>
          <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={["70%"]}
            enablePanDownToClose
            onClose={() => setIsOpen(false)}
            backgroundStyle={{ backgroundColor: theme.colors.background }}
            handleIndicatorStyle={{
              backgroundColor: theme.colors.onSurfaceVariant,
            }}
            backdropComponent={renderBackdrop}
          >
            <BottomSheetView style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.colors.onBackground }]}>
                {label || "Select Option"}
              </Text>
              <BottomSheetTextInput
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.onSurface,
                  },
                ]}
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
            </BottomSheetView>
            <BottomSheetFlatList
              data={filteredOptions}
              keyExtractor={(item) => String(item.value)}
              contentContainerStyle={styles.listContainer}
              ItemSeparatorComponent={() => <Divider />}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No options found</Text>
              }
              renderItem={({ item }) => {
                const isSelected = String(item.value) === String(value);
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      isSelected && {
                        backgroundColor: theme.colors.primaryContainer,
                      },
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && {
                          color: theme.colors.primary,
                          fontWeight: "bold",
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Icon
                        name="check"
                        size={20}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </BottomSheet>
        </Portal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: "center",
    minHeight: 56,
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorText: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  floatingLabel: {
    position: "absolute",
    top: 4,
    left: 16,
    fontSize: 11,
    color: "#767A7D",
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchInput: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: {
    fontSize: 15,
    flex: 1,
  },
  emptyText: {
    textAlign: "center",
    paddingVertical: 24,
    color: "#767A7D",
    fontSize: 15,
  },
});

export default SearchableDropdown;
