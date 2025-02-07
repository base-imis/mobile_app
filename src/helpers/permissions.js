import {Alert, Platform, PlatformOSType} from 'react-native';
import {
  RESULTS,
  PERMISSIONS,
  request,
  checkMultiple,
} from 'react-native-permissions';

/**
 *
 * @param {Function} onSuccess
 *
 * Asks for location permission and fires onSuccess when granted or limited.
 *
 * This function handles for denied or blocked permission action by itself.
 *
 * Exceptions are logged out in console.
 */
export const askLocationPermission = (onSuccess = () => {}) => {
  checkMultiple([
    PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  ])
    .then(granted => {
      // if granted or limited hit onSuccess callback;
      if (granted === RESULTS.GRANTED || granted === RESULTS.LIMITED) {
        onSuccess();
      } else {
        // else request permission
        requestLocationPermission(Platform.OS, onSuccess);
      }
    })
    .catch(error => {
      console.log('check exception', error);
    });
};

/**
 *
 * @param {PlatformOSType} platform
 * @param {Function} onSuccess
 */
const requestLocationPermission = (platform = 'android', onSuccess) => {
  const PERMISSION_TO_REQUEST =
    platform === 'android'
      ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

  request(PERMISSION_TO_REQUEST)
    .then(granted => {
      // on granted call onSuccess callback
      if (granted === RESULTS.GRANTED || granted === RESULTS.LIMITED) {
        onSuccess();
      } else {
        Alert.alert(
          'Permission inaccessible',
          `You have denied location permission.\n\nPlease enable it to contiue using this feature.`,
          [
            {
              text: 'Ask me later',
            },
            {
              text: 'Try again',
              onPress: () => askLocationPermission(onSuccess),
            },
          ],
        );
      }
    })
    .catch(error => {
      console.log('Request exception', error);
    });
};

/**
 *
 * @param {Function} onSuccess
 *
 * Asks for storage/media library permission and fires onSuccess when granted or limited.
 *
 * This function handles for denied or blocked permission action by itself.
 *
 * Exceptions are logged out in console.
 */
export const askStoragePermission = (onSuccess = () => {}) => {
  checkMultiple([
    PERMISSIONS.IOS.MEDIA_LIBRARY,
    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
  ])
    .then(granted => {
      // if granted or limited hit onSuccess callback;
      if (granted === RESULTS.GRANTED || granted === RESULTS.LIMITED) {
        onSuccess();
      } else {
        // else request permission
        requestStoragePermission(Platform.OS, onSuccess);
      }
    })
    .catch(error => {
      console.log('check exception', error);
    });
};

/**
 *
 * @param {PlatformOSType} platform
 * @param {Function} onSuccess
 */
const requestStoragePermission = (platform = 'android', onSuccess) => {
  const PERMISSION_TO_REQUEST =
    platform === 'android'
      ? PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
      : PERMISSIONS.IOS.MEDIA_LIBRARY;

  request(PERMISSION_TO_REQUEST)
    .then(granted => {
      // on granted call onSuccess callback
      if (granted === RESULTS.GRANTED || granted === RESULTS.LIMITED) {
        onSuccess();
      } else {
        Alert.alert(
          'Permission inaccessible',
          `You have denied storage permission.\n\nPlease enable it to contiue using this feature.`,
          [
            {
              text: 'Ask me later',
            },
            {
              text: 'Try again',
              onPress: () => askStoragePermission(onSuccess),
            },
          ],
        );
      }
    })
    .catch(error => {
      console.log('Request exception', error);
    });
};
