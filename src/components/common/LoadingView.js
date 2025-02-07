import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {Portal} from 'react-native-paper';
import {COLORS} from '../../core/theme';

const LoadingView = () => {
  return (
    <Portal>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    opacity: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light,
  },
});

export default LoadingView;
