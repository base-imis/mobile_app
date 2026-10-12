import React, { memo, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const SearchFilterBar = ({
  filters = [],
  values = {},
  onChangeFilter,
  resultCount,
  totalCount,
  getLabel = (k) => k,
  // ANF toggle props (optional)
  showAnfToggle = false,
  anfOnly = false,
  anfCount = 0,
  onAnfToggle,
}) => {
  const theme = useTheme();
  const inputRef = useRef(null);

  const [activeFilters, setActiveFilters] = useState(
    filters.map((f) => f.key)
  );
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const hasSearch = searchText.trim().length > 0;
  const hasAnyFilter = anfOnly || hasSearch;

  const toggleFilter = (key) => {
    setActiveFilters((prev) => {
      let updated;
      if (prev.includes(key)) {
        if (prev.length === 1) return prev;
        updated = prev.filter((k) => k !== key);
      } else {
        updated = [...prev, key];
      }
      applySearch(searchText, updated);
      return updated;
    });
  };

  const applySearch = (text, currentActiveFilters) => {
    const active = currentActiveFilters || activeFilters;
    filters.forEach((f) => {
      if (active.includes(f.key)) {
        onChangeFilter(f.key, text);
      } else {
        onChangeFilter(f.key, "");
      }
    });
  };

  const handleTextChange = (text) => {
    setSearchText(text);
    applySearch(text, activeFilters);
  };

  const clearSearch = () => {
    setSearchText("");
    filters.forEach((f) => onChangeFilter(f.key, ""));
    if (anfOnly && onAnfToggle) onAnfToggle(false);
    inputRef.current?.focus();
  };

  const clearAll = () => {
    setSearchText("");
    filters.forEach((f) => onChangeFilter(f.key, ""));
    if (anfOnly && onAnfToggle) onAnfToggle(false);
  };

  // Dynamic placeholder
  const placeholder = (() => {
    const activeLabels = filters
      .filter((f) => activeFilters.includes(f.key))
      .map((f) => f.label || f.key);
    return `${getLabel("Search by")} ${activeLabels.join(", ")}`;
  })();

  return (
    <View style={styles.container}>
      {/* Search input */}
      <View
        style={[
          styles.searchCard,
          isFocused && styles.searchCardFocused,
          hasSearch && styles.searchCardActive,
        ]}
      >
        <View style={styles.searchIconContainer}>
          <Icon
            name="magnify"
            size={20}
            color={hasSearch ? "#1E4D78" : "#8E99A4"}
          />
        </View>

        <TextInput
          ref={inputRef}
          placeholder={placeholder}
          placeholderTextColor="#A0AAB4"
          value={searchText}
          onChangeText={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />

        {hasSearch && (
          <TouchableOpacity
            onPress={clearSearch}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.clearButton}
          >
            <View style={styles.clearCircle}>
              <Icon name="close" size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Chips row: search field chips + divider + ANF toggle */}
      <View style={styles.bottomRow}>
        <View style={styles.chipsRow}>
          {/* Search field chips */}
          {filters.map((filter) => {
            const isActive = activeFilters.includes(filter.key);
            return (
              <TouchableOpacity
                key={filter.key}
                onPress={() => toggleFilter(filter.key)}
                activeOpacity={0.7}
                style={[
                  styles.chip,
                  isActive ? styles.chipActive : styles.chipInactive,
                ]}
              >
                {isActive && (
                  <Icon name="check" size={12} color="#FFFFFF" />
                )}
                <Text
                  style={[
                    styles.chipText,
                    isActive
                      ? styles.chipTextActive
                      : styles.chipTextInactive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Divider + ANF toggle */}
          {showAnfToggle && (
            <>
              <View style={styles.chipDivider} />
              <TouchableOpacity
                onPress={() => onAnfToggle && onAnfToggle(!anfOnly)}
                activeOpacity={0.7}
                style={[
                  styles.chip,
                  anfOnly ? styles.anfChipActive : styles.anfChipInactive,
                ]}
              >
                <Icon
                  name={anfOnly ? "flag-checkered" : "flag-outline"}
                  size={12}
                  color={anfOnly ? "#FFFFFF" : "#dc2626"}
                />
                <Text
                  style={[
                    styles.chipText,
                    anfOnly ? styles.anfChipTextActive : styles.anfChipTextInactive,
                  ]}
                >
                  ANF{anfCount > 0 ? ` (${anfCount})` : ""}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Clear all + result count */}
        <View style={styles.rightSection}>
          {hasAnyFilter && (
            <TouchableOpacity
              onPress={clearAll}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.clearAllButton}
            >
              <Icon name="filter-remove-outline" size={14} color="#6B7C8D" />
              <Text style={styles.clearAllText}>Clear</Text>
            </TouchableOpacity>
          )}
          {hasSearch && (
            <View
              style={[
                styles.countBadge,
                resultCount === 0
                  ? styles.countBadgeEmpty
                  : styles.countBadgeFound,
              ]}
            >
              <Text
                style={[
                  styles.countText,
                  {
                    color: resultCount === 0 ? "#C62828" : "#1E4D78",
                  },
                ]}
              >
                {resultCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
  },

  // ─── Search input card ──────────────────────────
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    height: 44,
    paddingHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#1E4D78",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  searchCardFocused: {
    borderColor: "#B8CBE0",
    ...Platform.select({
      ios: { shadowOpacity: 0.12, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  searchCardActive: {
    borderColor: "#1E4D78",
    borderWidth: 1.5,
  },
  searchIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1C1E",
    paddingVertical: 0,
    height: 44,
    letterSpacing: 0.1,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
    marginRight: 4,
  },
  clearCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#B0BEC5",
    alignItems: "center",
    justifyContent: "center",
  },

  // ─── Bottom row ──────────────────────────────────
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 2,
  },
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "nowrap",
    flexShrink: 1,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: "#1E4D78",
  },
  chipInactive: {
    backgroundColor: "#F0F4F8",
    borderWidth: 1,
    borderColor: "#D6DEE6",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  chipTextInactive: {
    color: "#6B7C8D",
  },

  // ─── Chip divider ────────────────────────────────
  chipDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#D6DEE6",
    marginHorizontal: 2,
  },

  // ─── ANF chip ────────────────────────────────────
  anfChipActive: {
    backgroundColor: "#dc2626",
  },
  anfChipInactive: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  anfChipTextActive: {
    color: "#FFFFFF",
  },
  anfChipTextInactive: {
    color: "#dc2626",
  },

  // ─── Right section ────────────────────────────────
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
    marginLeft: 6,
  },
  clearAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#F0F4F8",
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7C8D",
  },

  // ─── Result count badge ──────────────────────────
  countBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countBadgeFound: {
    backgroundColor: "rgba(30, 77, 120, 0.1)",
  },
  countBadgeEmpty: {
    backgroundColor: "rgba(198, 40, 40, 0.1)",
  },
  countText: {
    fontSize: 12,
    fontWeight: "700",
  },
});

export default memo(SearchFilterBar);
