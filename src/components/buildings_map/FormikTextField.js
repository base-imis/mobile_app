import React, {memo} from 'react';
import {StyleSheet} from 'react-native';
import {HelperText, Text, TextInput} from 'react-native-paper';
import {COLORS} from '../../core/theme';

const FormikTextField = ({
  name,
  value,
  error,
  onChangeText,
  title,
  mode = 'outlined',
  ...rest
}) => {
  return (
    <>
      <Text style={styles.inputText}>{title}</Text>
      <TextInput
        {...rest}
        name={name}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        mode={mode}
        outlineColor={COLORS.lightGrey}
      />
      {error && <HelperText style={styles.errorText}>{error}</HelperText>}
    </>
  );
};

const styles = StyleSheet.create({
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
});

export default memo(FormikTextField);
