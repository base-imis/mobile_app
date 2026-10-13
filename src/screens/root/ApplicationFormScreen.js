import dayjs from "dayjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Caption,
  TextInput,
  Button,
  Checkbox,
  ActivityIndicator,
  HelperText,
  Portal,
  Dialog,
  Card,
  Icon,
  IconButton,
  useTheme,
} from "react-native-paper";

import theme, { COLORS, SPACINGS } from "../../core/theme";
import {
  assessmentSurveyFields,
  buildingSurveyFields,
  emptyingService,
  emptyingServiceFields,
  saveAssessmentServiceAPI,
  serviceProviderAPI,
  sludgeServiceFields,
  vacutugTypesAPI,
} from "../../service/supervisor_service";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useDispatch, useSelector } from "react-redux";
import { Header } from "../../components/headers";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { URLS } from "../../core/constants/urls";
import axios from "axios";
import { BASE_URL_ENV } from "../../constants/config";
import { isAnfPending as isAnfPendingItem } from "../../utils/applicationState";
import { ROUTES } from "../../core/constants/routes";
import colors, { lightTheme } from "../../core/theme/colors";
import CustomNormalCalendar from "../../components/CustomNormalCalendar";
import { RefreshControl } from "react-native-gesture-handler";
import DatePicker from "react-native-date-picker";
import { getValue } from "../../helpers/localstorage";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import LinearGradient from "react-native-linear-gradient";
import { TimerPickerModal } from "react-native-timer-picker";
import { logout } from "../../axios";

// Picker pre-check, matching the server's max:5120 (KB) for emptying images.
// The per-field validator enforces the exact limit from the form metadata.
const MAX_IMAGE_BYTES = 5120 * 1024;

