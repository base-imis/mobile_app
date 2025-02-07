import AsyncStorage from '@react-native-async-storage/async-storage';
export const setValue = (key, value) => {
  AsyncStorage.setItem(key, value);
};

export const getValue = async key => {
  return await AsyncStorage.getItem(key);
};
