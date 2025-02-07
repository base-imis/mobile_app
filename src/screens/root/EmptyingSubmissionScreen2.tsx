// import {useCallback, useEffect, useMemo, useState} from 'react';
// import {Alert, ScrollView, StyleSheet, View} from 'react-native';
// import {
//   Card,
//   Divider,
//   HelperText,
//   Icon,
//   IconButton,
//   Text,
//   TextInput,
//   Button,
// } from 'react-native-paper';
// import SelectionInput from '../../components/inputs/SelectionInput';
// import {SheetManager} from 'react-native-actions-sheet';
// import {kSheets} from '../../sheets';
// import {
//   EmtyingFieldsEnum,
//   FunctionalUseOfEnum,
//   functionalUseOptionsMapping,
//   GenderEnum,
//   RoadCodeEnum,
//   StructureTypeEnum,
//   WardNumberEnum,
//   YesNo,
//   yesnoEnum,
// } from '../../constants/enum';
// import {getStringEnumKeys} from '../../helpers/enumHelper';
// import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
// import DatePicker from 'react-native-date-picker';
// import dayjs from 'dayjs';
// import {DateInput} from '../../components/inputs/DataInput';
// import DocumentPicker, {
//   DocumentPickerResponse,
// } from 'react-native-document-picker';
// import {treatmentPlantsAPI, vacutugTypesAPI} from '../../service/supervisor_service';
// import {useNavigation} from '@react-navigation/native';
// import {useDispatch} from 'react-redux';
// import {resetToken} from '../../store/slices/auth.slice';

// const MAX_FILE_SIZE = 5e6;
// export default function EmptyingSubmissionScreen2() {
//   const navigation = useNavigation();
//   const [errors, setErrors] = useState({
//     ownerName: false,
//     ownerPhone: false,
//     genderState: false,
//     mainBuilding: false,
//     wardNumber: false,
//     roadCode: false,
//     houseAddress: false,
//     taxCode: false,
//     structureType: false,
//     constructionDate: false,
//     numOfFloors: false,
//     functionalUseOfBuilding: false,
//     numOfHouseholds: false,
//     populationOfBuilding: false,
//     isLowIncomeHouse: false,
//     mainDrinkingSource: false,
//     presenceOfToilet: false,
//     file: false,
//   });

//   const [ownerInformation, setOwnerInformation] = useState({
//     ownerName: '',
//     genderState: {},
//     ownerPhone: '',
//   });
//   console.log('OwnerInformation', ownerInformation);
//   const [emptyingState, setEmptyingState] = useState({
//     date: null,
//     driver: {},
//     emptier1: {},
//     emptier2: {},
//     end_time: null,
//     no_of_trips: '',
//     place_of_disposal: {},
//     receipt_number: '',
//     start_time: {},
//     total_cost: {},
//     vacutug_id: '',
//     volume_of_sludge: '',
//     comments: '',
//     desludging_vehicle_id: '',
//     distance_closest_well: '',
//     emptying_reason: '',
//     service_receiver_gender: {},
//     service_receiver_name: '',
//     treatment_plant_id: '',
//     service_receiver_contact: '',
//     // latitude,
//     // longitude,
//   });
//   const [useCategoryOfBuildingState, setUseCategoryOfBuildingState] = useState(
//     [],
//   );
//   console.log('useCategoryOfBuildingState', useCategoryOfBuildingState);
//   // const getOptionsByFunctionalUse = functionalUse => {
//   //   return (functionalUseOptionsMapping[functionalUse] || []).map(option => ({
//   //     label: option,
//   //     value: option,
//   //   }));
//   // };
//   const [houseImageAsset, setHouseImageAsset] = useState();
//   const [receiptImageAsset, setReceiptImageAsset] = useState();

//   const [open, setOpen] = useState(false);
//   const [openConstruction, setOpenConstruction] = useState(false);
//   const [isBinEnabled, setIsBinEnabled] = useState(false);
//   const GenderOption = useMemo(
//     () =>
//       getStringEnumKeys(GenderEnum).map(key => ({
//         label: key,
//         value: GenderEnum[key],
//       })),
//     [],
//   );
//   const yesnoOption = useMemo(
//     () =>
//       getStringEnumKeys(yesnoEnum).map(key => ({
//         label: key,
//         value: yesnoEnum[key],
//       })),
//     [],
//   );

