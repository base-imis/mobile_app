import Geolocation, {
  GeolocationResponse,
  GeolocationError,
} from '@react-native-community/geolocation';

/**
 * Gets current location of the user
 *
 * @returns {Promise<GeolocationResponse | GeolocationError>} position or error
 */
export function getCurrentLocation(
  throwError = true,
): Promise<GeolocationResponse | GeolocationError | undefined> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      response => resolve(response), // Successfully resolved geolocation
      error => {
        console.log('Erorrrrrrrrrrrrrrrrrrrrr', error);
        if (throwError) {
          console.log('Error!!!Returnedd!!', error);
          reject(error); // Reject the promise with error
        } else {
          resolve(undefined); // Resolve as undefined if no throw is required
        }
      },
      {
        timeout: 60000, // Timeout of 60 seconds
      },
    );
  });
}

// import Geolocation, {
//   GeolocationResponse,
// } from '@react-native-community/geolocation';
// /**
//  * Gets current location of the user
//  *
//  * Must use in conjunction with ...*\/*\/askLocationPermission helper function
//  *
//  * @returns {Promise<GeoPosition>} position
//  */

// export function getCurrentLocation(
//   throwError = true,
// ): Promise<GeolocationResponse | undefined> {
//   return new Promise((resolve, reject) => {
//     Geolocation.getCurrentPosition(
//       response => resolve(response),
//       error => (throwError ? reject(error) : resolve(undefined)),
//       {
//         timeout: 60000, // in milliseconds
//       },
//     );
//   });
// }