export default function ApplicationFormScreen({ navigation, route }) {
  const theme = useTheme();
  const { contentsLabel } = useSelector((state) => state.auth);
  const getLabel = (key) => contentsLabel?.[key] || key;
  const dispatch = useDispatch();
  // const [serviceProvider, setServiceProvider] = useState([]);
  // const [vacutugTypes, setVacutugTypes] = useState([]);
  const [file, setFile] = useState({});
  const [processingImage, setProcessingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [fields, setFields] = useState([]);
  const [imageDialog, setImageDialog] = useState({});
  const [selected, setSelected] = useState({});

  const { item, title, apiPath, type } = route.params;

  // Track whether ANF has been resolved (updates when returning from ANF screen)
  const [anfResolved, setAnfResolved] = useState(!isAnfPendingItem(item));

  // Returning from the ANF map: the server refuses the emptying form while ANF is
  // unresolved, so reload it now that the application is linked.
  useEffect(() => {
    if (route.params?.refreshAnf) {
      setAnfResolved(true);
      loadData();
    }
  }, [route.params?.refreshAnf]);

  // Determine if the Locate Building icon should be shown
  const isAnfPending = type === "emptying" && !anfResolved;

  // Helper: Build a translated "required" validation message.
  // Tries the API-format key first ("The {label} is required."), then falls back.
  const getRequiredMessage = (label) => {
    const translatedLabel = getLabel(label) || label;
    // Try API-format key: "The {label} is required."
    const apiKey = `The ${label} is required.`;
    if (contentsLabel?.[apiKey]) {
      return contentsLabel[apiKey];
    }
    // Case-insensitive fallback: match any key regardless of casing
    if (contentsLabel) {
      const lowerKey = apiKey.toLowerCase();
      const match = Object.keys(contentsLabel).find(
        (k) => k.toLowerCase() === lowerKey
      );
      if (match) return contentsLabel[match];
    }
    // Fallback: use translated label + translated "is required"
    return `${translatedLabel} ${getLabel("is required")}`;
  };

  // console.log("typessssss", type);

  const [schema, setSchema] = useState(Yup.object().shape({}));

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    setError,
    setErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {},
  });

  useEffect(() => {
    if (type == "emptying") {
      getEmptyingAssessmentFormFields();
    }
    if (type == "sludge") {
      getSludgeAssessmentFormFields();
    }

    return () => {
      reset();
      setFile({});
    };
  }, []);

  const buildDynamicValidations = (fields) => {
    console.log(fields);
    try {
      const validations = {};
      let sel = {};
      fields.forEach((field) => {
        // console.log("field", field.validation);
        //set values and setSelected
        let value = field?.value || null;
        if (value) {
          sel[field.name] = value;
          setValue(field.name, value);
        } else {
          setValue(field.name, "");
        }

        let validator;
        const validation =
          typeof field?.validation == "string"
            ? field?.validation?.split("|")
            : [];
        const type = field.input_type;
        const disabled = field?.disabled;
        // const required = validation[0] == "required"; // not used

        //required with logic
        const requiredWith = field?.validation?.includes("required_with");
        let requiredWithName = null;
        if (requiredWith == true) {
          const requiredWithIndex = validation.findIndex((v) =>
            v?.includes("required_with")
          );

          if (requiredWithIndex != -1) {
            const condition = validation[requiredWithIndex]?.split(":")[1];
            console.log(condition);
            requiredWithName = condition || null;
          }
        }

        //required if logic
        const requiredIf = field?.validation?.includes("required_if");
        let requiredIfName = null;
        let requiredIfValue = [];
        if (requiredIf == true) {
          const requiredIfIndex = validation.findIndex((v) =>
            v?.includes("required_if")
          );

          if (requiredIfIndex != -1) {
            const condition = validation[requiredIfIndex]?.split(":")[1];
            const c = condition?.trim()?.split(",");
            console.log(condition, "c.length", c.length, c.slice(1, c.length));
            requiredIfName = c[0] || null;
            requiredIfValue = c.length > 0 ? c.slice(1, c.length) : null;
          }
        }

        //exclude if logic
        const excludeIf = field?.validation?.includes("exclude_if");
        let excludeIfName = null;
        let excludeIfValue = [];
        if (excludeIf == true) {
          const excludeIfIndex = validation.findIndex((v) =>
            v?.includes("exclude_if")
          );

          if (excludeIfIndex != -1) {
            const condition = validation[excludeIfIndex]?.split(":")[1];
            const c = condition?.trim()?.split(",");
            console.log(condition, "c.length", c.length, c.slice(1, c.length));
            excludeIfName = c[0] || null;
            excludeIfValue = c.length > 0 ? c.slice(1, c.length) : null;
          }
        }

        //required unless logic
        const requiredUnless = field?.validation?.includes("required_unless");
        let requiredUnlessName = null;
        let requiredUnlessValue = [];
        if (requiredUnless == true) {
          const requiredUnlessIndex = validation.findIndex((v) =>
            v?.includes("required_unless")
          );

          if (requiredUnless != -1) {
            const condition = validation[requiredUnlessIndex]?.split(":")[1];
            const c = condition?.trim()?.split(",");
            console.log(condition, "c.length", c.length, c.slice(1, c.length));
            requiredUnlessName = c[0] || null;
            requiredUnlessValue = c.length > 0 ? c.slice(1, c.length) : null;
          }
        }

        //less than or equal to
        const lessThanOrEqual = field?.validation?.includes("lte");
        let lessThanOrEqualName = null;
        let lessThanOrEqualValue = [];
        if (lessThanOrEqual == true) {
          const lessThanOrEqualIndex = validation.findIndex((v) =>
            v?.includes("lte")
          );

          if (lessThanOrEqual != -1) {
            const condition = validation[lessThanOrEqualIndex]?.split(":")[1];
            const c = condition?.trim()?.split(",");
            console.log(condition, "c.length", c.length, c.slice(1, c.length));
            lessThanOrEqualName = condition;
          }
        }

        // date before or equal
        const beforeOrEqual = field?.validation?.includes("before_or_equal");
        let beforeOrEqualValue = [];
        if (beforeOrEqual == true) {
          const beforeOrEqualIndex = validation.findIndex((v) =>
            v?.includes("before_or_equal")
          );

          if (beforeOrEqualIndex != -1) {
            const condition = validation[beforeOrEqualIndex]?.split(":")[1];
            const c = condition?.trim()?.split(",");
            console.log(condition, "c.length", c.length);

            beforeOrEqualValue = c;
          }
        }

        //date after or equal
        const afterOrEqual = field?.validation?.includes("after_or_equal");
        let afterOrEqualValue = [];
        if (afterOrEqual == true) {
          const afterOrEqualIndex = validation.findIndex((v) =>
            v?.includes("after_or_equal")
          );

          if (afterOrEqualIndex != -1) {
            const condition = validation[afterOrEqualIndex]?.split(":")[1];
            const c = condition?.trim()?.split(",");
            console.log(condition, "c.length", c.length);

            afterOrEqualValue = c;
          }
        }

        //sum of other fields
        const sumOf = field?.validation?.includes("sum");
        let sumOfNames = [];
        if (sumOf == true) {
          const sumOfIndex = validation.findIndex((v) => v?.includes("sum"));
          if (sumOfIndex != -1) {
            const condition = validation[sumOfIndex]?.split(":")[1];
            const c = condition?.trim()?.split(",");
            console.log(condition, "c.length", c.length, c);
            sumOfNames = c;
          }
        }

        // time after: other time
        const timeAfter = field?.validation?.includes("after");
        let timeAfterName = null; // single field check

        if (timeAfter == true) {
          const timeAfterIndex = validation.findIndex((v) =>
            v?.includes("after")
          );

          if (timeAfterIndex != -1) {
            const condition = validation[timeAfterIndex]?.split(":")[1];
            const c = condition?.trim()?.split(",")[0] || null;
            console.log(condition, "c.length", c.length);

            timeAfterName = c;
          }
        }

        // time before: other time
        const timeBefore = field?.validation?.includes("before");
        let timeBeforeName = null; // single field check

        if (timeBefore == true) {
          const timeBeforeIndex = validation.findIndex((v) =>
            v?.includes("before")
          );

          if (timeBeforeIndex != -1) {
            const condition = validation[timeBeforeIndex]?.split(":")[1];
            const c = condition?.trim()?.split(",")[0] || null;
            console.log(condition, "c.length", c.length);

            timeBeforeName = c;
          }
        }
        const hasShowWhen = "show_when" in field;

        const validators = () => {
          //required with validation implementation
          console.log("....................ok................... ", field.name);
          if (requiredIfName && excludeIfName) {
            console.log(
              "required-with-exc-validation",
              requiredIfName,
              requiredIfValue,
              excludeIfName,
              excludeIfValue
            );

            if (requiredIfName) {
              validator = validator.test(
                "required-with-excIf-validation",
                getRequiredMessage(field.label),
                (value) => {
                  const val = getValues(requiredIfName);

                  if (requiredIfValue?.includes(val)) {
                    if (value) {
                      return true;
                    }
                    return false;
                  } else {
                    return true;
                  }
                }
              );
            }
          } else {
            if (requiredIfName) {
              console.log("requiredIfName", requiredIfName, requiredIfValue);
              console.log();
              validator = validator.test(
                "required-with-validation",
                getRequiredMessage(field.label),
                (value) => {
                  const val = getValues(requiredIfName);

                  if (requiredIfValue?.includes(val)) {
                    if (value) {
                      return true;
                    }
                    return false;
                  } else {
                    return true;
                  }
                }
              );
            } else if (excludeIfName) {
              console.log("excludeIfName", excludeIfName, excludeIfValue);
              console.log();
              validator = validator.test(
                "exclude-if-validation",
                getRequiredMessage(field.label),
                (value) => {
                  const val = getValues(excludeIfName);

                  if (excludeIfValue?.includes(val)) {
                    return true;
                  } else {
                    if (value) {
                      return true;
                    }
                    return false;
                  }
                }
              );
            } else if (requiredWithName) {
              validator = validator.test(
                "required-with-validation",
                getRequiredMessage(field.label),
                (value) => {
                  const val = getValues(requiredWithName);
                  // console.log(
                  //   "requiredWithName",
                  //   requiredWithName,
                  //   selected,
                  //   getValues(),
                  //   val
                  // );

                  if (val && val.length && !value) {
                    return false;
                  } else {
                    return true;
                  }
                }
              );
            } else if (requiredUnlessName) {
              validator = validator.test(
                "required-unless-validation",
                getRequiredMessage(field.label),
                (value) => {
                  const val = getValues(requiredUnlessName);
                  console.log(
                    "requiredUnlessName",
                    requiredUnlessName,
                    selected,
                    getValues(),
                    val
                  );

                  if (val && val.length && requiredUnlessValue?.includes(val)) {
                    return true;
                  } else {
                    if (value) {
                      return true;
                    }
                    return false;
                  }
                }
              );
            } else if (field?.required == true) {
              if (hasShowWhen) {
                const twoValueEqual = (value) => {
                  const showWhen = field?.show_when;

                  if (value) {
                    return true;
                  } else {
                    if (showWhen.operator == "=") {
                      const equal =
                        getValues(showWhen.field) ==
                        getValues(showWhen.value_field);
                      console.log(
                        "hasShowWhen",
                        value,
                        !equal,
                        showWhen.field,
                        showWhen.value_field,
                        getValues(showWhen.field),
                        getValues(showWhen.value_field)
                      );
                      return equal ? false : true;
                    } else {
                      return true;
                    }
                  }
                };
                validator = validator.test(
                  "show when two value is equal",
                  getRequiredMessage(field.label),
                  (value) => twoValueEqual(value)
                );
              } else {
                console.log(
                  "....................required................... ",
                  field.name
                );
                validator = validator.required(
                  getRequiredMessage(field.label)
                );
              }
            }
          }

          if (type == "time") {
            const timerAfterField = (value) => {
              const splitTime = value.split(":");
              const timeAfterNameValue = getValues(timeAfterName);
              const splitAfterNameValue = timeAfterNameValue.split(":");
              console.log(timeAfterNameValue, splitAfterNameValue);

              if (value.length > 0 && splitTime.length >= 2) {
                const after = new Date().setHours(
                  splitTime[0],
                  splitTime[1],
                  0,
                  0
                );
                const before = new Date().setHours(
                  splitAfterNameValue[0],
                  splitAfterNameValue[1],
                  0,
                  0
                );
                console.log("today", value, splitTime, after, before);
                if (after > before) {
                  return true;
                }
              }
              return false;
            };

            const timerBeforeField = (value) => {
              const splitTime = value.split(":");
              const timeAfterNameValue = getValues(timeAfterName);
              const splitAfterNameValue = timeAfterNameValue.split(":");
              console.log(timeAfterNameValue, splitAfterNameValue);

              if (value.length > 0 && splitTime.length >= 2) {
                const after = new Date().setHours(
                  splitTime[0],
                  splitTime[1],
                  0,
                  0
                );
                const before = new Date().setHours(
                  splitAfterNameValue[0],
                  splitAfterNameValue[1],
                  0,
                  0
                );
                console.log("today", value, splitTime, after, before);
                if (after < before) {
                  return true;
                }
              }
              return false;
            };

            if (timeAfter && timeAfterName) {
              validator = validator.test(
                "after or equal",
                `${getLabel(field.label)} ${getLabel("should be after")} ${getLabel(timeAfterName
                  .split("_")
                  .join(" "))}.`,
                (value) => timerAfterField(value)
              );
            }
            if (timeBefore && timeBeforeName) {
              validator = validator.test(
                "after or equal",
                `${getLabel(field.label)} ${getLabel("should be before")} ${getLabel(timeBeforeName
                  .split("_")
                  .join(" "))}.`,
                (value) => timerBeforeField(value)
              );
            }
          }
        };

        //Field is not disabled
        if (!disabled) {
          if (type === "text" || type === "select") {
            validator = Yup.string();

            validators(validator);
          }
          if (type === "number") {
            const minInc =
              (typeof field?.validation == "string" &&
                field?.validation?.includes("min")) ||
              false;
            const maxInc =
              (typeof field?.validation == "string" &&
                field?.validation?.includes("max")) ||
              false;
            const isInteger =
              (typeof field?.validation == "string" &&
                field?.validation?.includes("integer")) ||
              false;
            const isLessThanOrEqual =
              (typeof field?.validation == "string" &&
                field?.validation?.includes("lte")) ||
              false;

            validator = Yup.number()
              .transform((value, originalValue) =>
                String(originalValue).trim() === ""
                  ? undefined
                  : Number(originalValue)
              )
              .typeError(`${getLabel(field.label) || field.name} ${getLabel("must be a number")}`);
            //integer or number
            if (isInteger == true) {
              validator = validator.integer(
                `${getLabel(field.label) || field.name} ${getLabel("must be a integer")}`
              );
            }

            if (isLessThanOrEqual) {
              validator = validator.test(
                "less-than-or-equal-validation",
                `${
                  field.label || field.name
                } should be less than or equal to ${lessThanOrEqualName
                  .split("_")
                  .join(" ")}`,
                (value) => {
                  const val = getValues(lessThanOrEqualName);

                  if (value) {
                    if (value <= val) {
                      return true;
                    }
                    return false;
                  } else {
                    return true;
                  }
                }
              );
            }
            //required
            validators(validator);
            // if (field.required == true) {
            //   const requiredIndex = validation.findIndex((v) =>
            //     v?.includes("required")
            //   );
            //   if (validation[requiredIndex] == "required") {
            //     console.log("requiredIndex", requiredIndex, field.name);
            //     validator = validator.required(
            //       getLabel(`${field.label || field.name} is required`)
            //     );
            //   }
            // }
            //min value check
            if (minInc) {
              const minIndex = validation.findIndex((v) => v?.includes("min"));
              console.log("minIndex", minIndex, field.name);
              if (minIndex != -1) {
                const min = validation[minIndex].split(":");
                const minVal = min[1];

                validator = validator.min(
                  Number(minVal),
                  `${getLabel(field.label) || field.name} ${getLabel("must be at least")} ${minVal}`
                );
              }
            }
            //max value check
            if (maxInc) {
              const maxIndex = validation.findIndex((v) => v?.includes("max"));
              console.log("maxIndex", maxIndex);
              if (maxIndex != -1) {
                const max = validation[maxIndex].split(":");
                const maxVal = max[1];

                validator = validator.max(
                  Number(maxVal),
                  `${getLabel(field.label) || field.name} ${getLabel("must be at most")} ${maxVal}`
                );
              }
            }
          }
          if (type == "file_upload") {
            console.log("fileValidation");
            function isValidFileType(fileName, types, fileType) {
              console.log(fileName, fileType);
              return fileName && types.indexOf(fileName.split(".").pop()) > -1;
            }
            validator = Yup.mixed();
            // .required(
            //   field?.label + " Image is Required"
            // );

            // if (field.required == true) {
            //   validator = validator.test(
            //     "have-image",
            //     `${field.label || field.name} is Required`,
            //     (value) => value
            //   );
            // }

            validators(validator);

            //check file types
            const fileType =
              (typeof field.validation == "string" &&
                field.validation?.includes("mimes")) ||
              false;
            let types = [];
            if (fileType) {
              const typeIndex = validation.findIndex((v) =>
                v?.includes("mimes")
              );
              console.log("mimes", typeIndex);
              if (typeIndex != -1) {
                const condition = validation[typeIndex]?.split(":")[1];
                types = condition?.trim()?.split(",");

                validator = validator.test(
                  "is-valid-type",
                  "Not a valid image type",
                  (value) => {
                    if (value && value.fileName) {
                      return isValidFileType(
                        value.fileName.toLowerCase(),
                        types,
                        "image"
                      );
                    } else {
                      return true;
                    }
                  }
                );
              }
            }

            //max image size value check
            const maxInc =
              (typeof field.validation == "string" &&
                field?.validation?.includes("max")) ||
              false;
            let max = "";
            let maxVal = "";
            if (maxInc) {
              const maxIndex = validation.findIndex((v) => v?.includes("max"));
              if (maxIndex != -1) {
                max = validation[maxIndex].split(":");
                // Laravel's max rule for files is in kilobytes; fileSize is in bytes.
                // (Multiplying by 100 made max:5120 a ~500 KB limit.)
                const maxKb = Number(max[1]);
                const maxBytes = maxKb * 1024;

                validator = validator.test(
                  "is-file-valid-size",
                  `Max allowed size is ${maxKb}KB`,
                  (value) => {
                    if (value && value.fileName && maxKb) {
                      return value.fileSize <= maxBytes;
                    } else {
                      return true;
                    }
                  }
                );
              }
            }
          } else if (type == "date") {
            const isAfterOrToday = (value) => {
              const splitDate = value.split("/");
              let formattedDate = "";
              if (splitDate.length == 3) {
                formattedDate = `${splitDate[2]}-${splitDate[0]}-${splitDate[1]}`;
              }

              console.log(value, typeof value, new Date(formattedDate));
              const today = new Date().setHours(0, 0, 0, 0);
              // Normalize to midnight
              const newDate = new Date(value);
              console.log("newDate", newDate, "today", today);
              return newDate > today;
            };

            const isBeforeOrEqual = (value) => {
              const splitDate = value.split("/");
              let formattedDate = "";
              if (splitDate.length == 3) {
                formattedDate = `${splitDate[2]}-${splitDate[0]}-${splitDate[1]}`;
              }

              console.log(value, typeof value, new Date(formattedDate));
              let today = new Date().setHours(23, 59, 59, 999); //Normalize to midnight
              const newDate = new Date(value);
              console.log(newDate, today);
              return newDate <= today;
            };

            validator = Yup.string();

            validators(validator);

            if (beforeOrEqual) {
              if (beforeOrEqualValue?.includes("today")) {
                validator = validator.test(
                  "before-equal-today-date",
                  "Future date is not valid",
                  (value) => isBeforeOrEqual(value)
                );
              }
            }

            if (afterOrEqual) {
              if (afterOrEqualValue?.includes("today")) {
                validator = validator.test(
                  "After-equal-today-date",
                  "Past date is not valid",
                  (value) => isAfterOrToday(value)
                );
              }
            }
          }

          if (type == "time") {
            validator = Yup.string();
            validators(validator);
          }
          validations[field.name] = validator;
        }
      });
      setSelected(sel);
      // console.log(validations);

      return Yup.object().shape(validations);
    } catch (e) {
      console.log("build validation error", e);
    }
  };

  const setInitialFieldValues = (fields, item) => {
    let prefilled = {};
    fields.forEach((field) => {
      if (field.prefilled) {
        setValue(field.name, field.value);
        prefilled = { ...prefilled, [field.name]: field.value };
        // if ("options" in field) {
        // }
      } else {
        setValue(field.name, "");
      }
      setSelected(prefilled);
    });
  };

  const getSludgeAssessmentFormFields = () => {
    setDataLoading(true);
    sludgeServiceFields(item?.application_id ?? item?.id)
      .then((res) => {
        // console.log("buildingFields", res?.data);

        setFields(res?.data);
        // setInitialFieldValues(res?.data || [], item);
        setSchema(buildDynamicValidations(res?.data || []));
      })
      .catch((err) => {
        console.log("errr", err);

        if (err?.response?.status === 500) {
          Alert.alert(
            "500",
            getLabel("Something is wrong, please try again or at a later time.")
          );
        }
      })
      .finally(() => {
        setDataLoading(false);
      });
  };

  const getEmptyingAssessmentFormFields = () => {
    setDataLoading(true);
    emptyingServiceFields(item?.id)
      .then((res) => {
        // console.log("buildingFields", res?.data);

        setFields(res?.data?.form_fields);
        // setInitialFieldValues(res?.data || [], item);
        setSchema(buildDynamicValidations(res?.data?.form_fields || []));
      })
      .catch((err) => {
        console.log("errr", err);

        if (err?.response?.status === 500) {
          Alert.alert(
            "500",
            getLabel("Something is wrong, please try again or at a later time.")
          );
        }
      })
      .finally(() => {
        setDataLoading(false);
      });
  };

  const option = {
    mediaType: "photo",
    cameraType: "back",
    quality: 0.5,
    maxWidth: 1600,
    maxHeight: 1600,
    allowedTypes: ["image/jpg"],
    // includeBase64: true,
  };

  useEffect(() => {
    navigation.setOptions({
      title: `Containment Assessmenst #${item.application_id}`,
    });

    // loadData();
  }, []);

  // const getServiceProvider = () => {
  //   serviceProviderAPI()
  //     .then((res) => {
  //       const { data, errors, success } = res.data;
  //       if (success) {
  //         setServiceProvider(data.serviceproviders);
  //       } else {
  //         console.log(errors);
  //       }
  //     })
  //     .catch((e) => {})
  //     .finally(() => setDataLoading(false));
  // };

  // const getVacutugTypes = () => {
  //   vacutugTypesAPI()
  //     .then((res) => {
  //       const { data, error, success } = res.data;
  //       console.log(res.data);

  //       if (success) {
  //         setVacutugTypes(data.vacutugtypes);
  //       } else {
  //         console.log(error);
  //       }
  //     })
  //     .catch((e) => {})
  //     .finally(() => {});
  // };

  const loadData = () => {
    if (type == "emptying") {
      getEmptyingAssessmentFormFields();
    }
    if (type == "sludge") {
      getSludgeAssessmentFormFields();
    }
    // getServiceProvider();
    // getVacutugTypes();
  };

  const openCamera = async (name) => {
    try {
      launchCamera(option, async (res) => {
        // setProcessingImage(true);
        if (res.didCancel) {
          setImageDialog({ ...imageDialog, [name]: false });
          return;
        }

        if (res.assets && res.assets[0].fileSize > MAX_IMAGE_BYTES) {
          Alert.alert(
            getLabel("File size error"),
            getLabel(
              "The image size exceeds 5 MB, please select lower size image."
            )
          );
          return;
        }
        if (res.assets && res.assets[0].type == "image/png") {
          Alert.alert(
            getLabel("File type error"),
            getLabel(
              "Image should be in JPEG format, please select another image."
            )
          );
          return;
        } else {
          const img = res.assets[0] || null;

          const asset = img || null;
          setFile({ ...file, [name]: img.uri });
          const image = {
            uri: img?.uri,
            name: img?.fileName ?? "receipt_img.jpeg",
            type: img?.type ?? "image/jpeg",
            fileName: img?.fileName,
            fileSize: img.fileSize,
          };
          setValue(name, image);

          // setSelected((prev) => ({
          //   ...prev,
          //   [name]: image,
          // }));
          setImageDialog({ ...imageDialog, [name]: false });
        }
        // setProcessingImage(false);
      });
    } catch (e) {
      console.log("Camera error", e);
      // setProcessingImage(false);
    } finally {
      // setProcessingImage(false);
    }
  };

  const openGallery = async (name) => {
    try {
      launchImageLibrary({ ...option, quality: 0.2 }, async (res) => {
        // setProcessingImage(true);
        if (res.didCancel) {
          setImageDialog({ ...imageDialog, [name]: false });
          return;
        }

        if (res.assets && res.assets[0].fileSize > MAX_IMAGE_BYTES) {
          Alert.alert(
            getLabel("File size error"),
            getLabel(
              "The image size exceeds 5 MB, please select lower size image."
            )
          );
          return;
        }
        if (res.assets && res.assets[0].type == "image/png") {
          Alert.alert(
            getLabel("File type error"),
            getLabel(
              "Image should be in JPEG format, please select another image."
            )
          );
          return;
        } else {
          const img = res.assets[0] || null;

          const asset = img || null;
          setFile({ ...file, [name]: img.uri });
          const image = {
            uri: img?.uri,
            name: img?.fileName ?? "receipt_img.jpeg",
            type: img?.type ?? "image/jpeg",
            fileName: img?.fileName,
            fileSize: img.fileSize,
          };
          setValue(name, image);

          // setSelected((prev) => ({
          //   ...prev,
          //   [name]: image,
          // }));
          setImageDialog({ ...imageDialog, [name]: false });
        }

        // setProcessingImage(false);
      });
    } catch (e) {
      console.log("gallery error", e);
      // setProcessingImage(false);
    } finally {
      // setProcessingImage(false);
    }
  };

  const submit = async (values) => {
    try {

      setLoading(true);
      let formdata = new FormData();
      Object.keys(values).map((key) => {
        formdata.append(key, values[key]);
      });
      const token = await AsyncStorage.getItem("token");
      const postUrl = `${BASE_URL_ENV}/api/${apiPath.post}`;

      const headers =
        type == "emptying"
          ? {
              // Accept: "application/json",
              "Content-Type": "multipart/form-data",
              // "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          : {
              Accept: "application/json",
              // "Content-Type": "multipart/form-data",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            };
      const res = await axios.post(
        postUrl,
        type == "emptying" ? formdata : values,
        {
          headers: headers,
        }
      );
      if (res?.status === 200 || res?.status === 201) {
        const message = res?.data?.message;
        Alert.alert(getLabel("Success"), message, [
          {
            text: getLabel("OK"),
          },
        ]);
        navigation.goBack();
      }
    } catch (error) {
      const message = error?.response?.data?.message;
      const errors = error?.response?.data?.errors;
      if (message) {
        // Map over errors if they exist
        if (errors) {
          Object.keys(errors).length > 0 &&
            Object.keys(errors).map((key) => {
              setError(key, {
                type: "manual",
                message: errors[key].join("\n"),
              });
            });

          Alert.alert(getLabel("Error"), `${message}`, [
            {
              text: getLabel("OK"),
            },
          ]); // Combine main message and error details
        } else {
          if (
            error?.response?.status === 401 &&
            (error?.response?.data?.message == "Unauthenticated." ||
              error?.response?.data?.error ==
                "Unauthenticated. Invalid or missing token.")
          ) {
            console.log("Token Expired!!");
            Alert.alert(
              "Session expired",
              "Session expired, please log in again"
            );
            logout();
          } else {
            Alert.alert(getLabel("Error"), message, [
              {
                text: getLabel("OK"),
              },
            ]);
          } // Show main message only if no specific errors
        }
      } else {
        Alert.alert(getLabel("Error"), "Something went wrong.", [
          {
            text: getLabel("Ok"),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };


  const resetFieldsOnChange = (field, value) => {
    try {
      let changes = {};
      fields.map((f) => {
        const validation =
          typeof f.validation == "string" ? f.validation.split("|") : [];
        const type = f.input_type;
        const disabled = f?.disabled;
        const required = validation[0] == "required";
        //required if logic
        const requiredIf = f.validation?.includes("required_if");
        let requiredIfName = null;
        let requiredIfValue = [];
        if (requiredIf == true) {
          const requiredIfIndex = validation.findIndex((v) =>
            v?.includes("required_if")
          );
          if (requiredIfIndex != -1) {
            const condition = validation[requiredIfIndex]?.split(":")[1];
            const c = condition?.trim()?.split(",");
            console.log(condition, "c.length", c.length, c.slice(1, c.length));
            requiredIfName = c[0] || null;
            requiredIfValue = c.length > 0 ? c.slice(1, c.length) : null;
          }
        }
        //exclude if logic
        const excludeIf = f.validation?.includes("exclude_if");
        let excludeIfName = null;
        let excludeIfValue = [];
        if (excludeIf == true) {
          const excludeIfIndex = validation.findIndex((v) =>
            v?.includes("exclude_if")
          );
          if (excludeIfIndex != -1) {
            const condition = validation[excludeIfIndex]?.split(":")[1];
            const c = condition?.trim()?.split(",");
            console.log(condition, "c.length", c.length, c.slice(1, c.length));
            excludeIfName = c[0] || null;
            excludeIfValue = c.length > 0 ? c.slice(1, c.length) : null;
          }
        }
        //required unless logic
        const requiredUnless = f.validation?.includes("required_unless");
        let requiredUnlessName = null;
        let requiredUnlessValue = [];
        if (requiredUnless == true) {
          const requiredUnlessIndex = validation.findIndex((v) =>
            v?.includes("required_unless")
          );
          if (requiredUnless != -1) {
            const condition = validation[requiredUnlessIndex]?.split(":")[1];
            const c = condition?.trim()?.split(",");
            console.log(condition, "c.length", c.length, c.slice(1, c.length));
            requiredUnlessName = c[0] || null;
            requiredUnlessValue = c.length > 0 ? c.slice(1, c.length) : null;
          }
        }

        //sum of other fields
        const sumOf = field?.validation?.includes("sum:");
        console.log("condition", sumOf, field?.name, field?.validation);
        let sumOfNames = [];
        if (sumOf == true) {
          const sumOfIndex = validation.findIndex((v) => v?.includes("sum"));
          if (sumOfIndex != -1) {
            const condition = validation[sumOfIndex]?.split(":")[1];
            const c = condition?.trim()?.split(",");
            console.log(condition, "c.length", c.length, c);
            sumOfNames = c;
          }
        }

        const refactor = () => {
          if (requiredIf && excludeIf) {
            if (requiredIf && field?.name == requiredIfName) {
              if (!requiredIfValue?.includes(value)) {
                setValue(f.name, "");
                changes[f.name] = "";
              }
            }
          } else if (requiredIf && field.name == requiredIfName) {
            console.log(
              fields,
              field.name,
              requiredIfName,
              f.name,
              requiredIfValue,
              value,
              requiredIfValue?.includes(value)
            );
            if (!requiredIfValue?.includes(value)) {
              setValue(f.name, "");
              changes[f.name] = "";
            }
          } else if (excludeIf && field.name == excludeIfName) {
            if (excludeIfValue?.includes(value)) {
              setValue(f.name, "");
              changes[f.name] = "";
            }
          } else if (requiredUnless && field.name == requiredUnlessName) {
            // if (requiredUnlessValue?.includes(value)) {
            //   setValue(f.name, "");
            //   changes[f.name] = "";
            // }
          }

          if (field.name == "functional_use_id") {
            setValue("use_category_id", "");
            changes["use_category_id"] = "";
          }

          // const sumFields = [
          //   "male_population",
          //   "female_population",
          //   "other_population",
          // ];
          // if (sumFields?.includes(f.name)) {
          //   let sum = 0;
          //   sumFields.map((v) => (sum += parseInt(getValues(v)) || 0));
          //   setValue("population_served", sum);
          //   changes["population_served"] = sum;
          // }

          if (sumOf) {
            if (
              !requiredUnlessValue?.includes(selected[requiredUnlessName]) &&
              field.name == "population_served"
            ) {
              console.log(
                f.name,
                "sumOfNames",
                sumOfNames,
                requiredUnlessValue,
                requiredUnlessName
                // selected[requiredUnlessName]
              );
              console.log(selected[requiredUnlessName]);
            } else {
              if (f.name == "population_served") {
                console.log(sumOfNames);
                let sum = 0;
                sumOfNames.map((v) => (sum += parseInt(getValues(v)) || 0));
                console.log(sum);
                setValue("population_served", sum);
                changes["population_served"] = sum;
              }
            }
          }
        };
        if (!disabled) {
          if (type === "text" || type === "select") {
            refactor();
          }
          if (type === "number") {
            refactor();
          }
        }
      });
      console.log(changes);
      // setSelected({ ...selected, ...changes, [field.name]: value });
    } catch (error) {
      console.log(error);
    }
  };

  const RenderForm = ({ field }) => {
    const disabled = "disabled" in field ? field?.disabled : false;
    return (
      <View key={field.name}>
        <View style={{}}>
          {field?.input_type == "date" && (
            <Calendar
              setValue={setValue}
              name={field?.name}
              label={getLabel(field?.label)}
              initialValue={item[field.name]}
              errors={errors}
              field={field}
              selected={selected}
              setSelected={setSelected}
              disabled={disabled}
              control={control}
            />
          )}
        </View>
        {(field?.input_type == "text" || field?.input_type == "number") && (
          <>
            <InputText
              field={field}
              control={control}
              errors={errors}
              selected={selected}
              setSelected={setSelected}
              resetFieldsOnChange={resetFieldsOnChange}
              disabled={disabled}
            />
          </>
        )}
        {field?.input_type == "time" && (
          <>
            <InputTime
              field={field}
              control={control}
              errors={errors}
              selected={selected}
              setSelected={setSelected}
              resetFieldsOnChange={resetFieldsOnChange}
              disabled={disabled}
              setValue={setValue}
            />
          </>
        )}
        {field?.input_type == "file_upload" && (
          <>
            <View style={{}}>
              <FileUpload
                setValue={setValue}
                field={field}
                errors={errors}
                setImageDialog={setImageDialog}
                imageDialog={imageDialog}
                file={file}
                setFile={setFile}
              />
              <Portal>
                <Dialog
                  visible={imageDialog[field.name]}
                  onDismiss={() =>
                    setImageDialog({ ...imageDialog, [field.name]: false })
                  }
                >
                  <View style={{ padding: 20 }}>
                    <Button
                      onPress={() => {
                        openCamera(field.name);
                      }}
                    >
                      {getLabel("Open camera")}
                    </Button>
                    <Button
                      onPress={() => {
                        openGallery(field.name);
                      }}
                    >
                      {getLabel("Choose from gallery")}
                    </Button>
                  </View>
                </Dialog>
              </Portal>
            </View>
          </>
        )}
        {(field?.input_type == "select" || field?.input_type == "checkbox") && (
          <>
            <View style={{}}>
              <Select
                field={field}
                errors={errors}
                setValue={setValue}
                getValues={getValues}
                selected={selected}
                setSelected={setSelected}
                resetFieldsOnChange={resetFieldsOnChange}
                disabled={disabled}
              />
            </View>
          </>
        )}
      </View>
    );
  };

  const RenderField = ({ field }) => {
    const type = field.input_type;
    // console.log("select", field, options);
    const validation =
      (typeof field?.validation == "string" && field?.validation.split("|")) ||
      [];

    const requiredIf = field?.validation?.includes("required_if");
    const excludeIf = field?.validation?.includes("exclude_if");
    const requiredUnless = field?.validation?.includes("required_unless");

    //required if logic
    let name = null;
    let value = null;
    if (requiredIf == true) {
      const requiredIfIndex = validation.findIndex((v) =>
        v?.includes("required_if")
      );

      if (requiredIfIndex != -1) {
        const condition = validation[requiredIfIndex]?.split(":")[1];
        const c = condition?.trim()?.split(",");
        console.log(condition, "c.length", c.length, c.slice(1, c.length));
        name = c[0] || null;
        value = c.length > 0 ? c.slice(1, c.length) : null;
      }
    }

    //exclude if logic
    let eName = null;
    let eValue = null;
    if (excludeIf == true) {
      const excludeIfIndex = validation.findIndex((v) =>
        v?.includes("exclude_if")
      );

      if (excludeIfIndex != -1) {
        const condition = validation[excludeIfIndex]?.split(":")[1];
        const c = condition?.trim()?.split(",");
        console.log(condition, "c.length", c.length, c.slice(1, c.length));
        eName = c.length > 0 ? c[0] : null;
        eValue = c.length > 0 ? c.slice(1, c.length) : null;
      }
    }
    //required unless logic
    let ruName = null;
    let ruValue = null;
    if (requiredUnless == true) {
      const requiredUnlessIndex = validation.findIndex((v) =>
        v?.includes("required_unless")
      );

      if (requiredUnlessIndex != -1) {
        const condition = validation[requiredUnlessIndex]?.split(":")[1];
        const c = condition?.trim()?.split(",");
        console.log(condition, "c.length", c.length, c.slice(1, c.length));
        ruName = c.length > 0 ? c[0] : null;
        ruValue = c.length > 0 ? c.slice(1, c.length) : null;
      }
      console.log(ruValue);
    }

    let show = false;
    const hasShowWhen = "show_when" in field;

    if (hasShowWhen) {
      const showWhen = field?.show_when;
      if (showWhen.operator == "=") {
        const fieldOne = watch(showWhen.field);
        const fieldTwo = watch(showWhen.value_field);
        if (fieldOne && fieldTwo) {
          show = fieldOne == fieldTwo;
        }
      }
    }

    const Field = () => {
      return (
        <>
          {/* <Text>{JSON.stringify(hasShowWhen)}</Text> */}
          <View style={{ marginBottom: 16 }}>
            {requiredIf || excludeIf ? (
              <>
                {/* <Text>
                {field.name} require if "{name}"" is "{selected[name]}"" == "
                {JSON.stringify(value)}"
              </Text> */}
                {
                  requiredIf && excludeIf && (
                    <>
                      {/* <Text>
                    {field.name} exclude if "{eName}"" is "{selected[eName]}""
                    == "{JSON.stringify(eValue)}"
                  </Text> */}
                      <Text style={{ marginBottom: 5 }}>
                        {getLabel(field.label)}{" "}
                        {field?.required ? (
                          <Text style={{ color: "red" }}>*</Text>
                        ) : (
                          <></>
                        )}
                      </Text>
                      {/* {value?.includes(selected[name]) &&
                    !eValue?.includes(selected[eName]) ? ( */}
                      <RenderForm key={field?.name} field={field} />
                      {/* ) : (
                      <></>
                    )} */}
                    </>
                  )
                  // : (
                  //   <></>
                  // )
                }
                {requiredIf && !excludeIf ? (
                  value?.includes(selected[name]) ? (
                    <>
                      <Text style={{ marginBottom: 5 }}>
                        {getLabel(field.label)}{" "}
                        {field?.required ? (
                          <Text style={{ color: "red" }}>*</Text>
                        ) : null}
                      </Text>
                      <RenderForm key={field?.name} field={field} />
                    </>
                  ) : (
                    <></>
                  )
                ) : (
                  <></>
                )}
                {!requiredIf && excludeIf ? (
                  eValue?.includes(selected[eName]) ? (
                    <>
                      {/* <Text>
                      {field.name} exclude if "{eName}"" is "{selected[eName]}""
                      == "{eValue}"
                    </Text> */}
                      <RenderForm key={field?.name} field={field} />
                    </>
                  ) : (
                    <></>
                  )
                ) : (
                  <></>
                )}
              </>
            ) : (
              <>
                {requiredUnless ? (
                  <>
                    {/* <Text>
                    {field.name} required unless "{ruName}"" is "{ruValue}"" ==
                    "{ruValue}"
                  </Text> */}

                    {!ruValue?.includes(selected[ruName]) ? (
                      <>
                        {" "}
                        <Text style={{ marginBottom: 5 }}>
                          {getLabel(field.label)}{" "}
                          {/* {field.required ? (
                          <Text style={{ color: "red" }}>*</Text>
                        ) : null} */}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={{ marginBottom: 5 }}>
                          {getLabel(field.label)}{" "}
                          {field?.required ? (
                            <Text style={{ color: "red" }}>*</Text>
                          ) : (
                            <></>
                          )}
                        </Text>
                      </>
                    )}
                    <RenderForm key={field?.name} field={field} />
                  </>
                ) : (
                  <>
                    {}
                    <Text style={{ marginBottom: 5 }}>
                      {getLabel(field.label)}{" "}
                      {field.required ? (
                        <Text style={{ color: "red" }}>*</Text>
                      ) : (
                        <></>
                      )}
                    </Text>
                    {/* <Text style={{ marginBottom: 5 }}>
                    {field.label}{" "}
                    {field.required ? (
                      <Text style={{ color: "red" }}>*</Text>
                    ) : null}
                  </Text>
                  {renderForm(field)} */}
                    <RenderForm key={field?.name} field={field} />
                  </>
                )}
              </>
            )}
            {errors[field?.name]?.message ? (
              <HelperText style={styles.errorText}>
                {getLabel(errors[field?.name]?.message)}
              </HelperText>
            ) : (
              <></>
            )}
          </View>
        </>
      );
    };

    if (hasShowWhen && show) {
      return (
        <>
          <Field />
        </>
      );
    }

    if (!hasShowWhen) {
      return (
        <>
          <Field />
        </>
      );
    }
  };

  const GroupFields = ({ fields }) => {
    let groups = {};
    fields?.length > 0 &&
      fields.map((field) => {
        let groupName = "no-grouping";
        if (field.group) {
          groupName = field.group;
        }
        if (groups[groupName]) {
          groups[groupName].push(field);
        } else {
          groups[groupName] = [field];
        }
      });

    if (Object.keys(groups).length > 0) {
      return (
        <>
          {Object.keys(groups).map((key, index) => (
            <React.Fragment key={key}>
              <View>
                {/* if has group key name */}
                {key != "no-grouping" && (
                  <>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        marginBottom: 16,
                        marginTop: 10,
                        textTransform: "capitalize",
                        color: theme.colors.primary,
                      }}
                    >
                      {getLabel(key.split("_").join(" "))}
                    </Text>
                  </>
                )}
                {/* render by group */}
                {groups[key].map((field, index) => {
                  if (field.input_type != "hidden") {
                    return (
                      <View key={field.name}>
                        <RenderField field={field} key={field.name} />
                      </View>
                    );
                  }
                })}
              </View>
            </React.Fragment>
          ))}
        </>
      );
    }
  };

  console.log("validation errors", errors);

  return (
    <>
      <View style={{ flex: 1 }}>
        <Header
          title={title}
          onMapPress={
            isAnfPending
              ? () =>
                  navigation.navigate(ROUTES.anf_locate, {
                    applicationId: item?.id,
                    returnRoute: ROUTES.application_form,
                  })
              : undefined
          }
        />
        <LoadingSpinner
          isVisible={dataLoading}
          title={getLabel("Loading data..")}
        />
        <ScrollView
          keyboardShouldPersistTaps={"handled"}
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl onRefresh={loadData} refreshing={false} />
          }
        >
          <LoadingSpinner isVisible={loading} title={"Loading"} />

          {/* <Text>{JSON.stringify(fields)}</Text>
        <Text>{JSON.stringify(fields)}</Text>
        <Text>{JSON.stringify(errors)}</Text> */}

          {/* <Text>{JSON.stringify(errors)}</Text> */}

          {/* {fields?.length > 0 &&
            fields?.map((field, index) => {
              // console.log(field);

              return <View key={field.name}>{renderField(field)}</View>;
            })} */}
          {/* <Text>{JSON.stringify(groupFields(fields))}</Text> */}
          <GroupFields fields={fields} />

          {/* <Text>{JSON.stringify(loading)}</Text> */}

          {!dataLoading && (
            <Button
              disabled={loading}
              icon={
                !loading ? "send" : () => <ActivityIndicator animating={true} />
              }
              mode="contained"
              contentStyle={styles.btnContent_style}
              style={styles.btn_style}
              onPress={handleSubmit(submit)}
            >
              {getLabel("Submit")}
            </Button>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const InputText = ({
  control,
  field,
  errors,
  selected,
  setSelected,
  resetFieldsOnChange,
  disabled,
}) => {
  const { contentsLabel } = useSelector((state) => state.auth);
  const getLabel = (key) => contentsLabel?.[key] || key;
  const keyboard = field?.input_type == "number" ? "number-pad" : "";

  // //required with logic
  // const requiredWith = field?.validation?.includes("required_with");
  // let name = null;
  // if (requiredWith == true) {
  //   const requiredWithIndex = validation.findIndex((v) =>
  //     v?.includes("required_with")
  //   );

  //   if (requiredWithIndex != -1) {
  //     const condition = validation[requiredWithIndex]?.split(":")[1];
  //     console.log(condition);
  //     name = condition || null;
  //   }
  // }

  // const validation =
  //   typeof field.validation == "string" ? field?.validation?.split("|") : [];
  // //required unless logic
  // const requiredUnless = field?.validation?.includes("required_unless");
  // let requiredUnlessName = null;
  // let requiredUnlessValue = [];
  // if (requiredUnless == true) {
  //   const requiredUnlessIndex = validation.findIndex((v) =>
  //     v?.includes("required_unless")
  //   );
  //   if (requiredUnless != -1) {
  //     const condition = validation[requiredUnlessIndex]?.split(":")[1];
  //     const c = condition?.trim()?.split(",");
  //     console.log(condition, "c.length", c.length, c.slice(1, c.length));
  //     requiredUnlessName = c[0] || null;
  //     requiredUnlessValue = c.length > 0 ? c.slice(1, c.length) : null;
  //   }
  // }

  // const readOnly =
  //   "readonly" in field
  //     ? requiredUnless &&
  //       !requiredUnlessValue?.includes(selected[requiredUnlessName])
  //       ? false
  //       : true
  //     : field.readonly;

  // const value = field.prefilled == true ? String(value || ""): ""

  const multiline = field.multiline || false;

  return (
    <>
      {/* <Text>{requiredUnless ? "requiredUnless" : ""}</Text>
      <Text>{readOnly ? "true" : "false"}</Text>
      <Text>{JSON.stringify(requiredUnlessValue)}</Text>
      <Text>{JSON.stringify(selected[requiredUnlessName])}</Text> */}
      {/* <Text>{selected[field.name]}</Text> */}
      <Controller
        control={control}
        name={field.name}
        defaultValue=""
        render={({ field: { onChange, value } }) => {
          // Write to the form on every keystroke. Committing only on end-editing
          // lost the last typed field: with keyboardShouldPersistTaps="handled",
          // tapping Submit does not end editing first.
          return (
            <>
              <TextInput
                // label={getLabel(field.label)}
                placeholder={getLabel(field.placeholder)}
                disabled={disabled}
                mode="outlined"
                dense={true}
                multiline={multiline}
                rows={multiline ? 5 : 1}
                value={value === null || value === undefined ? "" : String(value)}
                onChangeText={onChange}
                type={"date"}
                theme={{
                  roundness: 4,
                  colors: {
                    outline: theme.colors.outline,
                  },
                }}
                keyboardType={keyboard}
                error={errors[field.name]?.message ? true : false}
                style={[styles.input]}
              />
            </>
          );
        }}
      />
    </>
  );
};

const Select = ({
  field,
  errors,
  setValue,
  getValues,
  selected,
  setSelected,
  resetFieldsOnChange,
  disabled,
}) => {
  const [choose, setChoose] = useState(
    getValues(field.name) || field.value || null
  );
  const { options } = field;
  const { contentsLabel } = useSelector((state) => state.auth);
  const getLabel = (key) => contentsLabel?.[key] || key;

  const selectField = () => {
    // const lists =
    //   field.name == "use_category_id"
    //     ? selected.functional_use_id &&
    //       field.options[selected.functional_use_id]
    //       ? field.options[selected.functional_use_id]
    //       : {}
    //     : options;

    // if (field.name == "use_category_id" && selected.functional_use_id) {
    //   console.log(
    //     lists,
    //     selected.functional_use_id,
    //     field.options[selected.functional_use_id]
    //   );
    // }
    return (
      <>
        {/* <Text>{JSON.stringify(field)}</Text> */}
        <View
          style={[
            styles.picker,
            {
              borderColor: errors[field.name]
                ? theme.colors.error
                : disabled
                ? COLORS.lightGrey
                : null,
              borderWidth: errors[field.name] ? 2 : 0.5,
              backgroundColor: "white",
              paddingHorizontal: 5,
              borderRadius: 4,
            },
          ]}
        >
          <Picker
            enabled={!disabled}
            style={[
              styles.pickerTextStyle,
              { color: disabled ? COLORS.lightGrey : "" },
            ]}
            selectedValue={choose || ""}
            onValueChange={(value) => {
              console.log(value, field.name);
              //if functional use of building changed reset use category of building
              setChoose(value);
              setValue(field?.name, value);
              // setSelected((prev) => ({
              //   ...prev,
              //   [field.name]: value,
              // }));
              // resetFieldsOnChange(field, value);
            }}
          >
            <Picker.Item
              label={getLabel(field?.placeholder)}
              value=""
              color={disabled ? "#767A7D" : "#000000"}
            />

            {Array.isArray(options) &&
              options.map((option, index) => {
                console.log("option", option);
                return (
                  <Picker.Item
                    key={option.value}
                    label={getLabel(option.label)}
                    value={option.value}
                    color={disabled ? "#767A7D" : "#000000"}
                  />
                );
              })}
          </Picker>
        </View>
      </>
    );
  };

  return (
    <>
      <>{selectField()}</>
    </>
  );
};

const Calendar = ({
  setValue,
  name,
  initialValue,
  errors,
  label,
  field,
  disabled,
  control,
}) => {
  const [date, setDate] = useState(
    field?.prefilled ? dayjs(field.value).format("YYYY-MM-DD") || "" : ""
  );
  useEffect(() => {
    return () => {
      setDate("");
    };
  }, []);
  return (
    <>
      <Controller
        control={control}
        name={field.name}
        defaultValue=""
        render={({ field: { onChange, value } }) => {
          // setDate(value ?? dayjs(value).format("YYYY-MM-DD"));
          console.log("date");
          const splitDate = value?.split("/");
          const newDate = value
            ? `${splitDate[2]}-${splitDate[0]}-${splitDate[1]}`
            : "";
          return (
            <>
              {/* <Text>
                {date} {value} {newDate} {JSON.stringify(newDate)}
              </Text> */}
              {/* <Text>{JSON.stringify(value)}</Text> */}
              <CustomNormalCalendar
                field={field}
                selectedDate={value}
                label={label}
                err={errors[name] ? true : false}
                mode="outlined"
                onDateSelect={(date) => {
                  console.log(date);
                  const formatDate = dayjs(date).format("MM/DD/YYYY");
                  console.log("selected date", formatDate.toString());
                  // setValue(name, formatDate.toString());
                  setDate(date);
                  // onChange(formatDate.toString());
                  // setSelected((prev) => ({
                  //   ...prev,
                  //   [field.name]: date,
                  // }));
                  onChange(date);
                }}
                format="MM/DD/YYYY"
                disabled={disabled}
              />
            </>
          );
        }}
      />
    </>
  );
};

const FileUpload = ({
  field,
  errors,
  setImageDialog,
  imageDialog,
  setFile,
  file,
  setValue,
}) => {
  const { contentsLabel } = useSelector((state) => state.auth);
  const getLabel = (key) => contentsLabel?.[key] || key;

  const validation =
    typeof field.validation == "string" ? field?.validation?.split("|") : [];

  let max = "";
  let maxVal = "";
  const maxInc =
    (typeof field.validation == "string" &&
      field?.validation?.includes("max")) ||
    false;
  if (maxInc) {
    const maxIndex = validation.findIndex((v) => v?.includes("max"));
    console.log("maxIndex", maxIndex);
    if (maxIndex != -1) {
      max = validation[maxIndex].split(":");
      maxVal = max[1];
      if (maxVal) {
        maxVal = maxVal * 100;
      }
    }
  }

  return (
    <>
      <View style={styles.imgContainer}>
        {/* <Text>{JSON.stringify(file)}</Text> */}
        {file[field.name] ? (
          <Card mode="contained">
            <Card.Cover
              source={{
                uri: file[field.name] || "",
              }}
            />
            <IconButton
              mode="contained-tonal"
              icon={"trash-can-outline"}
              containerColor={"white"}
              iconColor={"red"}
              size={20}
              style={styles.removeBtn}
              onPress={() => {
                setFile({ ...file, [field.name]: null });
                // setSelected((prev) => ({
                //   ...prev,
                //   [field.name]: null,
                // }));
                setValue(field?.name, "");
              }}
            />
          </Card>
        ) : (
          <Card
            mode="contained"
            style={[
              styles.uploadImageCard,
              errors[field?.name] && styles.errorCard,
            ]}
            onPress={() => {
              setImageDialog({ ...imageDialog, [field.name]: true });
            }}
          >
            <Card.Content style={styles.uploadImageContainer}>
              <Icon source={"image-plus"} size={36} />
              <View style={{ alignItems: "center" }}>
                <Text variant="labelLarge">{getLabel(field?.label)}</Text>
                <Text variant="labelLarge">{getLabel(`Max ${max[1]}KB`)}</Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </View>
    </>
  );
};

const InputTime = ({
  control,
  field,
  errors,
  selected,
  setSelected,
  resetFieldsOnChange,
  disabled,
  setValue,
}) => {
  const bottomSheetRef = useRef < BottomSheet > null;
  const theme = useTheme();
  const [time, setTime] = useState();
  const [state, setState] = useState("idle");
  const [timeOpen, setTimeOpen] = useState(false);
  const { contentsLabel } = useSelector((state) => state.auth);
  const getLabel = (key) => contentsLabel?.[key] || key;
  const keyboard = field?.input_type == "number" ? "number-pad" : "";

  const [showPicker, setShowPicker] = useState(false);
  const [alarmString, setAlarmString] = useState(null);

  const formatTime = ({ hours, minutes, seconds }) => {
    const timeParts = [];

    if (hours !== undefined) {
      timeParts.push(hours.toString().padStart(2, "0"));
    }
    if (minutes !== undefined) {
      timeParts.push(minutes.toString().padStart(2, "0"));
    }
    if (seconds !== undefined) {
      timeParts.push(seconds.toString().padStart(2, "0"));
    }

    return timeParts.join(":");
  };

  const openLanguageSheet = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

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
      <Pressable
        onPress={() => {
          setTimeOpen(true);
        }}
      >
        <Controller
          control={control}
          name={field.name}
          defaultValue=""
          render={({ field: { onChange, value } }) => {
            console.log("time", value);
            const hrs = value ? value.split(":")[0] : "00";
            const mins = value ? value.split(":")[1] : "00";

            // The value is stored/submitted in 24-hour "HH:mm" form, but it is
            // displayed to the user in 12-hour format with an AM/PM indicator.
            const parsedTime = value ? dayjs(`1970-01-01T${value}`) : null;
            const displayValue =
              parsedTime && parsedTime.isValid()
                ? parsedTime.format("hh:mm A")
                : value;

            return (
              <>
                {/* <Text>
                {JSON.stringify(
                  new Date(`1970-01-01T${value.split(":")[0]}:00:00`)
                )}
              </Text>
              <Text>{JSON.stringify(value)}</Text> */}
                <TextInput
                  // label={getLabel(field.label)}
                  placeholder={getLabel(field.placeholder)}
                  editable={false}
                  mode="outlined"
                  dense={true}
                  value={displayValue}
                  // right={
                  //   <TextInput.Icon
                  //     icon="chevron-down"
                  //     // onPress={() => setTimeOpen(true)}
                  //   />
                  // }
                  type={"text"}
                  theme={{
                    roundness: 4,
                    colors: {
                      outline: theme.colors.outline,
                    },
                  }}
                  keyboardType={keyboard}
                  error={errors[field.name]?.message ? true : false}
                  style={[styles.input]}
                />
                {timeOpen && (
                  <>
                    <TimerPickerModal
                      initialValue={{
                        days: 0,
                        hours: hrs ? parseInt(hrs) : 0,
                        minutes: mins ? parseInt(mins) : 0,
                        seconds: 0,
                      }}
                      closeOnOverlayPress={false}
                      aggressivelyGetLatestDuration={true}
                      // LinearGradient={LinearGradient}
                      modalProps={{
                        overlayOpacity: 0.2,
                      }}
                      hideSeconds
                      hourLabel=":"
                      minuteLabel=" "
                      padHoursWithZero={true}
                      padMinutesWithZero={true}
                      modalTitle="Select Time"
                      amLabel="AM"
                      pmLabel="PM"
                      onCancel={() => setTimeOpen(false)}
                      onConfirm={(pickedDuration) => {
                        console.log("pickedDuration", pickedDuration);
                        const d =
                          String(pickedDuration.hours).padStart(2, "0") +
                          ":" +
                          String(pickedDuration.minutes).padStart(2, "0");
                        console.log("time", d, formatTime(pickedDuration));
                        setTime(d);
                        setValue(field.name, d);
                        onChange(d);
                        // setSelected((prev) => ({
                        //   ...prev,
                        //   [field.name]: null,
                        // }));
                        setAlarmString(formatTime(pickedDuration));
                        setTimeOpen(false);
                      }}
                      setIsVisible={setTimeOpen}
                      styles={{
                        theme: "light",
                      }}
                      visible={timeOpen}
                    />
                  </>
                )}
              </>
            );
          }}
        />
      </Pressable>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACINGS.xs,
  },
  picker: {
    backgroundColor: colors.fieldsColor,
    borderBottomColor: colors.darkGrey,
    borderBottomWidth: 0.6,
  },
  pickerTextStyle: {
    color: lightTheme.colors.onSurfaceVariant,
  },
  imgContainer: {
    gap: 10,
    // marginTop: 8,
    // paddingHorizontal: 8,
  },
  btn_style: {
    marginTop: SPACINGS.sm,
    marginBottom: SPACINGS.lg,
  },
  checkboxContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  checkbox: {
    alignSelf: "center",
  },
  btnContent_style: {
    paddingVertical: SPACINGS.xs,
  },

  picker_style: {
    borderColor: COLORS.darkGrey,
    borderWidth: 1,
    borderRadius: SPACINGS.xs,
    marginBottom: SPACINGS.xs,
  },

  picker_error_style: {
    borderColor: "#ff0033",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },

  input_style: {
    backgroundColor: "#F6F4F4",
    marginBottom: SPACINGS.xs,
  },
  errorText: {
    color: "#E01632",
    paddingBottom: 0,
    marginBottom: 0,
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

const style = (theme) =>
  StyleSheet.create({
    container: {
      paddingTop: 12,
      backgroundColor: "red",
    },
    languageButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
    },
    languageText: {
      color: theme.colors.onPrimary,
      fontWeight: "bold",
    },
    bottomSheetContainer: {
      padding: 16,
    },
    bottomSheetTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 16,
      color: theme.colors.onBackground,
    },
    languageItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    languageItemContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    selectedLanguageItem: {
      backgroundColor: theme.colors.primaryContainer,
    },
    languageItemText: {
      fontSize: 16,
      color: theme.colors.onBackground,
    },
    selectedLanguageItemText: {
      color: theme.colors.primary,
      fontWeight: "bold",
    },
    checkIcon: {
      margin: 0,
    },
  });
