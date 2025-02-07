import {useCallback, useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {
  Card,
  Divider,
  HelperText,
  Icon,
  IconButton,
  Text,
  TextInput,
  Button,
} from 'react-native-paper';
import {PaperSelect} from 'react-native-paper-select';
import SelectionInput from '../../components/inputs/SelectionInput';
import {SheetManager} from 'react-native-actions-sheet';
import {kSheets} from '../../sheets';
import {
  FunctionalUseOfEnum,
  functionalUseOptionsMapping,
  GenderEnum,
  RoadCodeEnum,
  StructureTypeEnum,
  WardNumberEnum,
  YesNo,
  yesnoEnum,
} from '../../constants/enum';
import {getStringEnumKeys} from '../../helpers/enumHelper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import DatePicker from 'react-native-date-picker';
import dayjs from 'dayjs';
import {DateInput} from '../../components/inputs/DataInput';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';

const MAX_FILE_SIZE = 5e6;
export default function BuildingMapDetials() {
  const [errors, setErrors] = useState({
    ownerName: false,
    ownerPhone: false,
    genderState: false,
    mainBuilding: false,
    wardNumber: false,
    roadCode: false,
    houseAddress: false,
    taxCode: false,
    structureType: false,
    constructionDate: false,
    numOfFloors: false,
    functionalUseOfBuilding: false,
    numOfHouseholds: false,
    populationOfBuilding: false,
    isLowIncomeHouse: false,
    mainDrinkingSource: false,
    presenceOfToilet: false,
    file: false,
  });

  const [ownerInformation, setOwnerInformation] = useState({
    ownerName: '',
    genderState: {},
    ownerPhone: '',
  });
  console.log('OwnerInformation', ownerInformation);
  const [buildingInformation, setBuildingInformation] = useState({
    mainBuilding: {},
    binOfMainBuilding: {},
    wardNumber: {},
    roadCode: {},
    houseAddress: '',
    taxCode: '',
    structureType: {},
    surveyedDate: null,
    constructionDate: null,
    numOfFloors: '',
    functionalUseOfBuilding: {},
    useCategoryOfBuilding: {},
    officeName: '',
    numOfHouseholds: '',
    populationOfBuilding: '',
    malePopulation: '',
    femalePopulation: '',
    otherPopulation: '',
    damp: '',
    dafp: '',
    daop: '',
  });
  const [useCategoryOfBuildingState, setUseCategoryOfBuildingState] = useState(
    [],
  );
  console.log('useCategoryOfBuildingState', useCategoryOfBuildingState);
  // const getOptionsByFunctionalUse = functionalUse => {
  //   return (functionalUseOptionsMapping[functionalUse] || []).map(option => ({
  //     label: option,
  //     value: option,
  //   }));
  // };
  const [otherInformation, setOtherInformation] = useState({
    isLowIncomeHouse: {},
    locatedInLic: {},
    mainDrinkingSource: {},
    wellInPremises: {},
    swmCustomerId: '',
    presenceOfToilet: {},
  });
  const [asset, setAsset] = useState();
  const [open, setOpen] = useState(false);
  const [openConstruction, setOpenConstruction] = useState(false);
  const [isBinEnabled, setIsBinEnabled] = useState(false);
  console.log('asset', asset);
  const GenderOption = useMemo(
    () =>
      getStringEnumKeys(GenderEnum).map(key => ({
        label: key,
        value: GenderEnum[key],
      })),
    [],
  );

  const yesnoOption = useMemo(
    () =>
      getStringEnumKeys(yesnoEnum).map(key => ({
        label: key,
        value: yesnoEnum[key],
      })),
    [],
  );

  const wardNumberOption = useMemo(
    () =>
      getStringEnumKeys(WardNumberEnum).map(key => ({
        label: key,
        value: WardNumberEnum[key],
      })),
    [],
  );

  const roadCodeOption = useMemo(
    () =>
      getStringEnumKeys(RoadCodeEnum).map(key => ({
        label: key,
        value: RoadCodeEnum[key],
      })),
    [],
  );

  const structureTypeOption = useMemo(
    () =>
      getStringEnumKeys(StructureTypeEnum).map(key => ({
        label: StructureTypeEnum[key],
        value: StructureTypeEnum[key],
      })),
    [],
  );

  const functionalUseOption = useMemo(
    () =>
      getStringEnumKeys(FunctionalUseOfEnum).map(key => ({
        label: FunctionalUseOfEnum[key],
        value: FunctionalUseOfEnum[key],
      })),
    [],
  );

  const getOptionsByFunctionalUse = useMemo(
    () => functionalUse => {
      return (functionalUseOptionsMapping[functionalUse] || []).map(option => ({
        label: option,
        value: option,
      }));
    },
    [],
  );
  const handleConfirm = useCallback(selectedDate => {
    setOpen(false);
    setBuildingInformation(prevState => ({
      ...prevState,
      surveyedDate: selectedDate,
    }));
  }, []);

  const handleCancel = useCallback(() => {
    setOpen(false);
  }, []);

  const handleConfirmConstruction = useCallback(selectedDate => {
    setOpenConstruction(false);
    setBuildingInformation(prevState => ({
      ...prevState,
      constructionDate: selectedDate,
    }));
  }, []);
  const handleCancelConstruction = useCallback(() => {
    setOpenConstruction(false);
  }, []);

  const onPressGender = async () => {
    const payload = await SheetManager.show(kSheets.selectionSheet, {
      payload: {
        title: 'Select your gender',
        options: GenderOption,
        selectedOption: ownerInformation.genderState,
      },
    });

    if (payload) {
      setOwnerInformation(prevState => ({
        ...prevState,
        genderState: payload,
      }));
    }
  };
  const onPressMainBuilding = async () => {
    const payload = await SheetManager.show(kSheets.selectionSheet, {
      payload: {
        title: 'Main Building',
        options: yesnoOption,
        selectedOption: buildingInformation.mainBuilding,
      },
    });

    if (payload) {
      if (payload.label === YesNo.No) {
        setIsBinEnabled(true);
      } else {
        setIsBinEnabled(false);
        setBuildingInformation(prevState => ({
          ...prevState,
          binOfMainBuilding: {},
        }));
      }
      setBuildingInformation(prevState => ({
        ...prevState,
        mainBuilding: payload,
      }));
    }
  };
  const onPressBinOfMainBuilding = async () => {
    const payload = await SheetManager.show(kSheets.selectionSheet, {
      payload: {
        title: 'BIN of Main Building',
        options: roadCodeOption,
        selectedOption: buildingInformation.binOfMainBuilding,
      },
    });

    if (payload) {
      setBuildingInformation(prevState => ({
        ...prevState,
        binOfMainBuilding: payload,
      }));
    }
  };
  const onPressWardNumber = async () => {
    const payload = await SheetManager.show(kSheets.selectionSheet, {
      payload: {
        title: 'Ward Number',
        options: wardNumberOption,
        selectedOption: buildingInformation.wardNumber,
      },
    });

    if (payload) {
      setBuildingInformation(prevState => ({
        ...prevState,
        wardNumber: payload,
      }));
    }
  };
  const onPressRoadCode = async () => {
    const payload = await SheetManager.show(kSheets.selectionSheet, {
      payload: {
        title: 'Road Code',
        options: roadCodeOption,
        selectedOption: buildingInformation.roadCode,
      },
    });

    if (payload) {
      setBuildingInformation(prevState => ({
        ...prevState,
        roadCode: payload,
      }));
    }
  };
  const onPressStructureType = async () => {
    const payload = await SheetManager.show(kSheets.selectionSheet, {
      payload: {
        title: 'Structure Type',
        options: structureTypeOption,
        selectedOption: buildingInformation.structureType,
      },
    });

    if (payload) {
      setBuildingInformation(prevState => ({
        ...prevState,
        structureType: payload,
      }));
    }
  };
  const onPressFunctionalUse = async () => {
    const payload = await SheetManager.show(kSheets.selectionSheet, {
      payload: {
        title: 'Functional Use of Building',
        options: functionalUseOption,
        selectedOption: buildingInformation.functionalUseOfBuilding,
      },
    });

    if (payload) {
      const dynamicOptions = getOptionsByFunctionalUse(payload.label);
      setUseCategoryOfBuildingState(dynamicOptions);
      setBuildingInformation(prevState => ({
        ...prevState,
        functionalUseOfBuilding: payload,
        useCategoryOfBuilding: {},
      }));
    }
  };
  const onPressUseCaseOfBuilding = async () => {
    const payload = await SheetManager.show(kSheets.selectionSheet, {
      payload: {
        title: 'Use Case of Building',
        options: useCategoryOfBuildingState,
        selectedOption: buildingInformation.useCategoryOfBuilding,
      },
    });

    if (payload) {
      setBuildingInformation(prevState => ({
        ...prevState,
        useCategoryOfBuilding: payload,
      }));
    }
  };

  const onPressIsLowInc = async () => {
    const payload = await SheetManager.show(kSheets.selectionSheet, {
      payload: {
        title: 'Is Low Income House',
        options: yesnoOption,
        selectedOption: otherInformation.isLowIncomeHouse,
      },
    });

    if (payload) {
      setOtherInformation(prevState => ({
        ...prevState,
        isLowIncomeHouse: payload,
      }));
    }
  };
  const onPressLicLocated = async () => {
    const payload = await SheetManager.show(kSheets.selectionSheet, {
      payload: {
        title: 'Located at LIC',
        options: yesnoOption,
        selectedOption: otherInformation.locatedInLic,
      },
    });

    if (payload) {
      setOtherInformation(prevState => ({
        ...prevState,
        locatedInLic: payload,
      }));
    }
  };
  const onPressDrinkingSource = async () => {
    const payload = await SheetManager.show(kSheets.selectionSheet, {
      payload: {
        title: 'Main Drinking Water Source',
        options: roadCodeOption,
        selectedOption: otherInformation.mainDrinkingSource,
      },
    });

    if (payload) {
      setOtherInformation(prevState => ({
        ...prevState,
        mainDrinkingSource: payload,
      }));
    }
  };
  const onPressWellInPremises = async () => {
    const payload = await SheetManager.show(kSheets.selectionSheet, {
      payload: {
        title: 'Well in Premises',
        options: yesnoEnum,
        selectedOption: otherInformation.wellInPremises,
      },
    });

    if (payload) {
      setOtherInformation(prevState => ({
        ...prevState,
        wellInPremises: payload,
      }));
    }
  };
  const onPressToiletPresence = async () => {
    const payload = await SheetManager.show(kSheets.selectionSheet, {
      payload: {
        title: 'Presence of Toilet',
        options: yesnoEnum,
        selectedOption: otherInformation.presenceOfToilet,
      },
    });

    if (payload) {
      setOtherInformation(prevState => ({
        ...prevState,
        presenceOfToilet: payload,
      }));
    }
  };
  const handleFilePicker = async () => {
    try {
      const pickedFile = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      console.log('PickedFile', pickedFile);

      if (pickedFile.uri && pickedFile.type) {
        if (pickedFile.size && pickedFile.size <= MAX_FILE_SIZE) {
          setAsset({
            name: pickedFile.name,
            type: pickedFile.type,
            uri: pickedFile.uri,
          });
          setErrors(prevState => ({...prevState, file: false}));
        } else {
          setErrors(prevState => ({...prevState, file: true}));
        }
      }
      console.log('pickedFile', pickedFile);
    } catch (e) {}
  };

  const handlePopulationChange = (field, text) => {
    setBuildingInformation(prevState => ({
      ...prevState,
      [field]: text,
    }));
  };

  const totalPopulation = useMemo(() => {
    const malePopulation = Number(buildingInformation.malePopulation) || 0;
    const femalePopulation = Number(buildingInformation.femalePopulation) || 0;
    const otherPopulation = Number(buildingInformation.otherPopulation) || 0;
    return String(malePopulation + femalePopulation + otherPopulation);
  }, [
    buildingInformation.malePopulation,
    buildingInformation.femalePopulation,
    buildingInformation.otherPopulation,
  ]);

  // Update the total population only when the individual populations change
  useEffect(() => {
    setBuildingInformation(prevState => ({
      ...prevState,
      populationOfBuilding: totalPopulation,
    }));
  }, [totalPopulation]);

  const onPressSubmit = async () => {
    if (!isValid()) return;
    try {
      console.log('Valid!!');
    } catch (error) {}
  };
  const isValid = () => {
    let isValid = true;

    if (!ownerInformation.ownerPhone) {
      setErrors(prevState => ({...prevState, ownerPhone: true}));
      isValid = false;
    }

    if (!ownerInformation.genderState) {
      setErrors(prevState => ({...prevState, genderState: true}));
      isValid = false;
    }
    if (!ownerInformation.mainBuilding) {
      setErrors(prevState => ({...prevState, mainBuilding: true}));
      isValid = false;
    }
    if (!buildingInformation.wardNumber) {
      setErrors(prevState => ({...prevState, wardNumber: true}));
      isValid = false;
    }
    if (!buildingInformation.roadCode) {
      setErrors(prevState => ({...prevState, roadCode: true}));
      isValid = false;
    }

    if (!buildingInformation.houseAddress) {
      setErrors(prevState => ({...prevState, houseAddress: true}));
      isValid = false;
    }
    if (!buildingInformation.taxCode) {
      setErrors(prevState => ({...prevState, taxCode: true}));
      isValid = false;
    }
    if (!buildingInformation.structureType) {
      setErrors(prevState => ({...prevState, structureType: true}));
      isValid = false;
    }
    if (!buildingInformation.constructionDate) {
      setErrors(prevState => ({...prevState, constructionDate: true}));
      isValid = false;
    }

    if (!buildingInformation.numOfFloors) {
      setErrors(prevState => ({...prevState, numOfFloors: true}));
      isValid = false;
    }
    if (!buildingInformation.functionalUseOfBuilding) {
      setErrors(prevState => ({...prevState, functionalUseOfBuilding: true}));
      isValid = false;
    }
    if (!buildingInformation.numOfHouseholds) {
      setErrors(prevState => ({...prevState, numOfHouseholds: true}));
      isValid = false;
    }
    if (!buildingInformation.populationOfBuilding) {
      setErrors(prevState => ({...prevState, populationOfBuilding: true}));
      isValid = false;
    }

    if (!otherInformation.isLowIncomeHouse) {
      setErrors(prevState => ({...prevState, isLowIncomeHouse: true}));
      isValid = false;
    }
    if (!otherInformation.mainDrinkingSource) {
      setErrors(prevState => ({...prevState, mainDrinkingSource: true}));
      isValid = false;
    }
    if (!otherInformation.presenceOfToilet) {
      setErrors(prevState => ({...prevState, presenceOfToilet: true}));
      isValid = false;
    }
    if (!asset) {
      setErrors(prevState => ({...prevState, file: true}));
      isValid = false;
    }

    return isValid;
  };
  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={true}
        style={{gap: 16}}>
        <View style={styles.detailsArea}>
          <Text variant="titleLarge">Owner Information</Text>

          <TextInput
            autoCapitalize="none"
            label={'Owner Name *'}
            value={ownerInformation.ownerName}
            onChangeText={text => {
              setOwnerInformation(prevState => ({
                ...prevState,
                ownerName: text,
              }));
              setErrors(prevState => ({...prevState, ownerName: false}));
            }}
            error={errors.ownerName}
          />

          <SelectionInput
            label="Select you Gender *"
            value={ownerInformation?.genderState?.label}
            onPress={onPressGender}
          />

          <TextInput
            label={'Owner Contact Number *'}
            placeholder={'+977'}
            keyboardType="phone-pad"
            value={ownerInformation.ownerPhone}
            onChangeText={text => {
              setOwnerInformation(prevState => ({
                ...prevState,
                ownerPhone: text,
              }));
              setErrors(prevState => ({...prevState, phone: false}));
            }}
            error={errors.ownerPhone}
          />
        </View>

        <View style={styles.buildingInfoArea}>
          <Text variant="titleLarge">Building Information</Text>

          <SelectionInput
            label="Main Building *"
            value={buildingInformation?.mainBuilding?.label}
            onPress={onPressMainBuilding}
          />
          {!!isBinEnabled && (
            <SelectionInput
              label="BIN of Main Building *"
              value={buildingInformation?.binOfMainBuilding?.label}
              onPress={onPressBinOfMainBuilding}
            />
          )}

          <SelectionInput
            label="Ward Number *"
            value={buildingInformation?.wardNumber?.label}
            onPress={onPressWardNumber}
          />

          <SelectionInput
            label="Road Code *"
            value={buildingInformation?.roadCode?.label}
            onPress={onPressRoadCode}
          />

          <TextInput
            autoCapitalize="none"
            label={'House Address *'}
            value={buildingInformation.houseAddress}
            onChangeText={text => {
              setBuildingInformation(prevState => ({
                ...prevState,
                houseAddress: text,
              }));
              setErrors(prevState => ({...prevState, houseAddress: false}));
            }}
            error={errors.houseAddress}
          />

          <TextInput
            autoCapitalize="none"
            label={'Tax Code/Holding ID *'}
            value={buildingInformation.taxCode}
            onChangeText={text => {
              setBuildingInformation(prevState => ({
                ...prevState,
                taxCode: text,
              }));
              setErrors(prevState => ({...prevState, taxCode: false}));
            }}
            error={errors.taxCode}
          />
          <SelectionInput
            label="Structure Type *"
            value={buildingInformation?.structureType?.label}
            onPress={onPressStructureType}
          />
          <DateInput
            label="Surveyed Date"
            value={buildingInformation.surveyedDate}
            onPress={() => setOpen(true)}
            error={false}
            isVisible={open}
            onDateConfirm={handleConfirm}
            onCancel={handleCancel}
          />

          <DateInput
            label="Construction Date *"
            value={buildingInformation.constructionDate}
            onPress={() => setOpenConstruction(true)}
            error={false}
            isVisible={openConstruction}
            onDateConfirm={handleConfirmConstruction}
            onCancel={handleCancelConstruction}
          />
          <TextInput
            keyboardType="numeric"
            autoCapitalize="none"
            label={'Number of Floors *'}
            value={buildingInformation.numOfFloors}
            onChangeText={text => {
              setBuildingInformation(prevState => ({
                ...prevState,
                numOfFloors: text,
              }));
              setErrors(prevState => ({...prevState, numOfFloors: false}));
            }}
            error={errors.numOfFloors}
          />
          <SelectionInput
            label="Functional Use of Building *"
            value={buildingInformation?.functionalUseOfBuilding?.label}
            onPress={onPressFunctionalUse}
          />
          {useCategoryOfBuildingState.length > 0 && (
            <SelectionInput
              label="Use Category of Building"
              value={buildingInformation?.useCategoryOfBuilding?.label}
              onPress={onPressUseCaseOfBuilding}
            />
          )}
          {buildingInformation.functionalUseOfBuilding?.label !==
            FunctionalUseOfEnum.Residential && (
            <TextInput
              autoCapitalize="none"
              label={'Office or Business Name'}
              value={buildingInformation.officeName}
              onChangeText={text => {
                setBuildingInformation(prevState => ({
                  ...prevState,
                  officeName: text,
                }));
                setErrors(prevState => ({...prevState, officeName: false}));
              }}
              error={errors.officeName}
            />
          )}
          {buildingInformation.functionalUseOfBuilding?.label !==
            FunctionalUseOfEnum.Community && (
            <>
              <TextInput
                keyboardType="numeric"
                autoCapitalize="none"
                label={'Number of Households *'}
                value={buildingInformation.numOfHouseholds}
                onChangeText={text => {
                  setBuildingInformation(prevState => ({
                    ...prevState,
                    numOfHouseholds: text,
                  }));
                  setErrors(prevState => ({
                    ...prevState,
                    numOfHouseholds: false,
                  }));
                }}
                error={errors.numOfHouseholds}
              />
              <TextInput
                keyboardType="numeric"
                autoCapitalize="none"
                label={'Population of Building *'}
                value={buildingInformation.populationOfBuilding}
                onChangeText={text => {
                  setBuildingInformation(prevState => ({
                    ...prevState,
                    populationOfBuilding: text,
                  }));
                  setErrors(prevState => ({
                    ...prevState,
                    populationOfBuilding: false,
                  }));
                }}
                error={errors.populationOfBuilding}
              />
              <TextInput
                keyboardType="numeric"
                autoCapitalize="none"
                label={'Male Population'}
                value={buildingInformation.malePopulation}
                onChangeText={text =>
                  handlePopulationChange('malePopulation', text)
                }
              />
              <TextInput
                keyboardType="numeric"
                autoCapitalize="none"
                label={'Female Population'}
                value={buildingInformation.femalePopulation}
                onChangeText={text =>
                  handlePopulationChange('femalePopulation', text)
                }
              />
              <TextInput
                keyboardType="numeric"
                autoCapitalize="none"
                label={'Other Population'}
                value={buildingInformation.otherPopulation}
                onChangeText={text =>
                  handlePopulationChange('otherPopulation', text)
                }
              />
              <TextInput
                keyboardType="numeric"
                autoCapitalize="none"
                label={'Differently Abled Male Population'}
                value={buildingInformation.damp}
                onChangeText={text => {
                  setBuildingInformation(prevState => ({
                    ...prevState,
                    damp: text,
                  }));
                }}
              />
              <TextInput
                keyboardType="numeric"
                autoCapitalize="none"
                label={'Differently Abled Female Population'}
                value={buildingInformation.dafp}
                onChangeText={text => {
                  setBuildingInformation(prevState => ({
                    ...prevState,
                    dafp: text,
                  }));
                }}
              />
              <TextInput
                keyboardType="numeric"
                autoCapitalize="none"
                label={'Differently Abled Other Population'}
                value={buildingInformation.daop}
                onChangeText={text => {
                  setBuildingInformation(prevState => ({
                    ...prevState,
                    daop: text,
                  }));
                }}
              />
            </>
          )}
        </View>
        <View style={styles.licInfoArea}>
          <Text variant="titleLarge">LIC Information</Text>
          <SelectionInput
            label="Is Low Income House"
            value={otherInformation?.isLowIncomeHouse?.label}
            onPress={onPressIsLowInc}
          />
          <SelectionInput
            label="Located in LIC?"
            value={otherInformation?.locatedInLic?.label}
            onPress={onPressLicLocated}
          />
        </View>
        <View style={styles.licInfoArea}>
          <Text variant="titleLarge">Water Source Information</Text>
          <SelectionInput
            label="Main Drinking Water Source"
            value={otherInformation?.mainDrinkingSource?.label}
            onPress={onPressDrinkingSource}
          />
          <SelectionInput
            label="Well in Premises"
            value={otherInformation?.wellInPremises?.label}
            onPress={onPressWellInPremises}
          />
        </View>
        <View style={styles.licInfoArea}>
          <Text variant="titleLarge">Solid Waste Management Information</Text>
          <TextInput
            autoCapitalize="none"
            label={'SWM Customer ID'}
            value={otherInformation.swmCustomerId}
            onChangeText={text => {
              setOtherInformation(prevState => ({
                ...prevState,
                swmCustomerId: text,
              }));
            }}
          />
          <SelectionInput
            label="Presence of Toilet"
            value={otherInformation?.presenceOfToilet?.label}
            onPress={onPressToiletPresence}
          />
        </View>
        <View style={styles.licInfoArea}>
          {!!asset ? (
            <Card mode="contained">
              {asset?.type == 'image/jpeg' ? (
                <Card.Cover
                  source={{
                    uri: asset?.uri,
                  }}
                />
              ) : (
                <Card.Content style={styles.uploadImageCardContent}>
                  <Icon source={'file-document-outline'} size={36} />
                  <Text variant="bodyMedium">{asset?.name}</Text>
                </Card.Content>
              )}

              <IconButton
                mode="contained-tonal"
                icon={'trash-can-outline'}
                containerColor={'white'}
                iconColor={'red'}
                size={20}
                style={styles.removeBtn}
                onPress={() => setAsset(undefined)}
              />
            </Card>
          ) : (
            <Card
              mode="contained"
              style={[styles.uploadImageCard, errors.file && styles.errorCard]}
              onPress={handleFilePicker}>
              <Card.Content style={styles.uploadImageContainer}>
                <Icon source={'image-plus'} size={36} />
                <Text variant="labelLarge">Upload a file</Text>
              </Card.Content>
            </Card>
          )}
          {!asset && errors.file ? (
            <HelperText type="error">
              File size should not exceed 5MB
            </HelperText>
          ) : null}
        </View>
        <View style={styles.buttonArea}>
          <Button
            mode="contained"
            onPress={onPressSubmit}
            style={{borderRadius: 8}}>
            Next
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  buttonArea: {
    marginTop: 18,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  detailsArea: {
    gap: 10,
  },
  buildingInfoArea: {
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  licInfoArea: {
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  uploadImageCard: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  removeBtn: {
    position: 'absolute',
    right: 4,
    bottom: 4,
  },
  uploadImageContainer: {
    gap: 8,
    alignItems: 'center',
  },
  uploadImageCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 160,
  },
});

// const GenderOption = getStringEnumKeys(GenderEnum).map(key => ({
//   label: key,
//   value: GenderEnum[key],
// }));
// const yesnoOption = getStringEnumKeys(yesnoEnum).map(key => ({
//   label: key,
//   value: yesnoEnum[key],
// }));
// const wardNumberOption = getStringEnumKeys(WardNumberEnum).map(key => ({
//   label: key,
//   value: WardNumberEnum[key],
// }));
// const roadCodeOption = getStringEnumKeys(RoadCodeEnum).map(key => ({
//   label: key,
//   value: RoadCodeEnum[key],
// }));
// const structureTypeOption = getStringEnumKeys(StructureTypeEnum).map(key => ({
//   label: StructureTypeEnum[key],
//   value: StructureTypeEnum[key],
// }));
// const functionalUseOption = getStringEnumKeys(FunctionalUseOfEnum).map(key => ({
//   label: FunctionalUseOfEnum[key],
//   value: FunctionalUseOfEnum[key],
// }));
