import {StyleSheet, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {Text} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Menu, MenuItem, MenuDivider} from 'react-native-material-menu';

import {COLORS} from '../../core/theme';
import {ROUTES} from '../../core/constants/routes';

import {resetToken} from '../../store/slices/auth.slice';
import {logoutService} from '../../service/auth_service';

const HomeHeaderRight = ({onVisible}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [visible, setVisible] = useState(false);

  const hideMenu = () => setVisible(false);

  const showMenu = () => setVisible(true);

  const handleAboutUsPress = () => {
    hideMenu();
    navigation.navigate(ROUTES.about_us);
  };

  const handleLogOut = ({}) => {
    hideMenu();
    onVisible();

    logoutService()
      .then(res => console.log('log out', res.data))
      .catch(err => console.log(err))
      .finally(() => {
        dispatch(resetToken());
      });
  };

  return (
    <>
      <Menu
        visible={visible}
        onRequestClose={hideMenu}
        anchor={
          <TouchableOpacity activeOpacity={0.6} onPress={showMenu}>
            <Icon color={COLORS.light} name="more-vert" size={25} />
          </TouchableOpacity>
        }>
        {/* <MenuItem onPress={handleAboutUsPress}>
          <Text>About us</Text>
        </MenuItem> */}
        <MenuDivider />
        <MenuItem onPress={handleLogOut}>
          <Text>Log out</Text>
        </MenuItem>
      </Menu>
    </>
  );
};

export default HomeHeaderRight;

const styles = StyleSheet.create({
  spinner: {
    paddingLeft: 10,
    paddingTop: 10,
  },
});
