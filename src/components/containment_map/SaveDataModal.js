import {
  Button,
  Dialog,
  Portal,
  TextInput,
  HelperText,
} from 'react-native-paper';
import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {Alert, ScrollView, StyleSheet} from 'react-native';

import {COLORS, SPACINGS} from '../../core/theme';

import VerticalSpacer from '../common/VerticalSpacer';
import HorizontalSpacer from '../common/HorizontalSpacer';

import {useDispatch} from 'react-redux';
import {addContainmentData} from '../../store/slices/map.slice';

const SaveDataModal = ({visible, onClose, onDataSaved}) => {
  const dispatch = useDispatch();
  const {containmentCoords} = useSelector(state => state.map);

  const [containcd, setContaincd] = useState('');

  const [containcdError, setContaincdError] = useState(null);

  const handleOnSave = () => {
    const isValid = validateData();

    if (isValid) {
      saveContainmentData();
    }
  };

  const validateData = () => {
    setContaincd(null);

    if (containcd === '') {
      setContaincdError('Containment code is required!');
      return false;
    }

    return true;
  };

  const saveContainmentData = () => {
    console.log('coords ', containmentCoords);

    const payload = {
      containcd: containcd,
      longitude: containmentCoords.longitude,
      latitude: containmentCoords.latitude,
    };
    dispatch(addContainmentData(payload));
    Alert.alert('Saved', 'Containment data is saved.');
    onDataSaved();
    setContaincd('');
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={() => onClose(false)}>
        <Dialog.Title>Save containment data</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollArea}>
            <TextInput
              autoFocus
              mode="outlined"
              value={containcd}
              onChangeText={setContaincd}
              error={containcdError ? true : false}
              label={'Containment code'}
            />
            {containcdError && (
              <HelperText style={styles.errorText}>{containcdError}</HelperText>
            )}
            <VerticalSpacer />
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={() => onClose(false)}>Close</Button>
          <HorizontalSpacer size={30} />
          <Button mode="contained" onPress={handleOnSave}>
            Save
          </Button>
          <HorizontalSpacer />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default SaveDataModal;

const styles = StyleSheet.create({
  scrollArea: {
    paddingTop: SPACINGS.md,
    paddingBottom: SPACINGS.lg,
  },

  errorText: {
    color: COLORS.error,
  },
});
