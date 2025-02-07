import React from 'react';
import {StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import {FAB, Portal} from 'react-native-paper';

import {COLORS, SPACINGS} from '../../core/theme';
import Icon from 'react-native-vector-icons/Ionicons';

const MapInfoButton = ({onPress}) => {
  const {containmentCoords} = useSelector(state => state.map);

  const handleInfoPress = () => {
    onPress(true);
  };

  return (
    <Portal>
      <FAB
        style={[
          styles.fab,
          {
            backgroundColor: containmentCoords
              ? COLORS.primary
              : COLORS.disabled,
          },
        ]}
        disabled={containmentCoords ? false : true}
        color={COLORS.light}
        animated={false}
        onPress={handleInfoPress}
        icon={() => <Icon name="save" size={25} color="white" />}
        theme={{
          colors: {
            primary: containmentCoords ? COLORS.accent : COLORS.lightGrey,
          },
        }}
      />
    </Portal>
  );
};

export default React.memo(MapInfoButton);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: SPACINGS.sm,
    left: 0,
    bottom: 0,
  },
});
