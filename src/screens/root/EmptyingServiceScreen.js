// import { Picker } from "@react-native-picker/picker";
// import dayjs from "dayjs";
// import { Formik } from "formik";
// import React, { useEffect, useState } from "react";
// import {
//   Alert,
//   Image,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   TouchableHighlight,
//   View,
// } from "react-native";
// import DatePicker from "react-native-date-picker";
// import { launchCamera, launchImageLibrary } from "react-native-image-picker";
// import {
//   ActivityIndicator,
//   Button,
//   Caption,
//   Dialog,
//   HelperText,
//   Portal,
//   TextInput,
// } from "react-native-paper";
// import Icon from "react-native-vector-icons/Ionicons";
// import { useDispatch } from "react-redux";
// import * as Yup from "yup";
// import LoadingSpinner from "../../components/common/LoadingSpinner";
// import { INITIAL_LOCATION } from "../../core/constants/map";
// import { ROUTES } from "../../core/constants/routes";
// import { SPACINGS } from "../../core/theme";
// import { getCurrentLocation } from "../../helpers/location";
// import { askLocationPermission } from "../../helpers/permissions";
// import {
//   driversAPI,
//   emptiersAPI,
//   saveEmptyingServiceAPI,
//   treatmentPlantsAPI,
//   vacutugTypesAPI,
// } from "../../service/supervisor_service";
// import { resetToken } from "../../store/slices/auth.slice";

// export default function EmptyingServiceFormScreen({ navigation, route }) {
//   const { item } = route.params;
//   console.log("Item!!!!!FromEMptyingServiceSubmission", item);
//   const dispatch = useDispatch();
//   const [startTimeOpen, setStartTimeOpen] = useState(false);
//   const [endTimeOpen, setEndTimeOpen] = useState(false);
//   const [driver, setDriver] = useState({});
//   const [emptier, setEmptier] = useState({});
//   const [treatmentPlant, setTreatmentPlant] = useState([]);
//   const defaultImage =
//     "https://st3.depositphotos.com/23594922/31822/v/600/depositphotos_318221368-stock-illustration-missing-picture-page-for-website.jpg";
//   const [recieptImage, setRecieptImage] = useState(defaultImage);
//   const [houseImage, setHouseImage] = useState(defaultImage);
//   const [loading, setLoading] = useState(false);
//   const [dataLoading, setDataLoading] = useState(false);
//   const [receiptImageDialog, setReceiptImageDialog] = useState(false);
//   const [houseImageDialog, setHouseImageDialog] = useState(false);
//   const [vacutugTypes, setVacutugTypes] = useState([]);

//   const initialValues = {
//     //vacutugacc: false,
//     empty_date: "",
//     date: new Date(),
//     application_id: item.id,
//     vacutug_no: "",
//     place_of_disposal: "",
//     // capacity: '',
//     driver: "",
//     emptier1: "",
//     emptier2: "",
//     start_time: "",
//     end_time: "",
//     reqhrs: "",
//     reqtrips: "",
//     receipt_number: "",
//     total_cost: "",
//     volume_of_sludge: "",
//     vacutugTypes: "",
//     customer_name: "",
//     customer_gender: "",
//   };

//   console.log("id", item.id);

//   const [location, setLocation] = useState(INITIAL_LOCATION);

//   const fetchUserLocation = () => {
//     askLocationPermission(async () => {
//       const position = await getCurrentLocation();

//       setLocation({
//         ...location,
//         latitude: position.coords.latitude,
//         longitude: position.coords.longitude,
//       });
//     });
//   };

//   useEffect(() => {
//     navigation.setOptions({
//       title: `Emptying Service #${item.id}`,
//     });

//     loadData();
//     fetchUserLocation();

//     return () => {
//       setLoading(false);
//     };
//   }, []);

//   const option = {
//     mediaType: "photo",
//     quality: 0.1,
//     cameraType: "back",
//   };

//   //get driver list
//   const getDriver = () => {
//     driversAPI()
//       .then((res) => {
//         const { error, success, data } = res.data;
//         if (success) {
//           setDriver(data);
//         }
//       })
//       .catch((e) => {
//         if (e.response.status === 401) {
//           Alert.alert("401", "Please log in again.");
//           dispatch(resetToken());
//           return;
//         }
//         if (e.response.status === 500) {
//           Alert.alert(
//             "500",
//             "Something is wrong, please try again or at a later time."
//           );
//         }
//       })
//       .finally(() => {
//         setDataLoading(false);
//       });
//   };

