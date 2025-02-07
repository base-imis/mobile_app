import React from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {useDispatch} from 'react-redux';

import {COLORS} from '../../core/theme';
import {toogleMapType} from '../../store/slices/map.slice';

const RightHeader = () => {
  const dispatch = useDispatch();

  const handleToogleMapType = () => dispatch(toogleMapType());

  return (
    <View style={styles.row}>
      <IconButton
        icon="map"
        color={COLORS.light}
        onPress={handleToogleMapType}
      />
    </View>
  );
};

export default RightHeader;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});