//   const wardNumberOption = useMemo(
//     () =>
//       getStringEnumKeys(WardNumberEnum).map(key => ({
//         label: key,
//         value: WardNumberEnum[key],
//       })),
//     [],
//   );

//   const roadCodeOption = useMemo(
//     () =>
//       getStringEnumKeys(RoadCodeEnum).map(key => ({
//         label: key,
//         value: RoadCodeEnum[key],
//       })),
//     [],
//   );

//   const structureTypeOption = useMemo(
//     () =>
//       getStringEnumKeys(StructureTypeEnum).map(key => ({
//         label: StructureTypeEnum[key],
//         value: StructureTypeEnum[key],
//       })),
//     [],
//   );

//   const functionalUseOption = useMemo(
//     () =>
//       getStringEnumKeys(FunctionalUseOfEnum).map(key => ({
//         label: FunctionalUseOfEnum[key],
//         value: FunctionalUseOfEnum[key],
//       })),
//     [],
//   );

//   //   const getOptionsByFunctionalUse = useMemo(
//   //     () => functionalUse => {
//   //       return (functionalUseOptionsMapping[functionalUse] || []).map(option => ({
//   //         label: option,
//   //         value: option,
//   //       }));
//   //     },
//   //     [],
//   //   );
//   //   const handleConfirm = useCallback(selectedDate => {
//   //     setOpen(false);
//   //     setBuildingInformation(prevState => ({
//   //       ...prevState,
//   //       date: selectedDate,
//   //     }));
//   //   }, []);

//   //   const handleCancel = useCallback(() => {
//   //     setOpen(false);
//   //   }, []);

//   //   const handleConfirmConstruction = useCallback(selectedDate => {
//   //     setOpenConstruction(false);
//   //     setBuildingInformation(prevState => ({
//   //       ...prevState,
//   //       constructionDate: selectedDate,
//   //     }));
//   //   }, []);
//   //   const handleCancelConstruction = useCallback(() => {
//   //     setOpenConstruction(false);
//   //   }, []);

//   const onCommonPress = async (optionList, selectorKey) => {
//     console.log('optionList', selectorKey);
//     if (optionList && selectorKey) {
//       const payload = await SheetManager.show(kSheets.selectionSheet, {
//         payload: {
//           title: EmtyingFieldsEnum.SelectReceiverGender,
//           options: optionList,
//           selectedOption: selectorKey,
//         },
//       });

//       if (payload) {
//         setEmptyingState(prevState => ({
//           ...prevState,
//           [selectorKey]: payload,
//         }));
//       }
//     }
//   };
//   //   const onPressGender = async () => {
//   //     const payload = await SheetManager.show(kSheets.selectionSheet, {
//   //       payload: {
//   //         title: EmtyingFieldsEnum.SelectReceiverGender,
//   //         options: GenderOption,
//   //         selectedOption: emptyingState.service_receiver_gender,
//   //       },
//   //     });

//   //     if (payload) {
//   //       setEmptyingState(prevState => ({
//   //         ...prevState,
//   //         service_receiver_gender: payload,
//   //       }));
//   //     }
//   //   };
//   //   const onPressMainBuilding = async () => {
//   //     const payload = await SheetManager.show(kSheets.selectionSheet, {
//   //       payload: {
//   //         title: 'Main Building',
//   //         options: yesnoOption,
//   //         selectedOption: buildingInformation.mainBuilding,
//   //       },
//   //     });

//   //     if (payload) {
//   //       if (payload.label === YesNo.No) {
//   //         setIsBinEnabled(true);
//   //       } else {
//   //         setIsBinEnabled(false);
//   //         setBuildingInformation(prevState => ({
//   //           ...prevState,
//   //           binOfMainBuilding: {},
//   //         }));
//   //       }
//   //       setBuildingInformation(prevState => ({
//   //         ...prevState,
//   //         mainBuilding: payload,
//   //       }));
//   //     }
//   //   };
//   //   const onPressBinOfMainBuilding = async () => {
//   //     const payload = await SheetManager.show(kSheets.selectionSheet, {
//   //       payload: {
//   //         title: 'BIN of Main Building',
//   //         options: roadCodeOption,
//   //         selectedOption: buildingInformation.binOfMainBuilding,
//   //       },
//   //     });