//   //get emptier list
//   const getEmptiers = () => {
//     emptiersAPI()
//       .then((res) => {
//         const { error, success, data } = res.data;
//         if (success) {
//           setEmptier(data);
//         }
//       })
//       .catch((e) => {
//         if (e.response.status === 401) {
//           Alert.alert("401", "Please log in again.");
//           dispatch(resetToken());
//           return;
//         }
//         if (e.response.status === 500) {
//           Alert.alert(
//             "500",
//             "Something is wrong, please try again or at a later time."
//           );
//         }
//       })
//       .finally(() => {
//         setDataLoading(false);
//       });
//   };

//   //get treatment plant list
//   const getTreatmentPlant = () => {
//     treatmentPlantsAPI()
//       .then((res) => {
//         const { error, success, data } = res.data;
//         if (success) {
//           setTreatmentPlant(data["treatment-plants"]);
//         }
//       })
//       .catch((e) => {
//         console.log("Error", e);
//         if (e?.response?.status === 500) {
//           Alert.alert(
//             "500",
//             "Something is wrong, please try again or at a later time."
//           );
//         }
//       })
//       .finally(() => {
//         setDataLoading(false);
//       });
//   };

//   const getVacutugTypes = () => {
//     vacutugTypesAPI()
//       .then((res) => {
//         const { data, error, success } = res.data;

//         if (success) {
//           setVacutugTypes(data);
//         } else {
//           console.log(error);
//         }
//       })
//       .catch((e) => {})
//       .finally(() => setDataLoading(false));
//   };

//   const loadData = () => {
//     setDataLoading(true);
//     getDriver();
//     getEmptiers();
//     getTreatmentPlant();
//     getVacutugTypes();
//   };

//   //open camera
//   const openCamera = () => {
//     launchCamera(option, (res) => {
//       if (res.didCancel) {
//         setReceiptImageDialog(false);
//         return;
//       }

//       if (res.assets[0].fileSize > 500000) {
//         Alert.alert(
//           "File size error",
//           "The image size exceeds 5 MB, please try again."
//         );
//         return;
//       }

//       setRecieptImage(res.assets[0].uri);
//       setReceiptImageDialog(false);
//     });
//   };

//   //open house camera
//   const openHouseCamera = () => {
//     launchCamera(option, (res) => {
//       if (res.didCancel) {
//         setHouseImageDialog(false);
//         return;
//       }

//       if (res.assets[0].fileSize > 500000) {
//         Alert.alert(
//           "File size error",
//           "The image size exceeds 5 MB, please try again."
//         );
//         return;
//       }

//       setHouseImage(res.assets[0].uri);
//       setHouseImageDialog(false);
//     });
//   };

//   //select gallary
//   const openGallery = () => {
//     launchImageLibrary(option, (res) => {
//       if (res.didCancel) {
//         setReceiptImageDialog(false);
//         return;
//       }

//       if (res.assets[0].fileSize > 500000) {
//         Alert.alert(
//           "File size error",
//           "The image size exceeds 5 MB, please select lower size image."
//         );
//         return;
//       }

//       setRecieptImage(res.assets[0].uri);
//       setReceiptImageDialog(false);
//     });
//   };

//   //select gallary
//   const openHouseGallery = () => {
//     launchImageLibrary(option, (res) => {
//       if (res.didCancel) {
//         setHouseImageDialog(false);
//         return;
//       }

//       if (res.assets[0].fileSize > 500000) {
//         Alert.alert(
//           "File size error",
//           "The image size exceeds 5 MB, please select lower size image."
//         );
//         return;
//       }

//       setHouseImage(res.assets[0].uri);
//       setHouseImageDialog(false);
//     });
//   };

//   //resets receipt image after clicking close icon
//   const resetReceiptImage = () => {
//     setRecieptImage(defaultImage);
//   };

//   //resets house image after clicking close icon
//   const resetHouseImage = () => {
//     setHouseImage(defaultImage);
//   };

