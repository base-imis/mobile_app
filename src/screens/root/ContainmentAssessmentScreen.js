import dayjs from "dayjs";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import DatePicker from "react-native-date-picker";
import { Picker } from "@react-native-picker/picker";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
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
} from "react-native-paper";

import { COLORS, SPACINGS } from "../../core/theme";
import {
  assessmentSurveyFields,
  saveAssessmentServiceAPI,
  serviceProviderAPI,
  vacutugTypesAPI,
} from "../../service/supervisor_service";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { ROUTES } from "../../core/constants/routes";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useDispatch, useSelector } from "react-redux";
import { resetToken } from "../../store/slices/auth.slice";
import { Header } from "../../components/headers";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import CustomCalendar from "../../components/CustomCalendar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { URLS } from "../../core/constants/urls";
import axios from "axios";
import { BASE_URL_ENV } from "../../constants/config";

export default function ContainmentAssessmentScreen({ navigation, route }) {
  const { contentsLabel } = useSelector((state) => state.auth);

  const getLabel = (key) => contentsLabel?.[key] || key;
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const [serviceProvider, setServiceProvider] = useState([]);
  const [vacutugTypes, setVacutugTypes] = useState([]);
  const defaultImage =
    "https://st3.depositphotos.com/23594922/31822/v/600/depositphotos_318221368-stock-illustration-missing-picture-page-for-website.jpg";
  const [recieptImage, setRecieptImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [dataLoading, setDataLoading] = useState(false);
  const [fields, setFields] = useState([]);
  const [inputValues, setInputValues] = useState({});

  const [houseImageDialog, setHouseImageDialog] = useState(false);

  const tomorrow = new Date();

  const { item } = route.params;

  const [schema, setSchema] = useState(Yup.object().shape({}));

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    setErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    getSupervisoryAssessmentFormFields();

    return () => {
      reset();
      setRecieptImage(null);
    };
  }, []);

  const buildDynamicValidations = (fields) => {
    console.log(fields);
    try {
      const validations = {};

      fields.forEach((field) => {
        console.log(field);
        let validator;
        const validation = field.validation.split("|");
        const type = validation[1];
        const rule = validation[3] ? validation[3].split(":")[0] : null;
        const arg = validation[3] ? validation[3].split(":")[1] : null;

        if (type === "string") {
          validator = Yup.string().required(
            getLabel(`${field.label || field.name} is required`)
          );
          if (rule === "in" && arg) {
            const enumValues = arg.split(",");
            validator = validator.oneOf(
              enumValues,
              getLabel(
                `${field.label || field.name} must be one of: ${enumValues.join(
                  ", "
                )}`
              )
            );
          }
        } else if (type === "numeric") {
          validator = Yup.number()
            .typeError(
              getLabel(`${field.label || field.name} must be a number`)
            )
            .required(getLabel(`${field.label || field.name} is required`));
          if (rule === "min" && arg) {
            validator = validator.min(
              Number(arg),
              getLabel(`${field.label || field.name} must be at least ${arg}`)
            );
          }
          if (rule === "max" && arg) {
            validator = validator.max(
              Number(arg),
              getLabel(`${field.label || field.name} must be at most ${arg}`)
            );
          }
        } else if (type === "integer") {
          validator = Yup.number()
            .typeError(
              getLabel(`${field.label || field.name} must be a number`)
            )
            .integer(
              getLabel(`${field.label || field.name} must be an integer`)
            )
            .required(getLabel(`${field.label || field.name} is required`));
          if (rule === "min" && arg) {
            validator = validator.min(
              Number(arg),
              getLabel(`${field.label || field.name} must be at least ${arg}`)
            );
          }
          if (rule === "max" && arg) {
            validator = validator.max(
              Number(arg),
              getLabel(`${field.label || field.name} must be at most ${arg}`)
            );
          }
        } else if (type == "image") {
          const MAX_FILE_SIZE = 512000; //5MB

          const validFileExtensions = {
            image: ["jpg", "jpeg", "png"],
          };

          function isValidFileType(fileName, fileType) {
            console.log(fileName, fileType);
            return (
              fileName &&
              validFileExtensions[fileType].indexOf(fileName.split(".").pop()) >
                -1
            );
          }
          validator = Yup.mixed()
            .required(field?.label + " Image is Required")
            .test(
              "is-valid-type",
              getLabel("Not a valid image type"),
              (value) =>
                isValidFileType(
                  value && value.fileName && value.fileName.toLowerCase(),
                  "image"
                )
            )
            .test(
              "is-valid-size",
              getLabel("Max allowed size is 5MB"),
              (value) => value && value.fileSize <= MAX_FILE_SIZE
            );
        } else if (type == "date") {
          validator = Yup.string().required(
            getLabel(`${field.label || field.name} is required`)
          );
        }
        validations[field.name] = validator;
      });

      // console.log(validations);

      return Yup.object().shape(validations);
    } catch (e) {
      console.log(e);
    }
  };

  const setInitialFieldValues = (fields, item, setValue) => {
    fields.forEach((field) => {
      if (field.prefilled) {
        if (field.name === "house_locality") {
          setValue("house_locality", item["area_name"]);
        }

        // else if (field.name === "road_name") {
        //   setValue("road_name", item["road_number"]);
        // }
        else {
          setValue(field.name, item[field.name]);
        }
      } else {
        setValue(field.name, "");
      }
    });
  };

  const getSupervisoryAssessmentFormFields = () => {
    setDataLoading(true);
    assessmentSurveyFields()
      .then((res) => {
        console.log("getSupervisoryAssessmentFormFields", res.data);
        setFields(res.data);

        setFields(res.data);
        setInitialFieldValues(res.data, item, setValue);
        setSchema(buildDynamicValidations(res.data));
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
    quality: 0.1,
    // includeBase64: true,
  };

  useEffect(() => {
    navigation.setOptions({
      title: `Containment Assessment #${item.application_id}`,
    });

    loadData();
  }, []);

  const getServiceProvider = () => {
    serviceProviderAPI()
      .then((res) => {
        const { data, errors, success } = res.data;
        if (success) {
          setServiceProvider(data.serviceproviders);
        } else {
          console.log(errors);
        }
      })
      .catch((e) => {})
      .finally(() => setDataLoading(false));
  };

  const getVacutugTypes = () => {
    vacutugTypesAPI()
      .then((res) => {
        const { data, error, success } = res.data;
        console.log(res.data);

        if (success) {
          setVacutugTypes(data.vacutugtypes);
        } else {
          console.log(error);
        }
      })
      .catch((e) => {})
      .finally(() => setDataLoading(false));
  };

  const loadData = () => {
    setDataLoading(true);

    getServiceProvider();

    getVacutugTypes();
  };

  const openCamera = (name) => {
    launchCamera(option, (res) => {
      if (res.didCancel) {
        setHouseImageDialog(false);
        return;
      }

      if (res.assets[0].fileSize > 500000) {
        Alert.alert(
          getLabel("File size error"),
          getLabel(
            "The image size exceeds 5 MB, please select lower size image."
          )
        );
        return;
      }
      console.log("res.assets[0]", res.assets[0]);
      const asset = res.assets[0] || null;
      setRecieptImage(res.assets[0].uri);
      setValue(name, asset);
      setHouseImageDialog(false);
    });
  };

  const openGallery = (name) => {
    launchImageLibrary(option, (res) => {
      if (res.didCancel) {
        setHouseImageDialog(false);

        if (res.assets[0].fileSize > 500000) {
          Alert.alert(
            getLabel("File size error"),
            getLabel("The image size exceeds 5 MB, please try again")
          );
          return;
        }
      }

      console.log("res.assets[0]", res.assets[0]);
      const asset = res.assets[0] || null;
      setRecieptImage(res.assets[0].uri);
      setValue(name, asset);
      setHouseImageDialog(false);
    });
  };

  const submit = async (values) => {
    try {
      console.log(values);
      // values.vacutugwidth = values.vacutugtypes.split("/")[0];
      // values.vacutugsz = values.vacutugtypes.split("/")[1];

      setLoading(true);

      let formdata = new FormData();

      Object.keys(values).map((key) => {
        formdata.append(key, values[key]);
      });
      formdata.append("application_id", item.application_id);
      const token = await AsyncStorage.getItem("token");
      const postUrl = `${BASE_URL_ENV}/api/${URLS.saveAssessment}`;
      console.log("post ", values);

      console.log(formdata);
      const res = await axios.post(postUrl, formdata, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(res);
      if (res?.status === 200) {
        const message = res?.data?.message;
        Alert.alert(getLabel("Success"), message, [
          {
            text: getLabel("OK"),
          },
        ]);
        navigation.goBack();
      }
    } catch (error) {
      console.log("ERROR!!!!", error);
      const message = error?.response?.data?.message;
      const errors = error?.response?.data?.errors;
      console.log("Error!!!!", error?.response?.data);

      if (message) {
        setLoading(false);

        // Map over errors if they exist
        if (errors) {
          setLoading(false);
          setErrors(errors);
          const errorMessages = Object.values(errors) // Extract error messages
            .flat() // Flatten the array to handle multiple messages per key
            .join("\n"); // Separate each message with a new line

          Alert.alert(getLabel("Error"), `${errorMessages}`, [
            {
              text: getLabel("OK"),
            },
          ]); // Combine main message and error details
        } else {
          Alert.alert(getLabel("Error"), message, [
            {
              text: getLabel("OK"),
            },
          ]); // Show main message only if no specific errors
        }
      }
    } finally {
      setLoading(false);
    }
  };
  console.log(errors);

  return (
    <View style={{ flex: 1 }}>
      <Header title={getLabel("Containment Assessment")} />
      <LoadingSpinner
        isVisible={dataLoading}
        title={getLabel("Loading data..")}
      />
      <ScrollView
        keyboardShouldPersistTaps={"handled"}
        contentContainerStyle={styles.container}
      >
        {/* <Text>{JSON.stringify(fields)}</Text>
        <Text>{JSON.stringify(getValues())}</Text>
        <Text>{JSON.stringify(item)}</Text>
        <Text>{JSON.stringify(errors)}</Text> */}
        {fields?.length > 0 &&
          fields?.map((field, index) => {
            // console.log(field);
            const keyboard = field?.input_type == "number" ? "number-pad" : "";
            return (
              <>
                <View key={field.name}>
                  <View style={{ marginTop: 16 }}>
                    {field?.input_type == "date" && (
                      <Calendar
                        setValue={setValue}
                        name={field?.name}
                        label={getLabel(field?.label)}
                        initialValue={item[field.name]}
                        errors={errors}
                      />
                    )}
                  </View>
                  {(field?.input_type == "text" ||
                    field?.input_type == "number") && (
                    <Controller
                      control={control}
                      name={field.name}
                      defaultValue=""
                      render={({ field: { onChange, value } }) => (
                        <>
                          {/* <Text>
                            {keyboard} {field?.input_type}
                          </Text> */}
                          <TextInput
                            label={getLabel(field.label)}
                            disabled={field.disabled}
                            mode="outlined"
                            dense={true}
                            value={String(value || "")}
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
                      )}
                    />
                  )}
                  {field?.input_type == "file" && (
                    <>
                      <FileUpload
                        setValue={setValue}
                        field={field}
                        errors={errors}
                        setHouseImageDialog={setHouseImageDialog}
                        recieptImage={recieptImage}
                        setRecieptImage={setRecieptImage}
                      />
                      <Portal>
                        <Dialog
                          visible={houseImageDialog}
                          onDismiss={() => setHouseImageDialog(false)}
                        >
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
                        </Dialog>
                      </Portal>
                    </>
                  )}
                  {errors[field.name]?.message ? (
                    <HelperText style={styles.errorText}>
                      {getLabel(errors[field.name].message)}
                    </HelperText>
                  ) : null}

                  {/* {values[field.name] &&
                  errors[field.name] &&
                  touched[field.name] ? (
                    <HelperText style={styles.errorText}>
                      {errors[field.name]}
                    </HelperText>
                  ) : null} */}
                  {/* <Text>
                    {field.input_type} {field.name}
                  </Text>
                  {(field.input_type == "text" ||
                    field.input_type == "number") && (
                    <TextInput
                      error={errors[field.name] && touched[field.name]}
                      mode="outlined"
                      label={field.label}
                      style={styles.input_style}
                      placeholder={field.placeholder}
                      keyboardType={keyboard}
                      onChangeText={(value) => {
                        console.log(value);
                      }}
                      value={}
                      disabled={field.disabled}
                      name={field.name}
                    />
                  )} */}
                </View>
              </>
            );
          })}

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
      </ScrollView>
    </View>
  );
}

const Calendar = ({ setValue, name, initialValue, errors, label }) => {
  const [date, setDate] = useState(initialValue || "");
  useEffect(() => {
    return () => {
      setDate("");
    };
  }, []);
  return (
    <>
      {/* <Text>{initialValue}</Text> */}
      <CustomCalendar
        selectedDate={date}
        label={label}
        err={errors[name] ? true : false}
        mode="outlined"
        onDateSelect={(date) => {
          setValue(name, date);
          setDate(date);
        }}
      />
    </>
  );
};

const FileUpload = ({
  field,
  errors,
  setHouseImageDialog,
  recieptImage,
  setRecieptImage,
  setValue,
}) => {
  const { contentsLabel } = useSelector((state) => state.auth);

  const getLabel = (key) => contentsLabel?.[key] || key;
  return (
    <>
      <View style={styles.imgContainer}>
        {/* <Text>{recieptImage}</Text> */}
        {recieptImage ? (
          <Card mode="contained">
            <Card.Cover
              source={{
                uri: recieptImage,
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
                setRecieptImage(null);
                setValue(field?.name, undefined);
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
              setHouseImageDialog(true);
            }}
          >
            <Card.Content style={styles.uploadImageContainer}>
              <Icon source={"image-plus"} size={36} />
              <View style={{ alignItems: "center" }}>
                <Text variant="labelLarge">{getLabel(field?.label)}</Text>
                <Text variant="labelLarge">{getLabel("Max 5MB")}</Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACINGS.xs,
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
