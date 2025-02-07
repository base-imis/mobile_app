import React, {useCallback, useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';

import {ROUTES} from '../core/constants/routes';

import RootStack from './RootStack';
import SignInScreen from '../screens/auth/SigninScreen';
import SplashScreen from '../screens/SplashScreen';
import {
  checkMultiple,
  PERMISSIONS,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import {Alert, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import PermissionProvider from '../hooks/PermissionContext';
import {NavigationContainer} from '@react-navigation/native';
import {navigationRef} from '../utils/navigation';

const {Screen, Navigator} = createNativeStackNavigator();
const AppNavigation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const {token, permissions} = useSelector(state => state.auth);

  const switchRoute = () => {
    if (!!token && !!permissions) {
      return <RootStack />;
    } else {
      return <SignInScreen />;
    }
  };
  return (
    <PermissionProvider>
      <NavigationContainer ref={navigationRef}>
        {switchRoute()}
        {/* <Screen name={ROUTES.signin_screen} component={SignInScreen} />
        <Screen name={ROUTES.root_stack} component={RootStack} /> */}
      </NavigationContainer>
    </PermissionProvider>
  );
};

export default AppNavigation;
