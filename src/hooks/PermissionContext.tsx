import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {Platform, Alert} from 'react-native';
import {
  checkMultiple,
  requestMultiple,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';

// Create a context for permission handling
const PermissionContext = createContext({});

export default function PermissionProvider({children}) {
  const REQUIRED_PERMISSIONS = Platform.select({
    android: [
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ],
    ios: [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE],
  });

  const [permissionStatus, setPermissionStatus] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userPermissionDenied, setUserPermissionDenied] = useState(false);

  console.log('PermissionStatus', permissionStatus);
  console.log('locationEnabled', locationEnabled);
  console.log('userPermissionDenied', userPermissionDenied);

  // Check permissions and request if needed
  const checkPermissions = useCallback(async () => {
    const statuses = await checkMultiple(REQUIRED_PERMISSIONS);
    const allGranted = Object.values(statuses).every(
      status => status === RESULTS.GRANTED,
    );
    setPermissionStatus(allGranted);

    if (!allGranted) {
      await requestPermissions(); // Request permissions if not granted
    } else {
      await checkLocationService(); // If permission granted, check location service
    }
  }, []);

  // Request permissions if not already granted
  const requestPermissions = useCallback(async () => {
    const statuses = await requestMultiple(REQUIRED_PERMISSIONS);
    const allGranted = Object.values(statuses).every(
      status => status === RESULTS.GRANTED,
    );
    setPermissionStatus(allGranted);

    if (allGranted) {
      await checkLocationService(); // After permissions are granted, check location service
    } else {
      setUserPermissionDenied(true); // Set permission denied if user does not grant permissions
    }
  }, []);

  // Check if location services are enabled
  const checkLocationService = useCallback(async () => {
    if (Platform.OS === 'android') {
      const isEnabled = await isLocationEnabled();
      setLocationEnabled(isEnabled);

      if (!isEnabled) {
        await promptToEnableLocation(); // Prompt to enable location if not enabled
      }
      //   else {
      //     setupGeolocation(); // Set up geolocation if location is already enabled
      //   }
    }
  }, []);

  // Prompt user to enable location services
  const promptToEnableLocation = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const result = await promptForEnableLocationIfNeeded();
        if (result === 'enabled' || result === 'already-enabled') {
          setLocationEnabled(true); // Set location enabled
          //   setupGeolocation(); // Retry geolocation after enabling location
        }
      } catch (error) {
        setUserPermissionDenied(true); // Set userPermissionDenied if the user denies enabling location services
        Alert.alert(
          'Location Error',
          'Unable to enable location services. Please try again.',
        );
      }
    }
  }, []);

  // Set up geolocation if permissions and location services are enabled
  // const setupGeolocation = useCallback(() => {
  //   Geolocation.getCurrentPosition(
  //     position => {
  //       console.log('Current position:', position.coords);
  //     },
  //     error => {
  //       console.log(error);
  //       if (error.code === 2) {
  //         promptToEnableLocation(); // Prompt to enable location if it's disabled
  //       }
  //     },
  //     {enableHighAccuracy: false, distanceFilter: 10},
  //   );
  // }, [promptToEnableLocation]);

  useEffect(() => {
    checkPermissions(); // Check permissions on mount
  }, [checkPermissions]);

  return (
    <PermissionContext.Provider
      value={{
        permissionStatus,
        locationEnabled,
        userPermissionDenied,
        requestPermissions, // Allow manual permission request from context
      }}>
      {children}
    </PermissionContext.Provider>
  );
}

// Hook to use permission context
export const usePermissionContext = () => useContext(PermissionContext);
