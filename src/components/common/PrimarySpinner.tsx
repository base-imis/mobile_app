import React from 'react';
import {StyleSheet} from 'react-native';
import {ActivityIndicator, MD3Theme} from 'react-native-paper';
import colors from '../../core/theme/colors';

export default function PrimarySpinner() {
  return <ActivityIndicator style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
});