//   //     if (payload) {
//   //       setBuildingInformation(prevState => ({
//   //         ...prevState,
//   //         binOfMainBuilding: payload,
//   //       }));
//   //     }
//   //   };
//   //   const onPressWardNumber = async () => {
//   //     const payload = await SheetManager.show(kSheets.selectionSheet, {
//   //       payload: {
//   //         title: 'Ward Number',
//   //         options: wardNumberOption,
//   //         selectedOption: buildingInformation.wardNumber,
//   //       },
//   //     });

//   //     if (payload) {
//   //       setBuildingInformation(prevState => ({
//   //         ...prevState,
//   //         wardNumber: payload,
//   //       }));
//   //     }
//   //   };
//   //   const onPressRoadCode = async () => {
//   //     const payload = await SheetManager.show(kSheets.selectionSheet, {
//   //       payload: {
//   //         title: 'Road Code',
//   //         options: roadCodeOption,
//   //         selectedOption: buildingInformation.roadCode,
//   //       },
//   //     });

//   //     if (payload) {
//   //       setBuildingInformation(prevState => ({
//   //         ...prevState,
//   //         roadCode: payload,
//   //       }));
//   //     }
//   //   };
//   //   const onPressStructureType = async () => {
//   //     const payload = await SheetManager.show(kSheets.selectionSheet, {
//   //       payload: {
//   //         title: 'Structure Type',
//   //         options: structureTypeOption,
//   //         selectedOption: buildingInformation.structureType,
//   //       },
//   //     });

//   //     if (payload) {
//   //       setBuildingInformation(prevState => ({
//   //         ...prevState,
//   //         structureType: payload,
//   //       }));
//   //     }
//   //   };
//   //   const onPressFunctionalUse = async () => {
//   //     const payload = await SheetManager.show(kSheets.selectionSheet, {
//   //       payload: {
//   //         title: 'Functional Use of Building',
//   //         options: functionalUseOption,
//   //         selectedOption: buildingInformation.functionalUseOfBuilding,
//   //       },
//   //     });

//   //     if (payload) {
//   //       const dynamicOptions = getOptionsByFunctionalUse(payload.label);
//   //       setUseCategoryOfBuildingState(dynamicOptions);
//   //       setBuildingInformation(prevState => ({
//   //         ...prevState,
//   //         functionalUseOfBuilding: payload,
//   //         useCategoryOfBuilding: {},
//   //       }));
//   //     }
//   //   };
//   //   const onPressUseCaseOfBuilding = async () => {
//   //     const payload = await SheetManager.show(kSheets.selectionSheet, {
//   //       payload: {
//   //         title: 'Use Case of Building',
//   //         options: useCategoryOfBuildingState,
//   //         selectedOption: buildingInformation.useCategoryOfBuilding,
//   //       },
//   //     });

//   //     if (payload) {
//   //       setBuildingInformation(prevState => ({
//   //         ...prevState,
//   //         useCategoryOfBuilding: payload,
//   //       }));
//   //     }
//   //   };

//   //   const onPressIsLowInc = async () => {
//   //     const payload = await SheetManager.show(kSheets.selectionSheet, {
//   //       payload: {
//   //         title: 'Is Low Income House',
//   //         options: yesnoOption,
//   //         selectedOption: otherInformation.isLowIncomeHouse,
//   //       },
//   //     });

//   //     if (payload) {
//   //       setOtherInformation(prevState => ({
//   //         ...prevState,
//   //         isLowIncomeHouse: payload,
//   //       }));
//   //     }
//   //   };
//   //   const onPressLicLocated = async () => {
//   //     const payload = await SheetManager.show(kSheets.selectionSheet, {
//   //       payload: {
//   //         title: 'Located at LIC',
//   //         options: yesnoOption,
//   //         selectedOption: otherInformation.locatedInLic,
//   //       },
//   //     });

