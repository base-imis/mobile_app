import dayjs from 'dayjs';
import {Formik} from 'formik';
import React, {useEffect, useState} from 'react';
import DatePicker from 'react-native-date-picker';
import {Picker} from '@react-native-picker/picker';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  View,
} from 'react-native';
import {
  Caption,
  TextInput,
  Button,
  Checkbox,
  ActivityIndicator,
  HelperText,
  Portal,
  Dialog,
} from 'react-native-paper';

import {COLORS, SPACINGS} from '../../core/theme';
import {
  saveAssessmentServiceAPI,
  serviceProviderAPI,
  vacutugTypesAPI,
} from '../../service/supervisor_service';
import * as Yup from 'yup';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {ROUTES} from '../../core/constants/routes';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {useDispatch} from 'react-redux';
import {resetToken} from '../../store/slices/auth.slice';
import {Header} from '../../components/headers';

export default function ContainmentAssessmentScreen({navigation, route}) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const [serviceProvider, setServiceProvider] = useState([]);
  const [vacutugTypes, setVacutugTypes] = useState([]);
  const defaultImage =
    'https://st3.depositphotos.com/23594922/31822/v/600/depositphotos_318221368-stock-illustration-missing-picture-page-for-website.jpg';
  const [recieptImage, setRecieptImage] = useState(defaultImage);
  const [loading, setLoading] = useState(false);

  const [dataLoading, setDataLoading] = useState(false);

  const [houseImageDialog, setHouseImageDialog] = useState(false);

  const tomorrow = new Date();

  const {item} = route.params;

  const initialValues = {
    vacutugacc: true,
    proposed_emptying_date: '',
    date: new Date(),
    application_id: item.id,
    // servcode: '',
    rddist: '',
    rdwidth: '',
    sludgeasd: '',
    tank_length: '',
    tank_width: '',
    tank_depth: '',
    pit_number: '',
    pit_diameter: '',
    pit_depth: '',
    vacutugtypes: '',
    reqtrips: '',
    comments: '',
    estimated_cost: '',
    containment_type: item.containment_type,
    customer_name: '',
    customer_gender: '',
  };

  const option = {
    mediaType: 'photo',
    cameraType: 'back',
    quality: 0.1,
  };

  useEffect(() => {
    navigation.setOptions({
      title: `Containment Assessment #${item.application_id}`,
    });

    loadData();
  }, []);

  const getServiceProvider = () => {
    serviceProviderAPI()
      .then(res => {
        const {data, errors, success} = res.data;
        if (success) {
          setServiceProvider(data.serviceproviders);
        } else {
          console.log(errors);
        }
      })
      .catch(e => {})
      .finally(() => setDataLoading(false));
  };

  const getVacutugTypes = () => {
    vacutugTypesAPI()
      .then(res => {
        const {data, error, success} = res.data;
        console.log(res.data);

        if (success) {
          setVacutugTypes(data.vacutugtypes);
        } else {
          console.log(error);
        }
      })
      .catch(e => {})
      .finally(() => setDataLoading(false));
  };

  const loadData = () => {
    setDataLoading(true);

    getServiceProvider();

    getVacutugTypes();
  };

  const openCamera = () => {
    launchCamera(option, res => {
      if (res.didCancel) {
        setHouseImageDialog(false);
        return;
      }

      if (res.assets[0].fileSize > 500000) {
        Alert.alert(
          'File size error',
          'The image size exceeds 5 MB, please select lower size image.',
        );
        return;
      }

      setRecieptImage(res.assets[0].uri);
      setHouseImageDialog(false);
    });
  };

  const openGallery = () => {
    launchImageLibrary(option, res => {
      if (res.didCancel) {
        setHouseImageDialog(false);

        if (res.assets[0].fileSize > 500000) {
          Alert.alert(
            'File size error',
            'The image size exceeds 5 MB, please try again',
          );
          return;
        }
      }

      setRecieptImage(res.assets[0].uri);
      setHouseImageDialog(false);
    });
  };

  const FormSchema = Yup.object().shape({
    rddist: Yup.number('Please fill.')
      .required('Road distance is required')
      .max(10000, 'Exceeds the maximum distance range')
      .typeError('The field only accepts numerical values.'),
    rdwidth: Yup.number('Please fill')
      .required('Road width is required')
      .max(10000, 'Exceeds the maximum width range')
      .typeError('The field only accepts numerical values.'),
    sludgeasd: Yup.number('Please fill.')
      .required('Assessed sludge is required')
      .max(10000, 'Exceeds the maximum sludge value')
      .typeError('The field only accepts numerical values.'),
    tank_length: Yup.number('Please fill.')
      .max(10000, 'Exceeds maximum length value')
      .typeError('The field only accepts numerical values.')
      .when('containment_type', {
        is: value => value === 'Holding Tank' || value === 'Septic Tank',
        then: Yup.number().required('Tank length is required'),
      }),
    tank_width: Yup.number('Please fill.')
      .max(10000, 'Exceeds maximum length value')
      .typeError('The field only accepts numerical values.')
      .when('containment_type', {
        is: value => value === 'Holding Tank' || value === 'Septic Tank',
        then: Yup.number().required('Tank width is required'),
      }),
    tank_depth: Yup.number('Please fill.')
      .max(10000, 'Exceeds maximum length value')
      .typeError('The field only accepts numerical values.')
      .when('containment_type', {
        is: value => value === 'Holding Tank' || value === 'Septic Tank',
        then: Yup.number().required('Tank depth is required'),
      }),
    estimated_cost: Yup.number('Please fill')
      .required('Estimated cost is required')
      .typeError('The field only accepts numerical values.')
      .max(10000, 'Exceeds maximum estimated cost value'),
    reqtrips: Yup.number('Please fill')
      .required('Required trips is required')
      .max(10000, 'Exceeds maximum trips value'),
    proposed_emptying_date:
      Yup.string('Select a date').required('Select a date'),
    vacutugacc: Yup.boolean(),
    vacutugtypes: Yup.string('Select width').when('vacutugacc', {
      is: true,
      then: Yup.string().required('Select width and size'),
    }),
    pit_diameter: Yup.number('Please fill.')
      .max(10000, 'Exceeds maximum pit diameter value')
      .typeError('The field only accepts numerical values.')
      .when('containment_type', {
        is: 'Pit',
        then: Yup.number().required('Pit diameter is required'),
      }),
    pit_depth: Yup.number('Please fill.')
      .max(10000, 'Exceeds maximum pit depth value')
      .typeError('The field only accepts numerical values.')
      .when('containment_type', {
        is: 'Pit',
        then: Yup.number().required('Pit depth is required'),
      }),
    pit_number: Yup.number('Please fill.')
      .typeError('The field only accepts numerical values.')
      .max(10000, 'Exceeds maximum pit count value')
      .when('containment_type', {
        is: 'Pit',
        then: Yup.number().required('Pit number is required'),
      }),
    containment_type: Yup.string(),
    customer_name: Yup.string().required('Customer name is required'),
    customer_gender: Yup.string().required('Customer gender is required'),
  });

  const submitAssessment = async values => {
    values.vacutugwidth = values.vacutugtypes.split('/')[0];
    values.vacutugsz = values.vacutugtypes.split('/')[1];

    console.log('post ', values);

    setLoading(true);

    let data = new FormData();

    data.append('json', JSON.stringify([values]));

    if (recieptImage === defaultImage) {
      Alert.alert('No house image', 'House image is required');
      setLoading(false);
      return;
    }

    data.append('house_img', {
      uri: recieptImage,
      type: 'image/jpeg',
      name: 'house_img.jpg',
    });

    console.log('data ', data);

    saveAssessmentServiceAPI(data)
      .then(response => {
        const {success, data, error} = response.data;

        console.log('data ', response.data);

        if (success) {
          Alert.alert('Success', 'Assessment has been submitted');
          setLoading(false);
          navigation.goBack();
        } else {
          if (error?.assessment) {
            Alert.alert('Error', error.assessment);
            setLoading(false);
            return;
          }
        }
      })
      .catch(err => {
        setLoading(false);
        console.log('err ', err?.response);
        if (err?.response?.status === 500) {
          Alert.alert(
            '500',
            'Something is wrong, please try again or at a later time.',
          );
        }
      });
  };

  return (
    <View style={{flex: 1}}>
      <Header title="Containment Assessment" />
      <LoadingSpinner isVisible={dataLoading} title="Loading data.." />
      <ScrollView
        keyboardShouldPersistTaps={'handled'}
        contentContainerStyle={styles.container}>
        <Formik
          validationSchema={FormSchema}
          initialValues={initialValues}
          validateOnBlur={false}
          validateOnChange={false}
          onSubmit={values => submitAssessment(values)}>
          {({
            handleChange,
            handleSubmit,
            values,
            setFieldValue,
            errors,
            touched,
          }) => (
            <>
              {values.vacutugacc &&
              errors.vacutugtypes &&
              touched.vacutugtypes ? (
                <HelperText style={styles.errorText}>
                  {errors.vacutugtypes}
                </HelperText>
              ) : null}

              <TextInput
                error={errors.rddist && touched.rddist}
                mode="outlined"
                label="Distance From Road (m) *"
                style={styles.input_style}
                placeholder="Distance From Road (m) *"
                keyboardType="number-pad"
                onChangeText={handleChange('rddist')}
                value={values.rddist}
                name="rddist"
              />
              {errors.rddist && touched.rddist ? (
                <HelperText style={styles.errorText}>
                  {errors.rddist}
                </HelperText>
              ) : null}

              <TextInput
                error={errors.rdwidth && touched.rdwidth}
                mode="outlined"
                label="Road Width (m) *"
                style={styles.input_style}
                placeholder="Road Width (m) *"
                keyboardType="number-pad"
                onChangeText={handleChange('rdwidth')}
                value={values.rdwidth}
                name="rdwidth"
              />
              {errors.rdwidth && touched.rddist ? (
                <HelperText style={styles.errorText}>
                  {errors.rdwidth}
                </HelperText>
              ) : null}
              <TextInput
                error={errors.sludgeasd && touched.sludgeasd}
                mode="outlined"
                onChangeText={handleChange('sludgeasd')}
                style={styles.input_style}
                keyboardType="number-pad"
                label="Estimated Assessed Sludge (m3) *"
                placeholder="Estimated Assessed Sludge (m3) *"
                value={values.sludgeasd}
                name="sludgeasd"
              />
              {errors.sludgeasd && touched.sludgeasd ? (
                <HelperText style={styles.errorText}>
                  {errors.sludgeasd}
                </HelperText>
              ) : null}
              {item.containment_type === 'Septic Tank' ||
              item.containment_type === 'Holding Tank' ? (
                <>
                  <TextInput
                    error={errors.tank_length && touched.tank_length}
                    mode="outlined"
                    onChangeText={handleChange('tank_length')}
                    style={styles.input_style}
                    label="Septic Tank Length (m) *"
                    placeholder="Septic Tank Length (m) *"
                    keyboardType="number-pad"
                    value={values.tank_length}
                    name="tank_length"
                  />
                  {errors.tank_length && touched.tank_length ? (
                    <HelperText style={styles.errorText}>
                      {errors.tank_length}
                    </HelperText>
                  ) : null}
                  <TextInput
                    error={errors.tank_width && touched.tank_width}
                    mode="outlined"
                    onChangeText={handleChange('tank_width')}
                    style={styles.input_style}
                    label="Septic Tank Width (m) *"
                    keyboardType="number-pad"
                    placeholder="Septic Tank Width (m) *"
                    value={values.tank_width}
                    name="tank_width"
                  />
                  {errors.tank_width && touched.tank_width ? (
                    <HelperText style={styles.errorText}>
                      {errors.tank_width}
                    </HelperText>
                  ) : null}
                  <TextInput
                    error={errors.tank_depth && touched.tank_depth}
                    mode="outlined"
                    onChangeText={handleChange('tank_depth')}
                    label="Septic Tank Depth (m) *"
                    style={styles.input_style}
                    keyboardType="number-pad"
                    placeholder="Septic Tank Depth (m) *"
                    value={values.tank_depth}
                    name="tank_depth"
                  />
                  {errors.tank_depth && touched.tank_depth ? (
                    <HelperText style={styles.errorText}>
                      {errors.tank_depth}
                    </HelperText>
                  ) : null}
                </>
              ) : (
                <>
                  <TextInput
                    error={errors.pit_number && touched.pit_number}
                    mode="outlined"
                    onChangeText={handleChange('pit_number')}
                    label="No. of Pit *"
                    style={styles.input_style}
                    placeholder="No. of Pit *"
                    value={values.pit_number}
                    keyboardType="number-pad"
                    name="pit_number"
                  />
                  {errors.pit_number && touched.pit_number ? (
                    <HelperText style={styles.errorText}>
                      {errors.pit_number}
                    </HelperText>
                  ) : null}
                  <TextInput
                    error={errors.pit_diameter && touched.pit_diameter}
                    mode="outlined"
                    onChangeText={handleChange('pit_diameter')}
                    style={styles.input_style}
                    label="Pit Diamenter (m) *"
                    placeholder="Pit Diamenter (m) *"
                    value={values.pit_diameter}
                    keyboardType="number-pad"
                    name="pit_diameter"
                  />
                  {errors.pit_diameter && touched.pit_diameter ? (
                    <HelperText style={styles.errorText}>
                      {errors.pit_diameter}
                    </HelperText>
                  ) : null}
                  <TextInput
                    error={errors.pit_depth && touched.pit_depth}
                    mode="outlined"
                    onChangeText={handleChange('pit_depth')}
                    style={styles.input_style}
                    label="Pit Depth (m) *"
                    placeholder="Pit Depth (m) *"
                    value={values.pit_depth}
                    keyboardType="number-pad"
                    name="pit_depth"
                  />
                  {errors.pit_depth && touched.pit_depth ? (
                    <HelperText style={styles.errorText}>
                      {errors.pit_depth}
                    </HelperText>
                  ) : null}
                </>
              )}

              <Checkbox.Item
                color={COLORS.primary}
                label="Vacutug Accessibility?"
                onPress={() => setFieldValue('vacutugacc', !values.vacutugacc)}
                status={values.vacutugacc ? 'checked' : 'unchecked'}
              />
              {values.vacutugacc && (
                <>
                  <View
                    style={
                      errors.vacutugtypes && touched.vacutugtypes
                        ? styles.picker_error_style
                        : styles.picker_style
                    }>
                    <Picker
                      key={values.vacutugtypes}
                      selectedValue={values.vacutugtypes}
                      onValueChange={(itemValue, itemIndex) => {
                        setFieldValue('vacutugtypes', itemValue);
                      }}>
                      <Picker.Item
                        color={
                          errors.vacutugtypes && touched.vacutugtypes
                            ? '#ff0000'
                            : '#767A7D'
                        }
                        label="Select Vacutug Width (m)/ Size *"
                        value=""
                      />

                      {vacutugTypes.map(item => (
                        <Picker.Item
                          key={item.id}
                          color="#292B2C"
                          label={
                            item.vacutugwidth.toString() +
                            '/' +
                            item.vacutugsize.toString()
                          }
                          value={
                            item.vacutugwidth.toString() +
                            '/' +
                            item.vacutugsize.toString()
                          }
                        />
                      ))}
                    </Picker>
                  </View>
                  {values.vacutugacc &&
                  errors.vacutugtypes &&
                  touched.vacutugtypes ? (
                    <HelperText style={styles.errorText}>
                      {errors.vacutugtypes}
                    </HelperText>
                  ) : null}
                </>
              )}
              <TextInput
                style={styles.input_style}
                error={errors.reqtrips && touched.reqtrips}
                onChangeText={handleChange('reqtrips')}
                mode="outlined"
                label="Required Trips *"
                placeholder="Required Trips *"
                keyboardType="number-pad"
                name="reqtrips"
                value={values.reqtrips}
              />
              {errors.reqtrips && touched.reqtrips ? (
                <HelperText style={styles.errorText}>
                  {errors.reqtrips}
                </HelperText>
              ) : null}

              <Pressable onPress={() => setOpen(true)}>
                <TextInput
                  mode="outlined"
                  error={
                    errors.proposed_emptying_date &&
                    touched.proposed_emptying_date
                  }
                  editable={false}
                  style={styles.input_style}
                  label="Proposed Emptying Date(YYYY-MM-DD) *"
                  placeholder="Proposed Emptying Date(YYYY-MM-DD) *"
                  value={values.proposed_emptying_date}
                />
              </Pressable>
              {errors.proposed_emptying_date &&
              touched.proposed_emptying_date ? (
                <HelperText style={styles.errorText}>
                  {errors.proposed_emptying_date}
                </HelperText>
              ) : null}
              <DatePicker
                modal
                open={open}
                theme={'light'}
                mode="date"
                date={new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)}
                minimumDate={new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)}
                onConfirm={date => {
                  setOpen(false);
                  setFieldValue(
                    'proposed_emptying_date',
                    dayjs(date).format('YYYY-MM-DD'),
                  );
                  setFieldValue('date', date);
                }}
                onCancel={() => {
                  setOpen(false);
                }}
              />
              <TextInput
                error={errors.estimated_cost && touched.estimated_cost}
                style={styles.input_style}
                mode="outlined"
                onChangeText={handleChange('estimated_cost')}
                value={values.estimated_cost}
                label="Estimated Cost *"
                placeholder="Estimated Cost *"
                numberOfLines={3}
                keyboardType="number-pad"
                name="estimated_cost"
              />
              {errors.estimated_cost && touched.estimated_cost ? (
                <HelperText style={styles.errorText}>
                  {errors.estimated_cost}
                </HelperText>
              ) : null}
              {/* <Button title="Submit" onPress={handleSubmit} /> */}

              <TextInput
                error={errors.customer_name && touched.customer_name}
                mode="outlined"
                label="Customer name *"
                style={styles.input_style}
                placeholder="Customer name *"
                onChangeText={handleChange('customer_name')}
                value={values.customer_name}
                name="customer_name"
              />
              {errors.customer_name && touched.customer_name ? (
                <HelperText style={styles.errorText}>
                  {errors.customer_name}
                </HelperText>
              ) : null}

              <View
                style={
                  errors.customer_gender && touched.customer_gender
                    ? styles.picker_error_style
                    : styles.picker_style
                }>
                <Picker
                  selectedValue={values.customer_gender}
                  onValueChange={(itemValue, itemIndex) => {
                    setFieldValue('customer_gender', itemValue);
                  }}>
                  <Picker.Item
                    color={
                      errors.customer_gender && touched.customer_gender
                        ? '#ff0000'
                        : '#767A7D'
                    }
                    label="Select gender"
                    value=""
                  />
                  <Picker.Item color="#292B2C" label="Male" value="M" />
                  <Picker.Item color="#292B2C" label="Female" value="F" />
                  {/* <Picker.Item color="#292B2C" label="Others" value="O" /> */}
                </Picker>
              </View>

              <Caption>House image *</Caption>
              <TouchableHighlight
                onPress={() => setHouseImageDialog(true)}
                style={styles.imageContainer}>
                <Image
                  style={styles.image}
                  source={{
                    uri: recieptImage,
                  }}
                />
              </TouchableHighlight>

              <TextInput
                style={styles.input_style}
                onChangeText={handleChange('comments')}
                mode="outlined"
                label="Comments"
                placeholder="Comments"
                name="comments"
                value={values.comments}
                numberOfLines={3}
              />

              <Button
                disabled={loading}
                icon={
                  !loading
                    ? 'send'
                    : () => <ActivityIndicator animating={true} />
                }
                mode="contained"
                contentStyle={styles.btnContent_style}
                style={styles.btn_style}
                onPress={handleSubmit}>
                Submit
              </Button>
              <Portal>
                <Dialog
                  visible={houseImageDialog}
                  onDismiss={() => setHouseImageDialog(false)}>
                  <Button onPress={openCamera}>Open camera</Button>
                  <Button onPress={openGallery}>Choose from gallery</Button>
                </Dialog>
              </Portal>
            </>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACINGS.xs,
  },

  btn_style: {
    marginTop: SPACINGS.sm,
    marginBottom: SPACINGS.lg,
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  checkbox: {
    alignSelf: 'center',
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
    borderColor: '#ff0033',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },

  input_style: {
    backgroundColor: '#F6F4F4',
    marginBottom: SPACINGS.xs,
  },
  errorText: {
    color: '#E01632',
    paddingBottom: 15,
  },
  imageContainer: {
    marginTop: 10,
    alignSelf: 'center',
    height: 200,
    width: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
