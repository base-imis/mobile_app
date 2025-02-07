import {View} from 'react-native';
import React from 'react';
import {Picker} from '@react-native-picker/picker';
import {HelperText, Text} from 'react-native-paper';
import {StyleSheet} from 'react-native';
import {COLORS} from '../../core/theme';

const FormikOptions = ({value, setFieldValue, options = [], error, title}) => {
  return (
    <>
      <Text style={styles.inputText}>{title}</Text>
      <View style={styles.picker}>
        <Picker selectedValue={value} onValueChange={val => setFieldValue(val)}>
          {options?.map((item, index) => (
            <Picker.Item key={index} value={item?.value} label={item?.label} />
          ))}
        </Picker>
      </View>
      {error && <HelperText style={styles.errorText}>{error}</HelperText>}
    </>
  );
};

const styles = StyleSheet.create({
  picker: {
    elevation: 3,
    marginVertical: 1,
    marginHorizontal: 2,
    borderRadius: 10,
    backgroundColor: COLORS.light,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
  },
  inputText: {
    fontSize: 15,
    marginVertical: 5,
    fontWeight: 'bold',
  },
});

export default FormikOptions;