//   const FormSchema = Yup.object().shape({
//     start_time: Yup.string("Date required").required("Start time is required"),
//     end_time: Yup.string("Date required").required("End time is required"),
//     reqtrips: Yup.number("Please fill")
//       .required("Required trips is required")
//       .max(3, "Onlyu 3 trips are allowed.")
//       .typeError("The field only accepts numerical values."),
//     receipt_number: Yup.string("Please fill").required(
//       "Receipt number is required"
//     ),
//     total_cost: Yup.number("Please fill")
//       .required("Total cost is required")
//       .max(10000, "Exceeds maximum value")
//       .typeError("The field only accepts numerical values."),
//     volume_of_sludge: Yup.number("Please fill")
//       .required("Sludge volume is required")
//       .max(10, "Exceeds maximum value, enter value less than 10")
//       .typeError("The field only accepts numerical values."),
//     place_of_disposal: Yup.string().required("Select a place of disposal"),
//     vacutugTypes: Yup.string().required("Select vacutug capacity"),
//     driver: Yup.string().required("Select a driver"),
//     emptier1: Yup.string().required("Select emptier 1"),
//   });

//   const submitService = async (values, helpers) => {
//     setLoading(true);

//     if (values.end_time < values.start_time) {
//       Alert.alert("Error", "End time cannot preceed start time");

//       setLoading(false);
//       return;
//     }

//     let data = new FormData();

//     data.append("volume_of_sludge", values.volume_of_sludge);
//     data.append("vacutug_id", values.vacutugTypes);
//     data.append("place_of_disposal", values.place_of_disposal);
//     data.append("driver", values.driver);
//     data.append("emptier1", values.emptier1);
//     data.append("emptier2", values.emptier2);
//     data.append("start_time", values.start_time);
//     data.append("end_time", values.end_time);
//     data.append("no_of_trips", values.reqtrips);
//     data.append("receipt_number", values.receipt_number);
//     data.append("total_cost", values.total_cost);
//     data.append("application_id", values.application_id);

//     data.append("longitude", location.longitude);
//     data.append("latitude", location.latitude);

//     if (recieptImage === defaultImage) {
//       Alert.alert("No receipt image", "Receipt image is required");
//       setLoading(false);
//       return;
//     }

//     if (houseImage === defaultImage) {
//       Alert.alert("No house image", "House image is required");
//       setLoading(false);
//       return;
//     }

//     data.append("receipt_image", {
//       uri: recieptImage,
//       type: "image/jpeg",
//       name: "receipt_img.jpg",
//     });
//     data.append("house_image", {
//       uri: houseImage,
//       type: "image/jpeg",
//       name: "house_img.jpg",
//     });

//     saveEmptyingServiceAPI(data)
//       .then((response) => {
//         const { success, data, error } = response.data;

//         console.log("response ", response.data);

//         if (success) {
//           Alert.alert(
//             getLabel("Success"),
//             getLabel("The request has been successfully submitted.")
//           );
//           setLoading(false);
//           navigation.goBack();
//         } else {
//           if (error?.emptyingService) {
//             Alert.alert("Error", error.emptyingService);
//           }
//           if (error?.assessment) {
//             error.assessment.map((err) => {
//               Alert.alert("Errors", err[0]);
//             });

//             setLoading(false);
//           }
//         }
//       })
//       .catch((err) => {
//         console.log("post err", err?.response?.data);

//         setLoading(false);

//         const { errors } = err.response.data;

//         if (errors && Object.keys(errors).length >= 1) {
//           Object.entries(errors).map(([k, v]) => helpers.setErrors(k, v[0]));
//         }

//         if (err?.response?.status === 500) {
//           Alert.alert(
//             "500",
//             "Something is wrong, please try again or at a later time."
//           );
//         }
//       });
//   };