//   //     if (payload) {
//   //       setOtherInformation(prevState => ({
//   //         ...prevState,
//   //         locatedInLic: payload,
//   //       }));
//   //     }
//   //   };
//   //   const onPressDrinkingSource = async () => {
//   //     const payload = await SheetManager.show(kSheets.selectionSheet, {
//   //       payload: {
//   //         title: 'Main Drinking Water Source',
//   //         options: roadCodeOption,
//   //         selectedOption: otherInformation.mainDrinkingSource,
//   //       },
//   //     });

//   //     if (payload) {
//   //       setOtherInformation(prevState => ({
//   //         ...prevState,
//   //         mainDrinkingSource: payload,
//   //       }));
//   //     }
//   //   };
//   //   const onPressWellInPremises = async () => {
//   //     const payload = await SheetManager.show(kSheets.selectionSheet, {
//   //       payload: {
//   //         title: 'Well in Premises',
//   //         options: yesnoEnum,
//   //         selectedOption: otherInformation.wellInPremises,
//   //       },
//   //     });

//   //     if (payload) {
//   //       setOtherInformation(prevState => ({
//   //         ...prevState,
//   //         wellInPremises: payload,
//   //       }));
//   //     }
//   //   };
//   //   const onPressToiletPresence = async () => {
//   //     const payload = await SheetManager.show(kSheets.selectionSheet, {
//   //       payload: {
//   //         title: 'Presence of Toilet',
//   //         options: yesnoEnum,
//   //         selectedOption: otherInformation.presenceOfToilet,
//   //       },
//   //     });

//   //     if (payload) {
//   //       setOtherInformation(prevState => ({
//   //         ...prevState,
//   //         presenceOfToilet: payload,
//   //       }));
//   //     }
//   //   };
//   //   const handleFilePicker = async () => {
//   //     try {
//   //       const pickedFile = await DocumentPicker.pickSingle({
//   //         type: [DocumentPicker.types.allFiles],
//   //       });
//   //       console.log('PickedFile', pickedFile);

//   //       if (pickedFile.uri && pickedFile.type) {
//   //         if (pickedFile.size && pickedFile.size <= MAX_FILE_SIZE) {
//   //           setAsset({
//   //             name: pickedFile.name,
//   //             type: pickedFile.type,
//   //             uri: pickedFile.uri,
//   //           });
//   //           setErrors(prevState => ({...prevState, file: false}));
//   //         } else {
//   //           setErrors(prevState => ({...prevState, file: true}));
//   //         }
//   //       }
//   //       console.log('pickedFile', pickedFile);
//   //     } catch (e) {}
//   //   };

//   //   const handlePopulationChange = (field, text) => {
//   //     setBuildingInformation(prevState => ({
//   //       ...prevState,
//   //       [field]: text,
//   //     }));
//   //   };

//   //   const totalPopulation = useMemo(() => {
//   //     const malePopulation = Number(buildingInformation.malePopulation) || 0;
//   //     const femalePopulation = Number(buildingInformation.femalePopulation) || 0;
//   //     const otherPopulation = Number(buildingInformation.otherPopulation) || 0;
//   //     return String(malePopulation + femalePopulation + otherPopulation);
//   //   }, [
//   //     buildingInformation.malePopulation,
//   //     buildingInformation.femalePopulation,
//   //     buildingInformation.otherPopulation,
//   //   ]);

//   // Update the total population only when the individual populations change
//   //   useEffect(() => {
//   //     setBuildingInformation(prevState => ({
//   //       ...prevState,
//   //       populationOfBuilding: totalPopulation,
//   //     }));
//   //   }, [totalPopulation]);

//   //   const onPressSubmit = async () => {
//   //     if (!isValid()) return;
//   //     try {
//   //       console.log('Valid!!');
//   //     } catch (error) {}
//   //   };
//   //   const isValid = () => {
//   //     let isValid = true;

//   //     if (!ownerInformation.ownerPhone) {
//   //       setErrors(prevState => ({...prevState, ownerPhone: true}));
//   //       isValid = false;
//   //     }

//   //     if (!ownerInformation.genderState) {
//   //       setErrors(prevState => ({...prevState, genderState: true}));
//   //       isValid = false;
//   //     }
//   //     if (!ownerInformation.mainBuilding) {
//   //       setErrors(prevState => ({...prevState, mainBuilding: true}));
//   //       isValid = false;
//   //     }
//   //     if (!buildingInformation.wardNumber) {
//   //       setErrors(prevState => ({...prevState, wardNumber: true}));
//   //       isValid = false;
//   //     }
//   //     if (!buildingInformation.roadCode) {
//   //       setErrors(prevState => ({...prevState, roadCode: true}));
//   //       isValid = false;
//   //     }

