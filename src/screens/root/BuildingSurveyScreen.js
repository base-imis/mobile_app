import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {Button, TextInput, Title} from 'react-native-paper';
import FormikOptions from '../../components/buildings_map/FormikOptions';
import FormikTextField from '../../components/buildings_map/FormikTextField';
import {COLORS} from '../../core/theme';
import useBuildingSurvey from '../../hooks/useBuildingSurvey';
import {Header} from '../../components/headers';

const BuildingSurveyScreen = () => {
  const {
    formik: {values, setFieldValue, errors},
  } = useBuildingSurvey();

  const [dateModal, setDateModal] = useState(false);
  const [constructionModal, setConstructionModal] = useState(false);

  return (
    <View style={{flex: 1}}>
      <Header title="Building Survey Form" />
      <ScrollView style={styles.container}>
        <FormikOptions
          title="Is main building?"
          value={values.is_main_building}
          error={errors.is_main_building}
          options={[
            {value: false, label: 'No'},
            {value: true, label: 'Yes'},
          ]}
          setFieldValue={val => setFieldValue('is_main_building', val)}
        />
        {!values.is_main_building && <FormikTextField title="Building no" />}
        <FormikTextField title="Tax code" />
        <FormikOptions title="Select ward no" />
        <FormikTextField title="Street name" />
        <FormikOptions title="Select structure type" />
        <FormikTextField title="Number of floors" keyboardType="number-pad" />
        <FormikOptions
          title="Functional use of building"
          value={values.functional_use}
          error={errors.is_main_building}
          options={[
            {value: '', label: 'Select functional use'},
            {value: 'health', label: 'Health'},
            {value: 'business', label: 'Business'},
            {value: 'residental', label: 'Residental'},
          ]}
          setFieldValue={val => setFieldValue('functional_use', val)}
        />
        <FormikOptions
          title="Use of building category"
          options={[
            {value: 'Option 1', label: 'Option 1'},
            {value: 'Option 2', label: 'Option 2'},
            {value: 'Option 3', label: 'Option 3'},
            {value: 'Option 4', label: 'Option 4'},
          ]}
          value={values.building_use}
          setFieldValue={val => setFieldValue('building_use', val)}
        />
        {values.functional_use && values.functional_use !== 'residental' ? (
          <FormikTextField title="Office or business name" />
        ) : null}
        <FormikTextField title="Number of households" />
        <FormikTextField title="Total population of building" />
        <FormikTextField
          title="Survyed date"
          editable={false}
          right={
            <TextInput.Icon
              icon="calendar"
              onPress={() => setDateModal(true)}
            />
          }
        />
        <DatePicker
          date={new Date()}
          onCancel={() => setDateModal(false)}
          maximumDate={new Date()}
          modal
          open={dateModal}
        />
        <FormikOptions
          title="Sanitation System Technology"
          value={values.technology}
          options={[
            {value: '0', label: 'Select sanitation system technology'},
            {value: '1', label: 'Anaerobic Digestor'},
            {value: '2', label: 'Cesspool/Holding tank'},
            {value: '3', label: 'Communal Septic Tank (from PT CT)'},
            {value: '4', label: 'Dehydration Toilet System'},
            {value: '5', label: 'DEWATS Online'},
            {value: '6', label: 'Directly to natural water body'},
            {value: '7', label: 'Directly to sewage network'},
            {value: '8', label: 'Directly to stormwater draim'},
            {value: '9', label: 'Directly to surrounding environment'},
            {value: '10', label: 'Double pit with soak away pit'},
            {value: '11', label: 'Septic tank connected to sewerage network'},
            {value: '12', label: 'Septic tank without soak away pit'},
            {value: '13', label: 'Septic tank with soak away pit'},
            {value: '14', label: 'Shared Septic tank'},
            {value: '115', label: 'Single pit'},
            ,
          ]}
          setFieldValue={val => setFieldValue('technology', val)}
          error={errors.technology}
        />
        {values.technology === '13' && (
          <FormikTextField title="BIN of pre-connected buildings" />
        )}
        {values.technology === '8' && <FormikTextField title="Drain code" />}
        {values.technology === '11' && <FormikTextField title="Sewer code" />}
        {values.technology === '2' ||
          values.technology === '11' ||
          (values.technology === '12' && (
            <View style={styles.containment}>
              <Title style={styles.title}>Containment information</Title>
              <FormikTextField title="Length" />
              <FormikTextField title="Width" />
              <FormikTextField title="Depth" />
              <FormikTextField title="Volume(m3)" />
              <FormikOptions title="Containment location" />
              <FormikOptions title="Septic tank compliance" />
              <FormikTextField
                title="Construction date"
                editable={false}
                right={
                  <TextInput.Icon
                    icon="calendar"
                    onPress={() => setDateModal(true)}
                  />
                }
              />
              <DatePicker
                date={new Date()}
                onCancel={() => setConstructionModal(false)}
                maximumDate={new Date()}
                modal
                open={constructionModal}
              />
            </View>
          ))}
        {values.technology === '10' ||
          (values.technology === '15' && (
            <View style={styles.containment}>
              <Title style={styles.title}>Containment information</Title>
              <FormikTextField title="Pit diameter" />
              <FormikTextField title="Pit depth" />
              <FormikTextField title="Volume(m3)" />
              <FormikOptions
                title="Containment location"
                value={values.containment_location}
                error={errors.containment_location}
                setFieldValue={val =>
                  setFieldValue('containment_location', val)
                }
                options={[
                  {
                    value: '',
                    label: 'Select containment location',
                  },
                  {
                    value: 'outside',
                    label: 'Outside building footprint',
                  },
                  {
                    value: 'inside',
                    label: 'Inside building footprint',
                  },
                  {
                    value: 'outside_2',
                    label: 'Outside property boundary',
                  },
                ]}
              />
              <FormikOptions
                title="Septic tank compliance"
                value={values.compliance}
                error={errors.compliance}
                setFieldValue={val => setFieldValue('compliance', val)}
                options={[
                  {
                    value: false,
                    label: 'No',
                  },
                  {
                    value: true,
                    label: 'Yes',
                  },
                ]}
              />
              <FormikTextField
                title="Construction date"
                editable={false}
                right={
                  <TextInput.Icon
                    icon="calendar"
                    onPress={() => setDateModal(true)}
                  />
                }
              />
              <DatePicker
                date={new Date()}
                onCancel={() => setConstructionModal(false)}
                maximumDate={new Date()}
                modal
                open={constructionModal}
              />
            </View>
          ))}
        {values.technology === '2' ||
          values.technology === '10' ||
          values.technology === '11' ||
          values.technology === '12' ||
          values.technology === '13' ||
          values.technology === '14' ||
          (values.technology === '15' && (
            <FormikOptions
              title="Is Building Vacutug accessible"
              value={values.vacutug_accessible}
              setFieldValue={val => setFieldValue('vacutug_accessible', val)}
              options={[
                {
                  value: 'no',
                  label: 'No',
                  value: 'yes',
                  label: 'Yes',
                  value: 'dontknow',
                  label: "Don't know",
                },
              ]}
            />
          ))}
        <FormikOptions title="Public/Community Toilet Name" />
        {values.technology !== '3' &&
          values.technology !== '6' &&
          values.technology !== '0' &&
          values.technology !== '8' &&
          values.technology !== '9' && (
            <FormikTextField title="Total number of toilets" />
          )}
        <FormikOptions title="Main Drinking Water source" />
        <FormikOptions title="Well Presence" />
        <FormikTextField title="Distance of containment from well (m)" />
        <FormikTextField title="Water supply Customer ID" />
        <FormikTextField title="SWM supply Customer ID" />
        <FormikTextField title="Owner name" />
        <FormikOptions title="Gender" />
        <FormikTextField title="Contact number" />
        <Button mode="contained" style={styles.button}>
          Save
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  picker: {
    elevation: 3,
    marginVertical: 1,
    marginHorizontal: 2,
    borderRadius: 10,
    backgroundColor: COLORS.light,
  },
  inputText: {
    fontSize: 15,
    marginVertical: 5,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: COLORS.light,
    marginVertical: 1,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
  },
  containment: {
    marginTop: 10,
    marginBottom: 25,
  },
  title: {
    marginVertical: 5,
  },
  button: {
    marginTop: 10,
    marginBottom: 30,
    width: '60%',
  },
});

export default BuildingSurveyScreen;