//   return (
//     <View style={styles.container}>
//       <LoadingSpinner isVisible={dataLoading} title="Loading data..." />
//       <ScrollView
//         keyboardShouldPersistTaps={"handled"}
//         contentContainerStyle={styles.contain}
//       >
//         <Formik
//           validateOnBlur={false}
//           // validationSchema={FormSchema}
//           initialValues={initialValues}
//           validateOnChange={false}
//           onSubmit={(values, helpers) => submitService(values, helpers)}
//           validationSchema={FormSchema}
//         >
//           {({
//             handleChange,
//             handleSubmit,
//             values,
//             setFieldValue,
//             errors,
//             touched,
//           }) => (
//             <>
//               <TextInput
//                 error={errors.volume_of_sludge}
//                 mode="outlined"
//                 onChangeText={handleChange("volume_of_sludge")}
//                 style={styles.input_style}
//                 label="Sludge Volume (m3)*"
//                 placeholder="Sludge Volume (m3)*"
//                 value={values.volume_of_sludge}
//                 keyboa="number-pad"
//                 name="volume_of_sludge"
//               />
//               {errors.volume_of_sludge ? (
//                 <HelperText style={styles.errorText}>
//                   {errors.volume_of_sludge}
//                 </HelperText>
//               ) : null}
//               <View
//                 style={
//                   !errors.vacutugTypes
//                     ? styles.picker_style
//                     : styles.picker_error_style
//                 }
//               >
//                 <Picker
//                   style={{ borderColor: "#00ff00" }}
//                   key={values.vacutugTypes}
//                   selectedValue={values.vacutugTypes}
//                   onValueChange={(itemValue, itemIndex) => {
//                     setFieldValue("vacutugTypes", itemValue);
//                   }}
//                 >
//                   <Picker.Item
//                     color={errors.vacutugTypes ? "#ff0000" : "#767A7D"}
//                     label="Vacutug*"
//                     value=""
//                   />
//                   {vacutugTypes.map((item) => (
//                     <Picker.Item
//                       key={item.id}
//                       color="#292B2C"
//                       label={`${item.name}`}
//                       value={item.id}
//                     />
//                   ))}
//                 </Picker>
//               </View>
//               {errors.vacutugTypes ? (
//                 <HelperText style={styles.errorText}>
//                   {errors.vacutugTypes}
//                 </HelperText>
//               ) : null}

//               <View
//                 style={
//                   !errors.place_of_disposal
//                     ? styles.picker_style
//                     : styles.picker_error_style
//                 }
//               >
//                 <Picker
//                   key={values.place_of_disposal}
//                   themeVariant="light"
//                   selectedValue={values.place_of_disposal}
//                   onValueChange={(itemValue, itemIndex) => {
//                     setFieldValue("place_of_disposal", itemValue);
//                   }}
//                 >
//                   <Picker.Item
//                     color={errors.place_of_disposal ? "#ff0000" : "#767A7D"}
//                     label="Select Disposal Place *"
//                     value=""
//                   />
//                   {treatmentPlant.map((item) => (
//                     <Picker.Item
//                       key={item.id}
//                       label={item.name}
//                       color={errors.place_of_disposal ? "#292B2C" : "#292B2C"}
//                       value={item.id}
//                     />
//                   ))}
//                 </Picker>
//               </View>
//               {errors.place_of_disposal ? (
//                 <HelperText style={styles.errorText}>
//                   {errors.place_of_disposal}
//                 </HelperText>
//               ) : null}
//               <View
//                 style={
//                   !errors.driver
//                     ? styles.picker_style
//                     : styles.picker_error_style
//                 }
//               >
//                 <Picker
//                   key={values.driver}
//                   selectedValue={values.driver}
//                   onValueChange={(itemValue, itemIndex) => {
//                     setFieldValue("driver", itemValue);
//                   }}
//                 >
//                   <Picker.Item
//                     label="Select Driver*"
//                     color={errors.driver ? "#ff0000" : "#767A7D"}
//                     value=""
//                   />
//                   {Object.entries(driver)?.map((item, index) => {
//                     return (
//                       <Picker.Item
//                         key={Object.keys(driver)[index]}
//                         label={Object.values(driver)[index]}
//                         color="#292B2C"
//                         value={Object.keys(driver)[index]}
//                       />
//                     );
//                   })}
//                 </Picker>
//               </View>
//               {errors.driver ? (
//                 <HelperText style={styles.errorText}>
//                   {errors.driver}
//                 </HelperText>
//               ) : null}

//               <View
//                 style={
//                   !errors.emptier1
//                     ? styles.picker_style
//                     : styles.picker_error_style
//                 }
//               >
//                 <Picker
//                   key={values.emptier1}
//                   selectedValue={values.emptier1}
//                   onValueChange={(itemValue, itemIndex) => {
//                     setFieldValue("emptier1", itemValue);
//                   }}
//                 >
//                   <Picker.Item
//                     label="Select Emptier 1*"
//                     color={errors.emptier1 ? "#ff0000" : "#767A7D"}
//                     value=""
//                   />
//                   {Object.entries(emptier)?.map((item, index) => (
//                     <Picker.Item
//                       key={Object.keys(emptier)[index]}
//                       label={Object.values(emptier)[index]}
//                       color="#292B2C"
//                       value={Object.keys(emptier)[index]}
//                     />
//                   ))}
//                 </Picker>
//               </View>
//               {errors.emptier1 ? (
//                 <HelperText style={styles.errorText}>
//                   {errors.emptier1}
//                 </HelperText>
//               ) : null}

