import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Avatar, Caption, Title, useTheme} from 'react-native-paper';

import {useSelector} from 'react-redux';
import {COLORS, SPACINGS} from '../../core/theme';

import VerticalSpacer from '../common/VerticalSpacer';

const Profile = () => {
  const {account} = useSelector(state => state.auth);
  const theme = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        paddingHorizontal: SPACINGS.sm,
        paddingVertical: SPACINGS.lg,
        backgroundColor: theme.colors.elevation.level4,
      }}>
      <Avatar.Text size={90} label={account.name[0]?.toUpperCase()} />
      <VerticalSpacer />
      <Title>{account?.name}</Title>
      <Caption>{account?.help_desk}</Caption>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: SPACINGS.sm,
    paddingVertical: SPACINGS.lg,
    backgroundColor: COLORS.content,
  },
});
