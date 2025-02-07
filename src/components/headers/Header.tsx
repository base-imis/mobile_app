import React, {useState} from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Appbar, Menu, useTheme, IconButton, MD3Theme} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import {resetToken} from '../../store/slices/auth.slice';
import {logoutService} from '../../service/auth_service';
import {COLORS} from '../../core/theme';
import {ROUTES} from '../../core/constants/routes';
import {resetBuildingCoords, toogleMapType} from '../../store/slices/map.slice';
import colors from '../../core/theme/colors';
interface IRegistrationHeaderProps {
  hideBackAction?: boolean;
  title?: string;
  showRemoveMarker?: boolean;
  showMapStyle?: boolean;
}

export default function Header({
  hideBackAction = false,
  showRemoveMarker = false,
  showMapStyle = false,
  title,
}: IRegistrationHeaderProps) {
  const navigation = useNavigation();
  const route = useRoute();
  const [menuVisible, setMenuVisible] = useState(false);
  const theme = useTheme();
  const dispatch = useDispatch();

  const onPressBackAction = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const hideMenu = () => setMenuVisible(false);
  const showMenu = () => setMenuVisible(true);

  const handleLogOut = () => {
    hideMenu();
    logoutService()
      .then(res => console.log('log out', res.data))
      .catch(err => console.log(err))
      .finally(() => {
        dispatch(resetToken());
      });
  };
  const handleToogleMapType = () => dispatch(toogleMapType());
  const handleResetBuildingCoords = () => {
    dispatch(resetBuildingCoords());
  };

  return (
    <Appbar.Header
      style={{
        backgroundColor: theme.colors.primary,
        borderBottomWidth: 0.5,
        borderColor: colors.lightGrey,
      }}>
      <StatusBar
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
      />
      {!hideBackAction && (
        <Appbar.BackAction
          onPress={onPressBackAction}
          color={theme.colors.onPrimary}
        />
      )}

      <Appbar.Content
        title={title ? title : route?.name}
        style={{marginLeft: hideBackAction ? 18 : 0}}
        color={theme.colors.onPrimary}
      />
      {showRemoveMarker && (
        <Appbar.Action
          icon="layers-remove"
          onPress={handleResetBuildingCoords}
          color={theme.colors.onPrimary}
          style={{opacity: 0.9}}
        />
      )}
      {showMapStyle && (
        <Appbar.Action
          icon="map"
          onPress={handleToogleMapType}
          color={theme.colors.onPrimary}
          style={{opacity: 0.9}}
        />
      )}
      {title === 'Home' && (
        <>
          <Menu
            visible={menuVisible}
            onDismiss={hideMenu}
            anchor={
              <Appbar.Action
                icon="dots-vertical"
                onPress={showMenu}
                color={theme.colors.onPrimary}
                style={{marginRight: -4}}
              />
            }>
            <Menu.Item onPress={handleLogOut} title="Log out" />
          </Menu>
        </>
      )}
    </Appbar.Header>
  );
}

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      paddingTop: 12,
      backgroundColor: 'red',
    },
  });