//               <View style={styles.picker_style}>
//                 <Picker
//                   key={values.emptier2}
//                   selectedValue={values.emptier2}
//                   onValueChange={(itemValue, itemIndex) => {
//                     setFieldValue("emptier2", itemValue);
//                   }}
//                 >
//                   <Picker.Item
//                     label="Select Emptier 2"
//                     color="#767A7D"
//                     value=""
//                   />
//                   {Object.entries(emptier)?.map((item, index) => (
//                     <Picker.Item
//                       key={Object.keys(emptier)[index]}
//                       label={Object.values(emptier)[index]}
//                       color="#292B2C"
//                       value={Object.keys(emptier)[index]}
//                     />
//                   ))}
//                 </Picker>
//               </View>

//               <Pressable onPress={() => setStartTimeOpen(true)}>
//                 <TextInput
//                   editable={false}
//                   error={errors.start_time}
//                   mode="outlined"
//                   onChangeText={handleChange("start_time")}
//                   style={styles.input_style}
//                   label="Start Time (HH:MM:SS)*"
//                   placeholder="Start Time (HH:MM:SS)*"
//                   value={values.start_time}
//                   name="start_time"
//                 />
//               </Pressable>

//               {errors.start_time ? (
//                 <HelperText style={styles.errorText}>
//                   {errors.start_time}
//                 </HelperText>
//               ) : null}
//               <DatePicker
//                 modal
//                 open={startTimeOpen}
//                 mode="time"
//                 style={styles.datepicker}
//                 date={values.date}
//                 onConfirm={(time) => {
//                   setStartTimeOpen(false);
//                   setFieldValue("start_time", dayjs(time).format("HH:mm:ss"));
//                 }}
//                 onCancel={() => setStartTimeOpen(false)}
//               />

//               <Pressable onPress={() => setEndTimeOpen(true)}>
//                 <TextInput
//                   editable={false}
//                   error={errors.end_time}
//                   mode="outlined"
//                   onChangeText={handleChange("end_time")}
//                   style={styles.input_style}
//                   label="End time (HH:MM:SS)*"
//                   placeholder="HH:MM:SS"
//                   value={values.end_time}
//                   name="end_time"
//                 />
//               </Pressable>

//               <DatePicker
//                 modal
//                 open={endTimeOpen}
//                 mode="time"
//                 style={styles.datepicker}
//                 date={values.date}
//                 onConfirm={(time) => {
//                   if (time.getTime() < new Date(values.start_time)) {
//                     Alert.alert("Ending time cannot preceed start time");
//                     return;
//                   }

//                   setEndTimeOpen(false);
//                   setFieldValue("end_time", dayjs(time).format("HH:mm:ss"));
//                 }}
//                 onCancel={() => setEndTimeOpen(false)}
//               />

//               {errors.end_time ? (
//                 <HelperText style={styles.errorText}>
//                   {errors.end_time}
//                 </HelperText>
//               ) : null}
//               <TextInput
//                 error={errors.reqtrips}
//                 mode="outlined"
//                 onChangeText={handleChange("reqtrips")}
//                 label="Required No Of Trips For Emptying*"
//                 style={styles.input_style}
//                 placeholder="Required No Of Trips For Emptying*"
//                 value={values.reqtrips}
//                 keyboardType="number-pad"
//                 name="reqtrips"
//               />
//               {errors.reqtrips ? (
//                 <HelperText style={styles.errorText}>
//                   {errors.reqtrips}
//                 </HelperText>
//               ) : null}
//               <TextInput
//                 error={errors.receipt_number}
//                 mode="outlined"
//                 onChangeText={handleChange("receipt_number")}
//                 label="Receipt Number *"
//                 style={styles.input_style}
//                 placeholder="Receipt Number *"
//                 value={values.receipt_number}
//                 keyboardType="number-pad"
//                 name="receipt_number"
//               />
//               {errors.receipt_number ? (
//                 <HelperText style={styles.errorText}>
//                   {errors.receipt_number}
//                 </HelperText>
//               ) : null}
//               <TextInput
//                 error={errors.total_cost}
//                 mode="outlined"
//                 onChangeText={handleChange("total_cost")}
//                 style={styles.input_style}
//                 label="Total Cost *"
//                 placeholder="Total Cost *"
//                 value={values.total_cost}
//                 keyboardType="number-pad"
//                 name="total_cost"
//               />
//               {errors.total_cost ? (
//                 <HelperText style={styles.errorText}>
//                   {errors.total_cost}
//                 </HelperText>
//               ) : null}

