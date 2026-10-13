import React, { useEffect, useState } from "react";
import { Calendar } from "react-native-calendars";
import dayjs from "dayjs";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  TextInput,
  Portal,
  Dialog,
  IconButton,
  Text,
} from "react-native-paper";
import { useSelector } from "react-redux";

const LEGEND = [
  { color: "#FFC107", label: "Holiday" },
  { color: "#BBDEFB", label: "Weekend" },
  { color: "#FFAB91", label: "1 Trip" },
  { color: "#FFF59D", label: "2 Trips" },
  { color: "#C8E6C9", label: "3+ Trips" },
  { color: "#F8BBD0", label: "0 Trips" },
];

const CalendarLegend = () => (
  <View style={styles.legendContainer}>
    {LEGEND.map((item, idx) => (
      <View key={item.label} style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: item.color }]} />
        <Text style={styles.legendLabel}>{item.label}</Text>
      </View>
    ))}
  </View>
);

const getMonthRange = (date) => {
  const start = dayjs(date).startOf("month").format("YYYY-MM-DD");
  const end = dayjs(date).endOf("month").format("YYYY-MM-DD");
  return { start, end };
};

const CustomNormalCalendar = ({
  onDateSelect,
  selectedDate,
  mode,
  err,
  label,
  field,
  format,
  disabled,
}) => {
  const { contentsLabel } = useSelector((state) => state.auth);
  const getLabel = (key) => contentsLabel?.[key] || key;
  const [markedDates, setMarkedDates] = useState({
    [field.value]: { selected: true, marked: true, selectedColor: "blue" },
  });
  const [currentMonth, setCurrentMonth] = useState(
    // dayjs().format(format || "YYYY-MM-DD")
    selectedDate
  );
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);
  const [disabledDates, setDisabledDates] = useState({});
  const [dates, setDates] = useState();
  const [viewedDate, setViewedDate] = useState(new Date());

  let minDate = ""; // disables dates before today
  let maxDate = ""; // disables dates after today

  const formatDisplayDate = (date) => {
    if (!date) return format || "YYYY-MM-DD";
    return dayjs(date).format(format || "YYYY-MM-DD");
  };

  const validation =
    (typeof field.validation == "string" && field.validation.split("|")) || [];

  // before or equal
  const beforeOrEqual = field?.validation?.includes("before_or_equal");
  let beforeOrEqualValue = [];
  if (beforeOrEqual == true) {
    const beforeOrEqualIndex = validation.findIndex((v) =>
      v?.includes("before_or_equal")
    );

    if (beforeOrEqualIndex != -1) {
      const condition = validation[beforeOrEqualIndex]?.split(":")[1];
      const c = condition?.trim()?.split(",");
      maxDate = new Date().toISOString().split("T")[0];

      beforeOrEqualValue = c;
    }
  }

  //after or equal
  const afterOrEqual = field?.validation?.includes("after_or_equal");
  let afterOrEqualValue = [];
  if (afterOrEqual == true) {
    const afterOrEqualIndex = validation.findIndex((v) =>
      v?.includes("after_or_equal")
    );

    if (afterOrEqualIndex != -1) {
      const condition = validation[afterOrEqualIndex]?.split(":")[1];
      const c = condition?.trim()?.split(",");
      minDate = new Date().toISOString().split("T")[0];
      afterOrEqualValue = c;
    }
  }

  function markDate(day) {
    setMarkedDates({
      [day.dateString]: {
        selected: true,
        marked: true,
        selectedColor: "blue",
      },
    });
  }

  const handleDayPress = (day) => {
    try {
      const today = new Date();

      if (beforeOrEqual) {
        today.setHours(23, 59, 59, 999); // Normalize to midnight
        if (beforeOrEqualValue?.includes("today")) {
          if (new Date(day.dateString) > today) {
            Alert.alert(
              getLabel("Message"),
              getLabel("Future date cannot be Selected.")
            );
          } else {
            markDate(day);
            onDateSelect(day.dateString);
            setModalVisible(false);
          }
        }
      } else if (afterOrEqual) {
        today.setHours(0, 0, 0, 0); // Normalize to midnight
        if (afterOrEqualValue?.includes("today")) {
          if (new Date(day.dateString) >= today) {
            onDateSelect(day.dateString);
            setModalVisible(false);
            markDate(day);
          } else {
            Alert.alert(
              getLabel("Message"),
              getLabel("Past date cannot be selected.")
            );
          }
        }
      } else {
        markDate(day);
        onDateSelect(day.dateString);
        setModalVisible(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => (!disabled ? setModalVisible(true) : () => {})}
      >
        <TextInput
          disabled={disabled}
          // label={getLabel(label)}
          mode={mode || ""}
          dense={true}
          value={formatDisplayDate(selectedDate)}
          editable={false}
          right={
            <TextInput.Icon
              icon="chevron-down"
              onPress={() => setModalVisible(true)}
            />
          }
          error={err || false}
          onPressIn={() => setModalVisible(true)}
        />
      </TouchableOpacity>
      <Portal>
        <Dialog
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            {getLabel(label)}
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            {/* <CalendarLegend /> */}
            {false ? (
              <ActivityIndicator size="large" color="#1976D2" />
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <IconButton
                  icon="refresh"
                  size={24}
                  onPress={() => {
                    // fetchMonthData(currentMonth)
                  }}
                />
              </View>
            ) : (
              <>
                {/* <Text> {JSON.stringify(minDate)}</Text>
                <Text> {JSON.stringify(maxDate)}</Text> */}
                <Calendar
                  markingType={"custom"}
                  markedDates={markedDates}
                  onDayPress={handleDayPress}
                  current={currentMonth}
                  onMonthChange={(month) => {
                    setCurrentMonth(
                      `${month.year}-${String(month.month).padStart(2, "0")}-01`
                    );
                  }}
                  theme={{
                    todayTextColor: "#1976D2",
                    selectedDayBackgroundColor: "#1976D2",
                    calendarBackground: "#ffffff",
                    textSectionTitleColor: "#b6c1cd",
                    selectedDayTextColor: "#ffffff",
                    monthTextColor: "#1976D2",
                    indicatorColor: "#1976D2",
                    arrowColor: "#1976D2",
                    dayTextColor: "#2d4150",
                    textDisabledColor: "#d9e1e8",
                    disabledArrowColor: "#d9e1e8",
                    dotColor: "#1976D2",
                    selectedDotColor: "#ffffff",
                  }}
                  disableAllTouchEventsForDisabledDays={true}
                  disableArrowLeft={false}
                  disableArrowRight={false}
                  enableSwipeMonths={true}
                  minDate={minDate}
                  maxDate={maxDate}
                  // onPressArrowLeft={(subtractMonth) => {
                  //   const previousMonth = new Date(viewedDate);
                  //   previousMonth.setMonth(previousMonth.getMonth() - 1);

                  //   console.log(previousMonth.getMonth(), minDate.getMonth());

                  //   if (previousMonth >= minDate) {
                  //     console.log("subtractMont0h", previousMonth <= minDate);
                  //     subtractMonth();
                  //   }
                  // }}
                />
              </>
            )}
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
  dialogTitle: {
    textAlign: "center",
    paddingVertical: 16,
  },
  dialogContent: {
    paddingHorizontal: 0,
  },
  errorContainer: {
    padding: 16,
    alignItems: "center",
  },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendLabel: {
    fontSize: 13,
    marginRight: 2,
  },
});

export default CustomNormalCalendar;
