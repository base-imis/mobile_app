import colors, {darkTheme, lightTheme} from './colors';
import spacings from './spacings';
import {DefaultTheme} from 'react-native-paper';
const isDarkMode = false;
export default theme = {
  ...DefaultTheme,
  dark: isDarkMode,
  roundness: 1,
  colors: isDarkMode ? darkTheme.colors : lightTheme.colors,
  // roundness: 10,
  // colors: {
  //   ...DefaultTheme.colors,
  //   ...colors,
  // },
};

export const COLORS = colors;
export const SPACINGS = spacings;
