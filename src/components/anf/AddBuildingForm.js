import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Divider,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import DatePicker from "react-native-date-picker";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

import {
  getBuildingFormFields,
  saveBuildingData,
} from "../../service/building_service";
import colors from "../../core/theme/colors";
import LoadingView from "../common/LoadingView";
import SearchableDropdown from "./SearchableDropdown";
import LabeledPicker from "./LabeledPicker";
import AddContainmentForm from "./AddContainmentForm";

const LARGE_OPTIONS_THRESHOLD = 50;

const AddBuildingForm = ({
  onSuccess,
  onCancel,
  includeContainment = true,
  coordinate,
  lat,
  lng,
  applicationId,
  submitTitle,
}) => {
  const theme = useTheme();
  const { contentsLabel } = useSelector((state) => state.auth);
  const getLabel = (key) => contentsLabel?.[key] || key;

  const [formGroups, setFormGroups] = useState([]);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dateFieldOpen, setDateFieldOpen] = useState(null);
  const [step, setStep] = useState("building"); // 'building' | 'containment'
  const [savedBuildingBin, setSavedBuildingBin] = useState(null);

  useEffect(() => {
    fetchFormFields();
  }, []);

  const fetchFormFields = async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const response = await getBuildingFormFields();
      const { success, data } = response.data;
      if (success && data?.form_fields) {
        // NOTE: The building form fields API already includes a
        // "Containment Information" group when includeContainment is relevant.
        // No need to separately fetch/merge containment form fields.
        const mergedFormGroups = [...data.form_fields];

        setFormGroups(mergedFormGroups);

        // Build default values
        const defaults = {};
        mergedFormGroups.forEach((group) => {
          (group.fields || []).forEach((field) => {
            if (field.value !== null && field.value !== undefined) {
              defaults[field.name] = field.value;
            } else {
              defaults[field.name] = "";
            }
          });
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
      console.log("Error fetching building form fields:", err?.response?.data || err);
      setLoadError(reason);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    formGroups.forEach((group) => {
      (group.fields || []).forEach((field) => {
        // Skip validation for fields we inject manually
        if (['id', 'application_id', 'lat', 'lng'].includes(field.name.toLowerCase())) {
          return;
        }

        if (field.required && !field.disabled && !values[field.name]) {
          newErrors[field.name] = `${getLabel(field.label)} ${getLabel("is required")}`;
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitBuilding = async () => {
    if (!validate()) {
      Alert.alert(
        getLabel("Validation Error"),
        getLabel("Please fill all required fields.")
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {};
      formGroups.forEach((group) => {
        (group.fields || []).forEach((field) => {
          if (values[field.name] !== undefined && values[field.name] !== "") {
            payload[field.name] = values[field.name];
          }
        });
      });

      // Inject lat/lng from tapped coordinate (API validation requires string)
      if (coordinate) {
        payload.lat = String(coordinate.latitude);
        payload.lng = String(coordinate.longitude);
      } else if (lat && lng) {
        payload.lat = String(lat);
        payload.lng = String(lng);
      }

      // Inject application ID for the linking process
      if (applicationId) {
        payload.id = String(applicationId);
      }

      const response = await saveBuildingData(payload);
      const { success, status, data, message } = response.data;

      if (success || status === true) {
        // Let the parent handler (ANFLocateBuildingScreen) show the success
        // alert and handle navigation — no alert here to avoid double-dialog crash.
        onSuccess?.(data);
      } else {
        Alert.alert(getLabel("Error"), message || "Failed to save building");
      }
    } catch (err) {
      console.log("Error saving building:", err?.response?.data);
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
          err?.response?.data?.message || "Failed to save building";
        Alert.alert(getLabel("Error"), errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleContainmentSuccess = (containmentData) => {
    onSuccess?.({
      bin: savedBuildingBin,
      building_id: savedBuildingBin,
      containment_id: containmentData?.id || containmentData?.containment_id,
      ...containmentData,
    });
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
    const {
      name,
      label,
      input_type,
      options,
      disabled,
      placeholder,
      required,
    } = field;

    // Reject rendering lat and lng manually
    if (
      ['lat', 'lng', 'latitude', 'longitude', 'id', 'application_id'].includes(name.toLowerCase()) ||
      label.toLowerCase().includes('application id')
    ) {
      return null;
    }

    const fieldLabel = `${getLabel(label)}${required ? " *" : ""}`;

    if (input_type === "select") {
      // Use searchable dropdown for large option lists (road_code etc.)
      if (options && options.length > LARGE_OPTIONS_THRESHOLD) {
        return (
          <View key={name || index}>
            <SearchableDropdown
              label={fieldLabel}
              placeholder={placeholder}
              options={options}
              value={values[name]}
              onSelect={(val) => updateValue(name, val)}
              error={errors[name]}
              disabled={disabled}
            />
            {errors[name] && (
              <HelperText type="error">{errors[name]}</HelperText>
            )}
          </View>
        );
      }

      return (
        <View key={name || index}>
          <LabeledPicker
            label={fieldLabel}
            placeholder={placeholder || `--- ${getLabel("Select")} ${getLabel(label)} ---`}
            options={options || []}
            value={values[name]}
            onChange={(val) => updateValue(name, val)}
            disabled={disabled}
            error={!!errors[name]}
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
          <Pressable onPress={() => !disabled && setDateFieldOpen(name)}>
            <TextInput
              label={fieldLabel}
              value={
                values[name]
                  ? dayjs(values[name]).format("DD MMMM YYYY")
                  : ""
              }
              editable={false}
              error={!!errors[name]}
              placeholder={placeholder}
            />
          </Pressable>
          <DatePicker
            modal
            open={dateFieldOpen === name}
            date={values[name] ? new Date(values[name]) : new Date()}
            mode="date"
            maximumDate={new Date()}
            onConfirm={(date) => {
              setDateFieldOpen(null);
              updateValue(name, dayjs(date).format("YYYY-MM-DD"));
            }}
            onCancel={() => setDateFieldOpen(null)}
          />
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

    // text input (default)
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

  // Show error with retry button instead of blank form
  if (loadError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>{getLabel("Failed to load form")}</Text>
        <Text style={styles.errorDetail}>{loadError}</Text>
        <Button mode="contained" onPress={fetchFormFields} style={{ marginTop: 16 }}>
          {getLabel("Retry")}
        </Button>
        {onCancel && (
          <Button mode="outlined" onPress={onCancel} style={{ marginTop: 8 }}>
            {getLabel("Cancel")}
          </Button>
        )}
      </View>
    );
  }

  // Step 2: Containment form after building saved
  if (step === "containment") {
    return (
      <AddContainmentForm
        buildingBin={savedBuildingBin}
        applicationId={applicationId}
        onSuccess={handleContainmentSuccess}
        onCancel={() => {
          // Allow skipping containment if user wants
          onSuccess?.({ bin: savedBuildingBin, building_id: savedBuildingBin });
        }}
      />
    );
  }

  // Step 1: Building form
  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.contentContainer}
    >
      {/* Explicitly show Application ID if present */}
      {applicationId && (
        <View style={{ marginBottom: 4 }}>
          <TextInput
            label={`${getLabel("Application ID")} *`}
            value={String(applicationId)}
            editable={false}
            disabled={true}
            style={{ backgroundColor: "#F0F0F0" }}
          />
        </View>
      )}

      {formGroups.map((group, gIdx) => (
        <View key={`${gIdx}_${group.group_key || group.group || 'group'}`} style={styles.groupContainer}>
          <Text variant="titleMedium" style={styles.groupTitle}>
            {getLabel(group.group)}
          </Text>
          <Divider style={styles.divider} />
          <View style={styles.fieldContainer}>
            {(group.fields || []).map(renderField)}
          </View>
        </View>
      ))}

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
          onPress={handleSubmitBuilding}
          style={styles.btn}
          loading={submitting}
          disabled={submitting}
        >
          {submitTitle || getLabel("Save")}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 12,
    paddingBottom: 40,
  },
  groupContainer: {
    marginBottom: 16,
  },
  groupTitle: {
    fontWeight: "bold",
    marginBottom: 4,
    marginTop: 8,
  },
  divider: {
    marginBottom: 12,
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
    justifyContent: "flex-end",
  },
  btn: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#C0392B",
    marginBottom: 8,
    textAlign: "center",
  },
  errorDetail: {
    fontSize: 13,
    color: "#555",
    textAlign: "center",
  },
});

export default AddBuildingForm;