//               <Caption style={styles.caption}>Receipt Image*</Caption>
//               {/* if required <Button onPress={openCamera}> Camera</Button> */}
//               <View>
//                 <TouchableHighlight
//                   style={styles.highlight}
//                   onPress={() => setReceiptImageDialog(true)}
//                 >
//                   <Image
//                     source={{
//                       uri: recieptImage,
//                     }}
//                     style={styles.image}
//                   />
//                 </TouchableHighlight>
//                 <Icon
//                   name="close"
//                   size={30}
//                   color="#C81830"
//                   onPress={resetReceiptImage}
//                   style={styles.icon}
//                 />
//               </View>

//               <Caption style={styles.caption}>House Image* </Caption>
//               {/* if required <Button onPress={openHouseCamera}> Camera</Button> */}
//               <View>
//                 <TouchableHighlight
//                   style={styles.highlight}
//                   onPress={() => setHouseImageDialog(true)}
//                 >
//                   <Image
//                     source={{
//                       uri: houseImage,
//                     }}
//                     style={styles.image}
//                   />
//                 </TouchableHighlight>
//                 <Icon
//                   name="close"
//                   size={30}
//                   color="#C81830"
//                   onPress={resetHouseImage}
//                   style={styles.icon}
//                 />
//               </View>

//               <Button
//                 mode="contained"
//                 contentStyle={styles.btnContent_style}
//                 style={styles.btn_style}
//                 onPress={fetchUserLocation}
//               >
//                 Fetch current location
//               </Button>
//               <TextInput
//                 editable={false}
//                 mode="outlined"
//                 style={styles.input_style}
//                 label="Latitude"
//                 placeholder="Latitude"
//                 value={location.latitude.toString()}
//               />
//               <TextInput
//                 editable={false}
//                 mode="outlined"
//                 style={styles.input_style}
//                 label="Longitude"
//                 placeholder="Longitude"
//                 value={location.longitude.toString()}
//               />
//               <Button
//                 disabled={loading}
//                 icon={loading === false ? "send" : () => <ActivityIndicator />}
//                 mode="contained"
//                 contentStyle={styles.btnContent_style}
//                 style={[styles.btn_style, { marginBottom: 30 }]}
//                 onPress={handleSubmit}
//               >
//                 Submit
//               </Button>
//               <Portal>
//                 <Dialog
//                   visible={receiptImageDialog}
//                   onDismiss={() => setReceiptImageDialog(false)}
//                 >
//                   <Button onPress={openCamera}>Open camera</Button>
//                   <Button onPress={openGallery}>Choose from gallery</Button>
//                 </Dialog>
//               </Portal>
//               <Portal>
//                 <Dialog
//                   visible={houseImageDialog}
//                   onDismiss={() => setHouseImageDialog(false)}
//                 >
//                   <Button onPress={openHouseCamera}>Open camera</Button>
//                   <Button onPress={openHouseGallery}>
//                     Choose from gallery
//                   </Button>
//                 </Dialog>
//               </Portal>
//             </>
//           )}
//         </Formik>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   contain: {
//     padding: 10,
//   },
//   btn_style: {
//     marginTop: 10,
//     marginBottom: 10,
//   },
//   picker_style: {
//     borderColor: "#888",
//     borderWidth: 1,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   picker_error_style: {
//     borderColor: "#ff0033",
//     borderWidth: 1,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   input_style: {
//     backgroundColor: "#F6F4F4",
//     marginBottom: 10,
//   },
//   btnContent_style: {
//     paddingVertical: SPACINGS.xs,
//   },
//   highlight: {
//     alignSelf: "center",
//     width: 200,
//     height: 200,
//     marginTop: 5,
//   },
//   image: {
//     width: "100%",
//     height: "100%",
//   },
//   caption: {
//     textAlign: "center",
//     marginTop: 10,
//     fontSize: 20,
//   },
//   icon: {
//     position: "absolute",
//     left: "80%",
//   },
//   errorText: {
//     color: "#E01632",
//     paddingBottom: 15,
//   },
//   datepicker: {
//     backgroundColor: "#fff",
//   },
// });
