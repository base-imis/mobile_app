import React from 'react';
import {Dimensions, Image, Pressable, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

import {COLORS} from '../../core/theme';

const DashboardTile = ({title, image, onPress}) => {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image resizeMode="contain" style={styles.image} source={image} />
      <Text numberOfLines={2} style={styles.title}>
        {title}
      </Text>
    </Pressable>
  );
};

export default DashboardTile;

const size = Dimensions.get('screen').width;
const styles = StyleSheet.create({
  card: {
    width: size * 0.4,
    height: size * 0.4,
    margin: size * 0.02,
    elevation: 3,
    padding: 10,
    backgroundColor: COLORS.light,
    alignItems: 'center',
    borderRadius: 15,
  },

  image: {
    width: 60,
    height: 60,
  },

  title: {
    flex: 1,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.darkGrey,
    textAlignVertical: 'center',
  },
});
