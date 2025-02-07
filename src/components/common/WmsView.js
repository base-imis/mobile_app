import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {Dialog, Divider, Portal} from 'react-native-paper';
import {Checkbox, Text} from 'react-native-paper';
import {COLORS} from '../../core/theme';

const WmsView = ({
  mode,
  visible,
  onDismiss,
  onWmsPress,
  onRoadWmsPress,
  onWardWmsPress,
  isWmsOn,
  isRoadWmsOn,
  isWardWmsOn,
}) => {
  return (
    <Portal>
      <Dialog
        style={styles.container}
        visible={visible}
        onDismiss={onDismiss}
        theme={{roundness: 2}}>
        <Dialog.Content>
          <Dialog.Title style={styles.title}>WMS layers</Dialog.Title>

          <Divider />
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.9}
            onPress={onWmsPress}>
            <Checkbox
              color={COLORS.primary}
              status={isWmsOn ? 'checked' : 'unchecked'}
            />
            <Text style={styles.text}>
              {mode === 'Building' ? 'Building' : 'Containment'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.9}
            onPress={onRoadWmsPress}>
            <Checkbox
              color={COLORS.primary}
              status={isRoadWmsOn ? 'checked' : 'unchecked'}
            />
            <Text style={styles.text}>Road</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.9}
            onPress={onWardWmsPress}>
            <Checkbox
              color={COLORS.primary}
              style={styles.checkBox}
              status={isWardWmsOn ? 'checked' : 'unchecked'}
            />
            <Text style={styles.text}>Ward</Text>
          </TouchableOpacity>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  text: {
    fontSize: 20,
  },

  container: {
    alignSelf: 'center',
    padding: 10,
  },
});

export default React.memo(WmsView);