//   //     if (!buildingInformation.houseAddress) {
//   //       setErrors(prevState => ({...prevState, houseAddress: true}));
//   //       isValid = false;
//   //     }
//   //     if (!buildingInformation.taxCode) {
//   //       setErrors(prevState => ({...prevState, taxCode: true}));
//   //       isValid = false;
//   //     }
//   //     if (!buildingInformation.structureType) {
//   //       setErrors(prevState => ({...prevState, structureType: true}));
//   //       isValid = false;
//   //     }
//   //     if (!buildingInformation.constructionDate) {
//   //       setErrors(prevState => ({...prevState, constructionDate: true}));
//   //       isValid = false;
//   //     }

//   //     if (!buildingInformation.numOfFloors) {
//   //       setErrors(prevState => ({...prevState, numOfFloors: true}));
//   //       isValid = false;
//   //     }
//   //     if (!buildingInformation.functionalUseOfBuilding) {
//   //       setErrors(prevState => ({...prevState, functionalUseOfBuilding: true}));
//   //       isValid = false;
//   //     }
//   //     if (!buildingInformation.numOfHouseholds) {
//   //       setErrors(prevState => ({...prevState, numOfHouseholds: true}));
//   //       isValid = false;
//   //     }
//   //     if (!buildingInformation.populationOfBuilding) {
//   //       setErrors(prevState => ({...prevState, populationOfBuilding: true}));
//   //       isValid = false;
//   //     }

//   //     if (!otherInformation.isLowIncomeHouse) {
//   //       setErrors(prevState => ({...prevState, isLowIncomeHouse: true}));
//   //       isValid = false;
//   //     }
//   //     if (!otherInformation.mainDrinkingSource) {
//   //       setErrors(prevState => ({...prevState, mainDrinkingSource: true}));
//   //       isValid = false;
//   //     }
//   //     if (!otherInformation.presenceOfToilet) {
//   //       setErrors(prevState => ({...prevState, presenceOfToilet: true}));
//   //       isValid = false;
//   //     }
//   //     if (!asset) {
//   //       setErrors(prevState => ({...prevState, file: true}));
//   //       isValid = false;
//   //     }

//   //     return isValid;
//   //   };
//   const dispatch = useDispatch();
//   const [desludgingVehicle, setDesludgingVehicle] = useState([]);
//   const [drivers, setDrivers] = useState([]);
//   const [emptiers, setEmptiers] = useState([]);
//   const [vacutugs, setVacutugs] = useState([]);
//   const [treatmentPlants, setTreatmentPlants] = useState([]);

//   console.log('desludgingVehicle', desludgingVehicle);
//   useEffect(() => {
//     fetchVehicles();
//   }, []);
//   const fetchVehicles = () => {
//     vacutugTypesAPI()
//       .then(res => {
//         const {success, data} = res?.data;

//         if (success) {
//           setDesludgingVehicle(data);
//         }
//       })
//       .catch(e => {
//         if (e.response.status === 401) {
//           Alert.alert('401', 'Please log in again.');
//           navigation.replace(ROUTES.signin_screen);
//           dispatch(resetToken());
//           return;
//         }
//         if (e.response.status === 500) {
//           Alert.alert(
//             '500',
//             'Something is wrong, please try again or at a later time.',
//           );
//         }
//       });
//   };
//   const fetchTreatmentPlants = () => {
//     treatmentPlantsAPI()
//       .then(res => {
//         const {error, success} = res.data;

//         if (success) {
//           setTreatmentPlants(res?.data?.data['treatment-plants']);
//         }
//       })
//       .catch(e => {
//         if (e.response.status === 401) {
//           Alert.alert('401', 'Please log in again.');
//           navigation.replace(ROUTES.signin_screen);
//           dispatch(resetToken());
//           return;
//         }
//         if (e.response.status === 500) {
//           Alert.alert(
//             '500',
//             'Something is wrong, please try again or at a later time.',
//           );
//         }
//       });
//   };
//   const handleConfirm = useCallback(selectedDate => {
//     setOpen(false);
//     setEmptyingState(prevState => ({
//       ...prevState,
//       date: selectedDate,
//     }));
//   }, []);

