import React from 'react';
import {StyleSheet} from 'react-native';
import {Portal, Dialog, ActivityIndicator} from 'react-native-paper';
import {Text} from 'react-native-paper';
import VerticalSpacer from './VerticalSpacer';

const LoadingSpinner = ({title, isVisible}) => {
  return (
    <Portal>
      <Dialog style={styles.container} visible={isVisible} dismissable={false}>
        <Dialog.Content>
          <Text style={styles.text}>
            {title ? title : 'Doing something'}

            <ActivityIndicator style={styles.spinner} animating={true} />
          </Text>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    paddingRight: 20,
    fontSize: 20,
  },
  spinner: {
    paddingLeft: 20,
    paddingTop: 5,
  },
});

export default LoadingSpinner;
