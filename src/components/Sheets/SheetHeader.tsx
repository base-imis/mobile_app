import React from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton, Text} from 'react-native-paper';

interface ISheetHeaderProps {
  title: string;
  onPress?: () => void;
}

export default function SheetHeader({title, onPress}: ISheetHeaderProps) {
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>

      {!!onPress ? (
        <IconButton
          icon={'chevron-down'}
          style={styles.iconBtn}
          onPress={onPress}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  iconBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});