//   const handleCancel = useCallback(() => {
//     setOpen(false);
//   }, []);
//   return (
//     <View style={styles.container}>
//       <KeyboardAwareScrollView
//         showsVerticalScrollIndicator={true}
//         style={{gap: 16}}>
//         <DateInput
//           label="Surveyed Date"
//           value={emptyingState.date}
//           onPress={() => setOpen(true)}
//           error={false}
//           isVisible={open}
//           onDateConfirm={handleConfirm}
//           onCancel={handleCancel}
//         />
//         <TextInput
//           autoCapitalize="none"
//           label={EmtyingFieldsEnum.ServiceReciverName}
//           value={emptyingState.service_receiver_name}
//           onChangeText={text => {
//             setEmptyingState(prevState => ({
//               ...prevState,
//               service_receiver_name: text,
//             }));
//             setErrors(prevState => ({
//               ...prevState,
//               service_receiver_name: false,
//             }));
//           }}
//           error={errors.service_receiver_name}
//         />
//         <SelectionInput
//           label={EmtyingFieldsEnum.SelectReceiverGender}
//           value={emptyingState.service_receiver_gender?.label}
//           onPress={() => {
//             onCommonPress(GenderOption, emptyingState.service_receiver_gender),
//               setErrors(prevState => ({
//                 ...prevState,
//                 service_receiver_gender: false,
//               }));
//           }}
//           error={errors.service_receiver_gender}
//         />
//         <TextInput
//           autoCapitalize="none"
//           placeholder={'+977'}
//           keyboardType="phone-pad"
//           label={EmtyingFieldsEnum.ServiceReciverPhone}
//           value={emptyingState.service_receiver_contact}
//           onChangeText={text => {
//             setEmptyingState(prevState => ({
//               ...prevState,
//               service_receiver_contact: text,
//             }));
//             setErrors(prevState => ({
//               ...prevState,
//               service_receiver_contact: false,
//             }));
//           }}
//           error={errors.service_receiver_contact}
//         />
//         <TextInput
//           autoCapitalize="none"
//           numberOfLines={4}
//           label={EmtyingFieldsEnum.EmptyingReason}
//           value={emptyingState.emptying_reason}
//           onChangeText={text => {
//             setEmptyingState(prevState => ({
//               ...prevState,
//               emptying_reason: text,
//             }));
//             setErrors(prevState => ({
//               ...prevState,
//               emptying_reason: false,
//             }));
//           }}
//           error={errors.emptying_reason}
//         />
//         <TextInput
//           autoCapitalize="none"
//           label={EmtyingFieldsEnum.Sludge}
//           value={emptyingState.volume_of_sludge}
//           onChangeText={text => {
//             setEmptyingState(prevState => ({
//               ...prevState,
//               volume_of_sludge: text,
//             }));
//             setErrors(prevState => ({
//               ...prevState,
//               volume_of_sludge: false,
//             }));
//           }}
//           error={errors.volume_of_sludge}
//         />
//         <TextInput
//           autoCapitalize="none"
//           label={EmtyingFieldsEnum.DistanceToWell}
//           value={emptyingState.distance_closest_well}
//           onChangeText={text => {
//             setEmptyingState(prevState => ({
//               ...prevState,
//               distance_closest_well: text,
//             }));
//             setErrors(prevState => ({
//               ...prevState,
//               distance_closest_well: false,
//             }));
//           }}
//           error={errors.distance_closest_well}
//         />
//         <SelectionInput
//           label={EmtyingFieldsEnum.DesludginggVehicleNumber}
//           value={emptyingState.desludging_vehicle_id?.label}
//           onPress={() => {
//             onCommonPress(
//               desludgingVehicle,
//               emptyingState.desludging_vehicle_id,
//             ),
//               setErrors(prevState => ({
//                 ...prevState,
//                 desludging_vehicle_id: false,
//               }));
//           }}
//           error={errors.desludging_vehicle_id}
//         />

