import React, { useEffect, useState } from "react";
import { Calendar } from "react-native-calendars";
import dayjs from "dayjs";
import { ActivityIndicator, View, StyleSheet, Alert } from "react-native";
import {
  TextInput,
  Portal,
  Dialog,
  IconButton,
  Text,
} from "react-native-paper";
import { getTripsAllocatedRange } from "../service/supervisor_service";
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

const CustomCalendar = ({ onDateSelect, selectedDate, mode, err, label }) => {
  const { contentsLabel } = useSelector((state) => state.auth);
  const getLabel = (key) => contentsLabel?.[key] || key;
  const [markedDates, setMarkedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);
  const [disabledDates, setDisabledDates] = useState({});
  const [dates, setDates] = useState();
  const [viewedDate, setViewedDate] = useState(new Date());

  const formatDisplayDate = (date) => {
    if (!date) return "YYYY-MM-DD";
    return dayjs(date).format("YYYY-MM-DD");
  };

  const fetchMonthData = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const { start, end } = getMonthRange(date);
      const apiStart = dayjs(start).format("YYYY-MM-D");
      const apiEnd = dayjs(end).format("YYYY-MM-D");
      console.log("Fetching data for range:", apiStart, "to", apiEnd);

      const res = await getTripsAllocatedRange(apiStart, apiEnd);
      console.log("API Response:", res.data);

      if (!res.data) {
        throw new Error("No data received from API");
      }

      const data = res.data;
      const marks = {};
      const disabled = {};

      setDates(data);

      Object.entries(data).forEach(([date, info]) => {
        let bgColor = "#FFF";
        if (info.is_holiday) bgColor = "#FFC107"; // gold
        else if (info.is_weekend) bgColor = "#BBDEFB"; // blue
        else if (info.trips === 0) bgColor = "#F8BBD0"; // pink
        else if (info.trips === 1) bgColor = "#FFAB91"; // orange
        else if (info.trips === 2) bgColor = "#FFF59D"; // yellow
        else if (info.trips >= 3) bgColor = "#C8E6C9"; // green

        marks[date] = {
          customStyles: {
            container: { backgroundColor: bgColor },
            text: { color: "#222" },
          },
          disabled: info.is_holiday || info.is_weekend || info.trips === 0,
        };

        // Disable dates that are holidays, weekends, or have 0 trips
        if (info.is_holiday || info.is_weekend || info.trips === 0) {
          disabled[date] = true;
        }
      });

      if (selectedDate) {
        marks[selectedDate] = {
          ...marks[selectedDate],
          selected: true,
          selectedColor: "#1976D2",
        };
      }

      setMarkedDates(marks);
      setDisabledDates(disabled);
    } catch (e) {
      console.error("Error fetching month data:", e);
      setError(e.message || getLabel("Failed to fetch calendar data"));
      setMarkedDates({});
      setDisabledDates({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modalVisible) {
      fetchMonthData(currentMonth);
    }
  }, [currentMonth, selectedDate, modalVisible]);

  const handleDayPress = (day) => {
    console.log(day);
    // Check if the selected date is disabled
    if (disabledDates[day.dateString]) {
      return; // Don't allow selection of disabled dates
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight
    if (new Date(day.dateString) >= today) {
      console.log(new Date(day.dateString) >= new Date());
      onDateSelect(day.dateString);
      setModalVisible(false);
    } else {
      Alert.alert("Message", "Previous Date Cannot be Selected.");
    }
  };

  const minDate = new Date();

  return (
    <View>
      <TextInput
        label={label}
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
      <Portal>
        <Dialog
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            {getLabel("Select a Date")}
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <CalendarLegend />
            {loading ? (
              <ActivityIndicator size="large" color="#1976D2" />
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <IconButton
                  icon="refresh"
                  size={24}
                  onPress={() => fetchMonthData(currentMonth)}
                />
              </View>
            ) : (
              <>
                {/* <Text> {JSON.stringify(dates)}</Text> */}
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

export default CustomCalendar;
