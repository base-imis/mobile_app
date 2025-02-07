import React, { useEffect } from "react";
import { StyleSheet, View, Pressable, Image, Alert } from "react-native";
import { ScrollView } from "react-native";
import theme, { COLORS } from "../../core/theme";
import {
  TextInput,
  Text,
  Button,
  Portal,
  Dialog,
  HelperText,
  Card,
  Icon,
  IconButton,
} from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import DatePicker from "react-native-date-picker";
import useEmptying from "../../hooks/useEmptying";
import dayjs from "dayjs";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { defaultImage } from "../../core/constants/urls";
import LoadingView from "../../components/common/LoadingView";
import colors, { lightTheme } from "../../core/theme/colors";
import { EmptyingFieldsEnum } from "../../constants/enum";
import { Header } from "../../components/headers";

const mode = "outlined";

const EmptyingSubmissionScreen = ({ route }) => {
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [endTimeOpen, setEndTimeOpen] = useState(false);
  const [image, setImage] = useState({
    name: "",
    open: false,
  });

  const { item } = route.params;

  const {
    formik,
    drivers,
    emptiers,
    treatmentPlants,
    vacutugs,
    vehicles,
    fetchTreatmentPlants,
    fetchVacugtugs,
    fetchDrivers,
    getEmptiers,
    fetchVehicles,
    fetchUserLocation,
  } = useEmptying(item);

  useEffect(() => {
    fetchDrivers();
    getEmptiers();
    fetchTreatmentPlants();
    fetchVacugtugs();
    fetchVehicles();
    fetchUserLocation();
  }, []);

  const {
    values,
    errors,
    isSubmitting,
    setFieldValue,
    handleChange,
    handleSubmit,
  } = formik;

  const {
    date,
    driver,
    emptier1,
    emptier2,
    end_time,
    house_image,
    no_of_trips,
    place_of_disposal,
    receipt_image,
    receipt_number,
    start_time,
    total_cost,
    vacutug_id,
    volume_of_sludge,
    comments,
    desludging_vehicle_id,
    distance_closest_well,
    emptying_reason,
    service_receiver_gender,
    service_receiver_name,
    treatment_plant_id,
    service_receiver_contact,
    latitude,
    longitude,
  } = values;

  const option = {
    mediaType: "photo",
    quality: 0.1,
    cameraType: "back",
    saveToPhotos: true,
  };

  const openCamera = (setFieldValue) => {
    launchCamera(option, (res) => {
      if (res.didCancel) return;

      if (res.assets[0].fileSize > 500000) {
        Alert.alert(
          "File size error",
          "The image size exceeds 5 MB, please try again."
        );
        return;
      } else if (res.assets[0].type === "image/png") {
        Alert.alert(
          "File format error",
          "The image must be in jpg format, please try again."
        );
        return;
      }

      console.log("assss", res.assets[0].fileName);

      setFieldValue(image.name, res.assets[0]);
    });
  };

  const openGallery = (setFieldValue) => {
    launchImageLibrary(option, (res) => {
      if (res.didCancel) return;

      if (res.assets[0].fileSize > 500000) {
        Alert.alert(
          "File size error",
          "The image size exceeds 5 MB, please try again."
        );
        return;
      } else if (res.assets[0].type === "image/png") {
        Alert.alert(
          "File format error",
          "The image must be in jpg format, please try again."
        );
        return;
      }

      setFieldValue(image.name, res.assets[0]);
    });
  };

  return (
    <View style={styles.mainCOntainer}>
      <Header title={`Emptying service #${route?.params?.item?.id}`} />
      <ScrollView style={styles.container}>
        <View style={{ gap: 12, paddingHorizontal: 4 }}>
          <TextInput
            label={EmptyingFieldsEnum.Date}
            editable={false}
            value={dayjs(date).format("DD MMMM YYYY")}
          />
          {errors.date && <HelperText type="error">{errors.date}</HelperText>}
          <DatePicker
            date={date}
            open={dateOpen}
            minimumDate={new Date()}
            modal
            mode="date"
            onCancel={() => setDateOpen(false)}
            onConfirm={(date) => {
              setDateOpen(false);
              setFieldValue("date", date);
            }}
          />
          <TextInput
            label={EmptyingFieldsEnum.ServiceReciverName}
            value={service_receiver_name}
            error={errors.service_receiver_name}
            onChangeText={handleChange("service_receiver_name")}
          />
          {errors.service_receiver_name && (
            <HelperText type="error">{errors.service_receiver_name}</HelperText>
          )}

          <View
            style={[
              styles.picker,
              {
                borderColor: errors?.service_receiver_gender
                  ? theme.colors.error
                  : null,
                borderBottomWidth: errors?.service_receiver_gender ? 2 : 0.5,
              },
            ]}
          >
            <Picker
              style={[styles.pickerTextStyle]}
              selectedValue={service_receiver_gender}
              onValueChange={(value) =>
                setFieldValue("service_receiver_gender", value)
              }
            >
              <Picker.Item
                label={EmptyingFieldsEnum.SelectReceiverGender}
                value=""
                color="#767A7D"
              />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Others" value="others" />
            </Picker>
          </View>
          {errors.service_receiver_gender && (
            <HelperText type="error">
              {errors.service_receiver_gender}
            </HelperText>
          )}

          <TextInput
            label={EmptyingFieldsEnum.ServiceReciverPhone}
            keyboardType="number-pad"
            value={service_receiver_contact}
            error={errors.service_receiver_contact}
            onChangeText={handleChange("service_receiver_contact")}
          />
          {errors.service_receiver_contact && (
            <HelperText type="error">
              {errors.service_receiver_contact}
            </HelperText>
          )}

          <TextInput
            label={EmptyingFieldsEnum.EmptyingReason}
            numberOfLines={4}
            multiline
            value={emptying_reason}
            error={errors.emptying_reason}
            onChangeText={handleChange("emptying_reason")}
          />
          {errors.emptying_reason && (
            <HelperText type="error">{errors.emptying_reason}</HelperText>
          )}

          <TextInput
            label="No. Of Trips *"
            keyboardType="number-pad"
            value={no_of_trips.toString()}
            error={errors.no_of_trips}
            onChangeText={handleChange("no_of_trips")}
          />
          {errors.no_of_trips && (
            <HelperText type="error">{errors.no_of_trips}</HelperText>
          )}

          <TextInput
            label={EmptyingFieldsEnum.Sludge}
            value={volume_of_sludge.toString()}
            onChangeText={handleChange("volume_of_sludge")}
            keyboardType="number-pad"
            error={errors.volume_of_sludge}
          />
          {errors.volume_of_sludge && (
            <HelperText type="error">{errors.volume_of_sludge}</HelperText>
          )}

          {/* <TextInput
            label={EmptyingFieldsEnum.DistanceToWell}
            keyboardType="number-pad"
            value={distance_closest_well.toString()}
            onChangeText={handleChange("distance_closest_well")}
            error={errors.distance_closest_well}
          />
          {errors.distance_closest_well && (
            <HelperText type="error">{errors.distance_closest_well}</HelperText>
          )} */}

          <View
            style={[
              styles.picker,
              {
                borderColor: errors?.desludging_vehicle_id
                  ? theme.colors.error
                  : null,
                borderBottomWidth: errors?.desludging_vehicle_id ? 2 : 0.5,
              },
            ]}
          >
            <Picker
              style={styles.pickerTextStyle}
              selectedValue={desludging_vehicle_id}
              onValueChange={(value) =>
                setFieldValue("desludging_vehicle_id", value)
              }
            >
              <Picker.Item
                label={EmptyingFieldsEnum.DesludginggVehicleNumber}
                value=""
                color="#767A7D"
              />
              {vehicles.map((item) => (
                <Picker.Item
                  key={item?.id}
                  value={item?.id}
                  label={`License plate ${item?.license_plate_number}/Capacity: ${item?.capacity}`}
                />
              ))}
            </Picker>
          </View>
          {errors.desludging_vehicle_id && (
            <HelperText type="error">{errors.desludging_vehicle_id}</HelperText>
          )}

          <View
            style={[
              styles.picker,
              {
                borderColor: errors?.driver ? theme.colors.error : null,
                borderBottomWidth: errors?.driver ? 2 : 0.5,
              },
            ]}
          >
            <Picker
              style={styles.pickerTextStyle}
              selectedValue={driver}
              onValueChange={(value) => setFieldValue("driver", value)}
            >
              <Picker.Item label="Select A Driver *" value="" color="#767A7D" />
              {drivers.map((item) => (
                <Picker.Item
                  key={item?.id}
                  value={item?.id}
                  label={item?.name}
                />
              ))}
            </Picker>
          </View>
          {errors.driver && (
            <HelperText type="error">{errors.driver}</HelperText>
          )}

          <View
            style={[
              styles.picker,
              {
                borderColor: errors?.emptier1 ? theme.colors.error : null,
                borderBottomWidth: errors?.emptier1 ? 2 : 0.5,
              },
            ]}
          >
            <Picker
              style={styles.pickerTextStyle}
              selectedValue={emptier1}
              onValueChange={(value) => setFieldValue("emptier1", value)}
            >
              <Picker.Item
                label="Select Emptier 1 *"
                value=""
                color="#767A7D"
              />
              {emptiers.map((item) => (
                <Picker.Item
                  key={item?.id}
                  value={item?.id}
                  label={item?.name}
                />
              ))}
            </Picker>
          </View>
          {errors.emptier1 && (
            <HelperText type="error">{errors.emptier1}</HelperText>
          )}

          <View
            style={[
              styles.picker,
              {
                borderColor: errors?.emptier2 ? theme.colors.error : null,
                borderBottomWidth: errors?.emptier2 ? 2 : 0.5,
              },
            ]}
          >
            <Picker
              style={styles.pickerTextStyle}
              selectedValue={emptier2}
              onValueChange={(value) => setFieldValue("emptier2", value)}
            >
              <Picker.Item label="Select Emptier 2" value="" color="#767A7D" />
              {emptiers.map((item) => (
                <Picker.Item
                  key={item?.id}
                  value={item?.id}
                  label={item?.name}
                />
              ))}
            </Picker>
          </View>
          {errors.emptier2 && (
            <HelperText type="error">{errors.emptier2}</HelperText>
          )}

          <Pressable onPress={() => setTimeOpen(true)}>
            <TextInput
              label="Start Time *"
              editable={false}
              error={errors.start_time}
              value={dayjs(start_time).format("HH:mm")}
            />
          </Pressable>
          {errors.start_time && (
            <HelperText type="error">{errors.start_time}</HelperText>
          )}

          <Pressable onPress={() => setEndTimeOpen(true)}>
            <TextInput
              label="End Time *"
              editable={false}
              error={errors.end_time}
              value={dayjs(end_time).format("HH:mm")}
            />
          </Pressable>
          {errors.end_time && (
            <HelperText type="error">{errors.end_time}</HelperText>
          )}

          <DatePicker
            date={start_time}
            open={timeOpen}
            modal
            mode="time"
            onCancel={() => setTimeOpen(false)}
            onConfirm={(date) => {
              setTimeOpen(false);
              console.log(date);
              setFieldValue("start_time", date);
            }}
          />
          <DatePicker
            date={end_time}
            open={endTimeOpen}
            modal
            mode="time"
            onCancel={() => setEndTimeOpen(false)}
            onConfirm={(date) => {
              setEndTimeOpen(false);
              setFieldValue("end_time", date);
            }}
          />

          <TextInput
            label="Receipt Number *"
            value={receipt_number}
            error={errors.receipt_number}
            onChangeText={handleChange("receipt_number")}
          />
          {errors.receipt_number && (
            <HelperText type="error">{errors.receipt_number}</HelperText>
          )}

          <TextInput
            label="Total Cost *"
            value={total_cost.toString()}
            keyboardType="number-pad"
            error={errors.total_cost}
            onChangeText={handleChange("total_cost")}
          />
          {errors.total_cost && (
            <HelperText type="error">{errors.total_cost}</HelperText>
          )}

          <View
            style={[
              styles.picker,
              {
                borderColor: errors?.treatment_plant_id
                  ? theme.colors.error
                  : null,
                borderBottomWidth: errors?.treatment_plant_id ? 2 : 0.5,
              },
            ]}
          >
            <Picker
              style={styles.pickerTextStyle}
              selectedValue={treatment_plant_id}
              onValueChange={(value) =>
                setFieldValue("treatment_plant_id", value)
              }
            >
              <Picker.Item
                label="Select A Disposal Place *"
                value=""
                color="#767A7D"
              />
              {treatmentPlants.map((item) => (
                <Picker.Item
                  key={item?.id}
                  value={item?.id}
                  label={item?.name}
                />
              ))}
            </Picker>
          </View>
          {errors.treatment_plant_id && (
            <HelperText type="error">{errors.treatment_plant_id}</HelperText>
          )}
          {item?.image_status == "false" && (
            <View style={styles.imgContainer}>
              {!!house_image ? (
                <Card mode="contained">
                  <Card.Cover
                    source={{
                      uri: house_image?.uri,
                    }}
                  />
                  <IconButton
                    mode="contained-tonal"
                    icon={"trash-can-outline"}
                    containerColor={"white"}
                    iconColor={"red"}
                    size={20}
                    style={styles.removeBtn}
                    onPress={() => setFieldValue("house_image", undefined)}
                  />
                </Card>
              ) : (
                <Card
                  mode="contained"
                  style={[
                    styles.uploadImageCard,
                    errors.house_image && styles.errorCard,
                  ]}
                  onPress={() => setImage({ open: true, name: "house_image" })}
                >
                  <Card.Content style={styles.uploadImageContainer}>
                    <Icon source={"image-plus"} size={36} />
                    <View style={{ alignItems: "center" }}>
                      <Text variant="labelLarge">Upload House Image</Text>
                      <Text variant="labelLarge">(Max 5MB)</Text>
                    </View>
                  </Card.Content>
                </Card>
              )}
              {!house_image && errors.house_image ? (
                <HelperText type="error">
                  File size should not exceed 5MB
                </HelperText>
              ) : null}
            </View>
          )}

          <View style={styles.imgContainer}>
            {!!receipt_image ? (
              <Card mode="contained">
                <Card.Cover
                  source={{
                    uri: receipt_image?.uri,
                  }}
                />

                <IconButton
                  mode="contained-tonal"
                  icon={"trash-can-outline"}
                  containerColor={"white"}
                  iconColor={"red"}
                  size={20}
                  style={styles.removeBtn}
                  onPress={() => setFieldValue("receipt_image", undefined)}
                />
              </Card>
            ) : (
              <Card
                mode="contained"
                style={[
                  styles.uploadImageCard,
                  errors.receipt_image && styles.errorCard,
                ]}
                onPress={() => setImage({ open: true, name: "receipt_image" })}
              >
                <Card.Content style={styles.uploadImageContainer}>
                  <Icon source={"image-plus"} size={36} />
                  <View style={{ alignItems: "center" }}>
                    <Text variant="labelLarge">Upload Receipt Image *</Text>
                    <Text variant="labelLarge">(Max 5MB)</Text>
                  </View>
                </Card.Content>
              </Card>
            )}
            {!receipt_image && errors.receipt_image ? (
              <HelperText type="error">
                File size should not exceed 5MB
              </HelperText>
            ) : null}
          </View>

          {/* <View style={styles.imgContainer}>
          <Text style={styles.text}>House image* (Max 2 MB)</Text>
          <Pressable
            onPress={() => setImage({open: true, name: 'house_image'})}
            style={styles.img}>
            <Image
              style={styles.img1}
              source={{
                uri: house_image ? house_image : defaultImage,
              }}
            />
          </Pressable>
        </View>
        {errors.house_image && (
          <HelperText type="error">{errors.house_image}</HelperText>
        )}

        <View style={styles.imgContainer}>
          <Text style={styles.text}>Receipt image* (Max 2 MB)</Text>
          <Pressable
            onPress={() => setImage({open: true, name: 'receipt_image'})}
            style={styles.img}>
            <Image
              style={styles.img1}
              source={{
                uri: receipt_image ? receipt_image : defaultImage,
              }}
            />
          </Pressable>
        </View>
        {errors.receipt_image && (
          <HelperText type="error">{errors.receipt_image}</HelperText>
        )} */}

          <Portal>
            <Dialog
              style={{
                justifyContent: "center",
                alignItems: "center",
                paddingBottom: 18,
              }}
              visible={image.open}
              onDismiss={() => setImage({ ...image, open: false })}
            >
              <Button
                onPress={() => {
                  setImage({ ...image, open: false });
                  openCamera(setFieldValue);
                }}
              >
                Open camera
              </Button>
              <Button
                onPress={() => {
                  setImage({ ...image, open: false });
                  openGallery(setFieldValue);
                }}
              >
                Choose from gallery
              </Button>
            </Dialog>
          </Portal>
          <TextInput
            label="Comments (If any)"
            numberOfLines={4}
            multiline
            value={comments}
            onChangeText={handleChange("comments")}
          />
          {errors.comments && (
            <HelperText type="error">{errors.comments}</HelperText>
          )}

          <Button
            disabled={isSubmitting}
            loading={isSubmitting}
            style={styles.btn}
            mode="contained"
            onPress={handleSubmit}
          >
            Submit
          </Button>
        </View>
        {isSubmitting && <LoadingView />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainCOntainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
    gap: 8,
  },
  pickerTextStyle: {
    color: lightTheme.colors.onSurfaceVariant,
  },
  input: {
    // marginVertical: 10,
    // backgroundColor: COLORS.background,
  },
  text: {
    marginVertical: 5,
  },
  img: {
    alignItems: "center",
    height: 200,
    width: "60%",
  },
  img1: {
    width: "100%",
    height: "100%",
  },
  btn: {
    marginVertical: 20,
  },
  picker: {
    backgroundColor: colors.fieldsColor,
    borderBottomColor: colors.darkGrey,
    borderBottomWidth: 0.6,
  },
  imgContainer: {
    gap: 10,
    // marginTop: 8,
    // paddingHorizontal: 8,
  },
  uploadImageCard: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderStyle: "dashed",
    borderRadius: 8,
  },
  errorCard: {
    borderColor: theme.colors.error,
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

export default EmptyingSubmissionScreen;

// import React, { useEffect, useState } from 'react';
// import { StyleSheet, View, Pressable, Alert, ScrollView } from 'react-native';
// import { TextInput, HelperText, Button, Picker, Card } from 'react-native-paper';
// import DatePicker from 'react-native-date-picker';
// import dayjs from 'dayjs';
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import useEmptying from '../../hooks/useEmptying';
// import { Header } from '../../components/headers';

// const EmptyingSubmissionScreen = ({ route }) => {
//   // Replacing Formik's state with useState hooks
//   const [volumeOfSludge, setVolumeOfSludge] = useState();
//   const [desludgingVehicleId, setDesludgingVehicleId] = useState();
//   const [treatmentPlantId, setTreatmentPlantId] = useState();
//   const [driver, setDriver] = useState();
//   const [emptier1, setEmptier1] = useState();
//   const [emptier2, setEmptier2] = useState();
//   const [startTime, setStartTime] = useState(new Date());
//   const [endTime, setEndTime] = useState(new Date());
//   const [noOfTrips, setNoOfTrips] = useState();
//   const [receiptNumber, setReceiptNumber] = useState();
//   const [totalCost, setTotalCost] = useState();
//   const [applicationId, setApplicationId] = useState()

//   const [serviceReceiverContact, setServiceReceiverContact] = useState();

//   const [emptyingReason, setEmptyingReason] = useState('');

//   const [date, setDate] = useState(new Date());
//   const [serviceReceiverName, setServiceReceiverName] = useState('');
//   const [serviceReceiverGender, setServiceReceiverGender] = useState('');
//   const [distanceClosestWell, setDistanceClosestWell] = useState('');

//   const [dateOpen, setDateOpen] = useState(false);
//   const [timeOpen, setTimeOpen] = useState(false);
//   const [endTimeOpen, setEndTimeOpen] = useState(false);

//   const { item } = route.params;
//   const {
//     drivers,
//     emptiers,
//     treatmentPlants,
//     vehicles,
//     fetchTreatmentPlants,
//     fetchDrivers,
//     fetchVacugtugs,
//     fetchVehicles,
//     fetchUserLocation
//   } = useEmptying(item);

//   useEffect(() => {
//     fetchDrivers();
//     fetchVacugtugs();
//     fetchTreatmentPlants();
//     fetchVehicles();
//     fetchUserLocation();
//   }, []);

//   const option = {
//     mediaType: 'photo',
//     quality: 0.1,
//     cameraType: 'back',
//   };

//   const openCamera = (setImageField) => {
//     launchCamera(option, res => {
//       if (res.didCancel) return;

//       if (res.assets[0].fileSize > 200000) {
//         Alert.alert(
//           'File size error',
//           'The image size exceeds 2 MB, please try again.',
//         );
//         return;
//       }

//       setImageField(res.assets[0].uri);
//     });
//   };

//   const openGallery = (setImageField) => {
//     launchImageLibrary(option, res => {
//       if (res.didCancel) return;

//       if (res.assets[0].fileSize > 200000) {
//         Alert.alert(
//           'File size error',
//           'The image size exceeds 2 MB, please try again.',
//         );
//         return;
//       }

//       setImageField(res.assets[0].uri);
//     });
//   };

//   const handleSubmit = () => {
//     // Handle form submission logic here
//     // Send the state values to your API or other logic
//     console.log({
//       date,
//       serviceReceiverName,
//       serviceReceiverGender,
//       serviceReceiverContact,
//       emptyingReason,
//       volumeOfSludge,
//       distanceClosestWell,
//       desludgingVehicleId,
//       treatmentPlantId,
//       driver,
//       emptier1,
//       emptier2,
//       startTime,
//       endTime,
//       noOfTrips,
//       receiptNumber,
//       totalCost,
//     });
//   };

//   return (
//     <View style={styles.mainContainer}>
//       <Header title={`Emptying service #${route?.params?.item?.id}`} />
//       <ScrollView style={styles.container}>
//         <View style={{ gap: 12, paddingHorizontal: 4 }}>
//           <TextInput
//             label="Date"
//             editable={false}
//             value={dayjs(date).format('DD MMMM YYYY')}
//           />
//           <DatePicker
//             date={date}
//             open={dateOpen}
//             modal
//             mode="date"
//             onCancel={() => setDateOpen(false)}
//             onConfirm={(date) => {
//               setDateOpen(false);
//               setDate(date);
//             }}
//           />

//           <TextInput
//             label="Service Receiver Name"
//             value={serviceReceiverName}
//             onChangeText={setServiceReceiverName}
//           />
//           <HelperText type="error">{/* Validation message */}</HelperText>

//           <View style={styles.picker}>
//             <Picker
//               selectedValue={serviceReceiverGender}
//               onValueChange={(value) => setServiceReceiverGender(value)}
//             >
//               <Picker.Item label="Select Gender" value="" />
//               <Picker.Item label="Male" value="M" />
//               <Picker.Item label="Female" value="F" />
//               <Picker.Item label="Others" value="O" />
//             </Picker>
//           </View>

//           <TextInput
//             label="Service Receiver Contact"
//             keyboardType="number-pad"
//             value={serviceReceiverContact}
//             onChangeText={setServiceReceiverContact}
//           />
//           <HelperText type="error">{/* Validation message */}</HelperText>

//           <TextInput
//             label="Emptying Reason"
//             multiline
//             numberOfLines={4}
//             value={emptyingReason}
//             onChangeText={setEmptyingReason}
//           />

//           <TextInput
//             label="Volume of Sludge"
//             keyboardType="number-pad"
//             value={volumeOfSludge}
//             onChangeText={setVolumeOfSludge}
//           />

//           <TextInput
//             label="Distance to Closest Well"
//             keyboardType="number-pad"
//             value={distanceClosestWell}
//             onChangeText={setDistanceClosestWell}
//           />

//           <View style={styles.picker}>
//             <Picker
//               selectedValue={desludgingVehicleId}
//               onValueChange={(value) => setDesludgingVehicleId(value)}
//             >
//               <Picker.Item label="Select Vehicle" value="" />
//               {vehicles.map((vehicle) => (
//                 <Picker.Item
//                   key={vehicle.id}
//                   label={`License plate ${vehicle.license_plate_number}`}
//                   value={vehicle.id}
//                 />
//               ))}
//             </Picker>
//           </View>

//           <Button onPress={handleSubmit}>Submit</Button>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   // Define your styles here
// });

// export default EmptyingSubmissionScreen;