// <SelectionInput
//           label={EmtyingFieldsEnum.TreatmentPlantId}
//           value={emptyingState.treatment_plant_id?.label}
//           onPress={() => {
//             onCommonPress(
//               treatmentPlants,
//               emptyingState.treatment_plant_id,
//             ),
//               setErrors(prevState => ({
//                 ...prevState,
//                 treatment_plant_id: false,
//               }));
//           }}
//           error={errors.treatment_plant_id}
//         />

//       <View style={styles.picker}>
//         <Picker
//           selectedValue={driver}
//           onValueChange={value => setFieldValue('driver', value)}>
//           <Picker.Item label="Select A Driver" value="" color="#767A7D" />
//           {drivers.map(item => (
//             <Picker.Item key={item?.id} value={item?.id} label={item?.name} />
//           ))}
//         </Picker>
//       </View>
//       {errors.driver && <HelperText type="error">{errors.driver}</HelperText>}

//       <View style={styles.picker}>
//         <Picker
//           selectedValue={emptier1}
//           onValueChange={value => setFieldValue('emptier1', value)}>
//           <Picker.Item label="Select Emptier 1" value="" color="#767A7D" />
//           {emptiers.map(item => (
//             <Picker.Item key={item?.id} value={item?.id} label={item?.name} />
//           ))}
//         </Picker>
//       </View>
//       {errors.emptier1 && (
//         <HelperText type="error">{errors.emptier1}</HelperText>
//       )}

//       <View style={styles.picker}>
//         <Picker
//           selectedValue={emptier2}
//           onValueChange={value => setFieldValue('emptier2', value)}>
//           <Picker.Item label="Select Emptier 2" value="" color="#767A7D" />
//           {emptiers.map(item => (
//             <Picker.Item key={item?.id} value={item?.id} label={item?.name} />
//           ))}
//         </Picker>
//       </View>
//       {errors.emptier2 && (
//         <HelperText type="error">{errors.emptier2}</HelperText>
//       )}

//       <Pressable onPress={() => setTimeOpen(true)}>
//         <TextInput
//           style={styles.input}
//           mode={mode}
//           label="Start Time*"
//           editable={false}
//           value={dayjs(start_time).format('HH:mm')}
//         />
//       </Pressable>
//       {errors.start_time && (
//         <HelperText type="error">{errors.start_time}</HelperText>
//       )}

//       <Pressable onPress={() => setEndTimeOpen(true)}>
//         <TextInput
//           style={styles.input}
//           mode={mode}
//           label="End Time*"
//           editable={false}
//           value={dayjs(end_time).format('HH:mm')}
//         />
//       </Pressable>
//       {errors.end_time && (
//         <HelperText type="error">{errors.end_time}</HelperText>
//       )}

//       <DatePicker
//         date={start_time}
//         open={timeOpen}
//         modal
//         mode="time"
//         onCancel={() => setTimeOpen(false)}
//         onConfirm={date => {
//           setTimeOpen(false);
//           console.log(date);
//           setFieldValue('start_time', date);
//         }}
//       />
//       <DatePicker
//         date={end_time}
//         open={endTimeOpen}
//         modal
//         mode="time"
//         onCancel={() => setEndTimeOpen(false)}
//         onConfirm={date => {
//           setEndTimeOpen(false);
//           setFieldValue('end_time', date);
//         }}
//       />
//       <TextInput
//         style={styles.input}
//         mode={mode}
//         label="No. Of Trips*"
//         keyboardType="number-pad"
//         value={no_of_trips.toString()}
//         onChangeText={handleChange('no_of_trips')}
//       />
//       {errors.no_of_trips && (
//         <HelperText type="error">{errors.no_of_trips}</HelperText>
//       )}

//       <TextInput
//         style={styles.input}
//         mode={mode}
//         label="Receipt Number*"
//         value={receipt_number}
//         onChangeText={handleChange('receipt_number')}
//       />
//       {errors.receipt_number && (
//         <HelperText type="error">{errors.receipt_number}</HelperText>
//       )}

//       <TextInput
//         style={styles.input}
//         mode={mode}
//         label="Total Cost*"
//         value={total_cost.toString()}
//         keyboardType="number-pad"
//         onChangeText={handleChange('total_cost')}
//       />
//       {errors.total_cost && (
//         <HelperText type="error">{errors.total_cost}</HelperText>
//       )}

