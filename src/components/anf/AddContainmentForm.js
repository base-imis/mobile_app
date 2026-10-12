import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import DatePicker from "react-native-date-picker";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

import {
  getContainmentFormFields,
  addContainmentData,
} from "../../service/building_service";
import colors from "../../core/theme/colors";
import LoadingView from "../common/LoadingView";

const AddContainmentForm = ({
  buildingBin,
  applicationId,
  lat,
  lng,
  onSuccess,
  onCancel,
}) => {
  const theme = useTheme();
  const { contentsLabel } = useSelector((state) => state.auth);
  const getLabel = (key) => contentsLabel?.[key] || key;

  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  useEffect(() => {
    fetchFormFields();
  }, []);

  const fetchFormFields = async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const response = await getContainmentFormFields();
      const { success, data } = response.data;
      if (success && data?.form_fields) {
        const allFields = data.form_fields.flatMap(
          (group) => group.fields || []
        );
        setFields(allFields);

        // Set default values
        const defaults = {};
        allFields.forEach((field) => {
          defaults[field.name] = field.value ?? "";
        });
        setValues(defaults);
      } else {
        const reason = response.data?.message || response.data?.error || "API returned no form fields";
        setLoadError(reason);
      }
    } catch (err) {
      const reason =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Network error — please check your connection";
      console.log("Error fetching containment form fields:", err?.response?.data || err);
      setLoadError(reason);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    fields.forEach((field) => {
      // Skip validation for fields we inject manually
      if (['id', 'application_id', 'lat', 'lng'].includes(field.name.toLowerCase())) {
        return;
      }

      if (field.required && !values[field.name]) {
        newErrors[field.name] = `${getLabel(field.label)} ${getLabel("is required")}`;
      }
      // Emptying volume is capped by containment size, so a 0 m³ containment
      // would block every emptying trip for the linked application.
      if (
        (field.name === "size" || field.name === "containment_size") &&
        values[field.name] !== undefined &&
        values[field.name] !== "" &&
        !(parseFloat(values[field.name]) > 0)
      ) {
        newErrors[field.name] = getLabel("Containment size must be greater than 0");
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = { ...values };

      // Inject application ID for the linking process
      if (applicationId) {
        payload.id = String(applicationId);
      }

      // Inject lat/lng from props
      if (lat && lng) {
        payload.lat = String(lat);
        payload.lng = String(lng);
      }

      const response = await addContainmentData(buildingBin, payload);
      const { success, status, data, message } = response.data;

      if (success || status === true) {
        // Let the parent handler (ANFLocateBuildingScreen) show the success
        // alert and handle navigation — no alert here to avoid double-dialog crash.
        onSuccess?.(data);
      } else {
        Alert.alert(
          getLabel("Error"),
          response.data?.message || response.data?.error || getLabel("Failed to save containment")
        );
      }
    } catch (err) {
      console.log("Error saving containment:", err?.response?.data);
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors) {
        const mapped = {};
        Object.entries(serverErrors).forEach(([key, msgs]) => {
          mapped[key] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors(mapped);
        const messages = Object.values(serverErrors).flat().join("\n");
        Alert.alert(getLabel("Validation Error"), messages);
      } else {
        const errorMsg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          getLabel("Failed to save containment");
        Alert.alert(getLabel("Error"), errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updateValue = (name, val) => {
    setValues((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const renderField = (field, index) => {
    const { name, label, input_type, options, disabled, placeholder } = field;

    // Hide fields that we inject manually (Application ID, lat, lng)
    if (
      ['id', 'application_id', 'lat', 'lng'].includes(name.toLowerCase()) ||
      label.toLowerCase().includes('application id')
    ) {
      return null;
    }

    const fieldLabel = `${getLabel(label)}${field.required ? " *" : ""}`;

    if (input_type === "select") {
      return (
        <View key={name || index}>
          <View
            style={[
              styles.picker,
              {
                borderColor: errors[name] ? theme.colors.error : null,
                borderBottomWidth: errors[name] ? 2 : 0.5,
              },
            ]}
          >
            <Picker
              style={styles.pickerTextStyle}
              selectedValue={values[name]}
              onValueChange={(val) => updateValue(name, val)}
              enabled={!disabled}
            >
              <Picker.Item
                label={placeholder || `--- ${getLabel("Select")} ${getLabel(label)} ---`}
                value=""
                color="#767A7D"
              />
              {(options || []).map((opt) => (
                <Picker.Item
                  key={opt.value}
                  label={opt.label}
                  value={opt.value}
                />
              ))}
            </Picker>
          </View>
          {errors[name] && (
            <HelperText type="error">{errors[name]}</HelperText>
          )}
        </View>
      );
    }

    if (input_type === "number") {
      return (
        <View key={name || index}>
          <TextInput
            label={fieldLabel}
            value={String(values[name] ?? "")}
            onChangeText={(val) => updateValue(name, val)}
            keyboardType="numeric"
            error={!!errors[name]}
            placeholder={placeholder}
            disabled={disabled}
          />
          {errors[name] && (
            <HelperText type="error">{errors[name]}</HelperText>
          )}
        </View>
      );
    }

    if (input_type === "date") {
      return (
        <View key={name || index}>
          <TouchableDate
            label={fieldLabel}
            value={values[name]}
            error={errors[name]}
            onPress={() => setDateOpen(name)}
            placeholder={placeholder}
          />
          <DatePicker
            modal
            open={dateOpen === name}
            date={values[name] ? new Date(values[name]) : new Date()}
            mode="date"
            maximumDate={new Date()}
            onConfirm={(date) => {
              setDateOpen(false);
              updateValue(name, dayjs(date).format("YYYY-MM-DD"));
            }}
            onCancel={() => setDateOpen(false)}
          />
          {errors[name] && (
            <HelperText type="error">{errors[name]}</HelperText>
          )}
        </View>
      );
    }

    return (
      <View key={name || index}>
        <TextInput
          label={fieldLabel}
          value={String(values[name] ?? "")}
          onChangeText={(val) => updateValue(name, val)}
          error={!!errors[name]}
          placeholder={placeholder}
          disabled={disabled}
        />
        {errors[name] && (
          <HelperText type="error">{errors[name]}</HelperText>
        )}
      </View>
    );
  };

  if (loading) return <LoadingView />;

  if (loadError) {
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#C0392B", marginBottom: 8, textAlign: "center" }}>
          {getLabel("Failed to load containment form")}
        </Text>
        <Text style={{ fontSize: 13, color: "#555", textAlign: "center", marginBottom: 16 }}>{loadError}</Text>
        <Button mode="contained" onPress={fetchFormFields}>{getLabel("Retry")}</Button>
        {onCancel && <Button mode="outlined" onPress={onCancel} style={{ marginTop: 8 }}>{getLabel("Cancel")}</Button>}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.contentContainer}
    >
      {/* Explicitly show Application ID if present */}
      {applicationId && (
        <View style={{ marginBottom: 12 }}>
          <TextInput
            label={`${getLabel("Application ID")} *`}
            value={String(applicationId)}
            editable={false}
            disabled={true}
            style={{ backgroundColor: "#F0F0F0" }}
          />
        </View>
      )}

      <Text variant="titleMedium" style={styles.sectionTitle}>
        {getLabel("Containment Information")}
      </Text>

      <View style={styles.fieldContainer}>
        {fields.map(renderField)}
      </View>

      <View style={styles.buttonRow}>
        {onCancel && (
          <Button
            mode="outlined"
            onPress={onCancel}
            style={styles.btn}
            disabled={submitting}
          >
            {getLabel("Cancel")}
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.btn}
          loading={submitting}
          disabled={submitting}
        >
          {getLabel("Save")}
        </Button>
      </View>
    </ScrollView>
  );
};

// Simple pressable date display
const TouchableDate = ({ label, value, error, onPress, placeholder }) => {
  const { Pressable } = require("react-native");
  return (
    <Pressable onPress={onPress}>
      <TextInput
        label={label}
        value={value ? dayjs(value).format("DD MMMM YYYY") : ""}
        editable={false}
        error={!!error}
        placeholder={placeholder}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 4,
  },
  fieldContainer: {
    gap: 10,
  },
  picker: {
    backgroundColor: colors.fieldsColor,
    borderBottomColor: colors.darkGrey,
    borderBottomWidth: 0.6,
  },
  pickerTextStyle: {
    color: "#1C1B1F",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 20,
    justifyContent: "center",
  },
  btn: {
    minWidth: 130,
  },
});

export default AddContainmentForm;
