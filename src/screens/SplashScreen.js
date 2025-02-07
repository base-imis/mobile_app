import React from 'react';
import {ActivityIndicator, Title} from 'react-native-paper';
import {Dimensions, Image, StatusBar, StyleSheet, View} from 'react-native';

import VerticalSpacer from '../components/common/VerticalSpacer';

import {COLORS, SPACINGS} from '../core/theme';
import {IMAGES} from '../core/constants/images';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ActivityIndicator size={'small'} color={COLORS.primary} />
    </View>
  );
};

export default SplashScreen;

const size = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light,
  },

  logo: {
    height: size * 0.3,
    resizeMode: 'contain',
  },

  title: {
    fontSize: 50,
    letterSpacing: 0.5,
    textAlign: 'center',
    color: COLORS.content,
    marginHorizontal: size * 0.15,

    padding: 30,
  },
});