//       <View style={styles.imgContainer}>
//         <Text style={styles.text}>House image* (Max 2 MB)</Text>
//         <Pressable
//           onPress={() => setImage({open: true, name: 'house_image'})}
//           style={styles.img}>
//           <Image
//             style={styles.img1}
//             source={{
//               uri: house_image ? house_image : defaultImage,
//             }}
//           />
//         </Pressable>
//       </View>
//       {errors.house_image && (
//         <HelperText type="error">{errors.house_image}</HelperText>
//       )}

//       <View style={styles.imgContainer}>
//         <Text style={styles.text}>Receipt image* (Max 2 MB)</Text>
//         <Pressable
//           onPress={() => setImage({open: true, name: 'receipt_image'})}
//           style={styles.img}>
//           <Image
//             style={styles.img1}
//             source={{
//               uri: receipt_image ? receipt_image : defaultImage,
//             }}
//           />
//         </Pressable>
//       </View>
//       {errors.receipt_image && (
//         <HelperText type="error">{errors.receipt_image}</HelperText>
//       )}

//       <Portal>
//         <Dialog
//           visible={image.open}
//           onDismiss={() => setImage({...image, open: false})}>
//           <Button
//             onPress={() => {
//               setImage({...image, open: false});
//               openCamera(setFieldValue);
//             }}>
//             Open camera
//           </Button>
//           <Button
//             onPress={() => {
//               setImage({...image, open: false});
//               openGallery(setFieldValue);
//             }}>
//             Choose from gallery
//           </Button>
//         </Dialog>
//       </Portal>
//       <TextInput
//         style={styles.input}
//         mode={mode}
//         label="Comments (If any)"
//         numberOfLines={4}
//         multiline
//         value={comments}
//         onChangeText={handleChange('comments')}
//       />
//       {errors.comments && (
//         <HelperText type="error">{errors.comments}</HelperText>
//       )}

//       <Button
//         disabled={isSubmitting}
//         loading={isSubmitting}
//         style={styles.btn}
//         mode="contained"
//         onPress={handleSubmit}>
//         Submit
//       </Button>
//       {isSubmitting && <LoadingView />}
//       </KeyboardAwareScrollView>
//     </View>
//   );
// }
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//   },
//   buttonArea: {
//     marginTop: 18,
//     marginBottom: 24,
//     paddingHorizontal: 8,
//   },
//   detailsArea: {
//     gap: 10,
//   },
//   buildingInfoArea: {
//     gap: 10,
//     marginTop: 16,
//     paddingHorizontal: 8,
//   },
//   licInfoArea: {
//     gap: 10,
//     marginTop: 16,
//     paddingHorizontal: 8,
//   },
//   uploadImageCard: {
//     // backgroundColor: theme.colors.background,
//     borderWidth: 1,
//     // borderColor: theme.colors.outline,
//     borderStyle: 'dashed',
//     borderRadius: 8,
//   },
//   removeBtn: {
//     position: 'absolute',
//     right: 4,
//     bottom: 4,
//   },
//   uploadImageContainer: {
//     gap: 8,
//     alignItems: 'center',
//   },
//   uploadImageCardContent: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     height: 160,
//   },
// });

// // const GenderOption = getStringEnumKeys(GenderEnum).map(key => ({
// //   label: key,
// //   value: GenderEnum[key],
// // }));
// // const yesnoOption = getStringEnumKeys(yesnoEnum).map(key => ({
// //   label: key,
// //   value: yesnoEnum[key],
// // }));
// // const wardNumberOption = getStringEnumKeys(WardNumberEnum).map(key => ({
// //   label: key,
// //   value: WardNumberEnum[key],
// // }));
// // const roadCodeOption = getStringEnumKeys(RoadCodeEnum).map(key => ({
// //   label: key,
// //   value: RoadCodeEnum[key],
// // }));
// // const structureTypeOption = getStringEnumKeys(StructureTypeEnum).map(key => ({
// //   label: StructureTypeEnum[key],
// //   value: StructureTypeEnum[key],
// // }));
// // const functionalUseOption = getStringEnumKeys(FunctionalUseOfEnum).map(key => ({
// //   label: FunctionalUseOfEnum[key],
// //   value: FunctionalUseOfEnum[key],
// // }));
