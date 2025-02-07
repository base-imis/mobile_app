import React from 'react';
import {useSelector} from 'react-redux';
import {StyleSheet, View} from 'react-native';
import {
  Button,
  Caption,
  Dialog,
  Divider,
  Portal,
  Subheading,
} from 'react-native-paper';

import HorizontalSpacer from '../common/HorizontalSpacer';

import {COLORS} from '../../core/theme';

const MapInfoModal = ({visible, onClose, onNext}) => {
  const {containmentCoords} = useSelector(state => state.map);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={() => onClose(false)}>
        <Dialog.Title>Containment Information</Dialog.Title>
        <Divider />
        <Dialog.Content>
          <TableHeader />
          {containmentCoords && (
            <View style={styles.row}>
              <Caption numberOfLines={1} style={styles.txtCoord}>
                {containmentCoords.latitude.toFixed(5)}
              </Caption>
              <Caption numberOfLines={1} style={styles.txtCoord}>
                {containmentCoords.longitude.toFixed(5)}
              </Caption>
            </View>
          )}
        </Dialog.Content>
        <Divider />
        <Dialog.Actions>
          <Button onPress={() => onClose(false)}>Close</Button>
          <HorizontalSpacer size={30} />
          <Button mode="contained" onPress={() => onNext()}>
            Next
          </Button>
          <HorizontalSpacer />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default MapInfoModal;

const TableHeader = () => {
  return (
    <View style={styles.row}>
      <Subheading style={styles.tableTitle}>Latitude</Subheading>
      <Subheading style={styles.tableTitle}>Longitude</Subheading>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollArea: {
    flex: 1,
  },

  row: {
    flexDirection: 'row',
  },

  tableTitle: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.primary,
  },

  txtCoord: {
    width: '50%',
    textAlign: 'center',
  },
});
