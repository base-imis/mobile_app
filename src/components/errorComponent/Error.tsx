import {Dimensions, Image, StyleSheet, View} from 'react-native';
import {IMAGES} from '../../core/constants/images';
import {Text} from 'react-native-paper';
import {COLORS} from '../../core/theme';
const width = Dimensions.get('screen').width;
export default function ErrorMessage({message}) {
  return (
    <View style={styles.container}>
      <Image source={IMAGES.errorLogo} style={styles.imageStyle} />
      <Text variant={'labelLarge'} style={styles.textStyle}>
        {message ?? 'An error occured. Please try again later.'}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },
  imageStyle: {
    width: width * 0.2,
    height: width * 0.2,
    resizeMode: 'contain',
  },
  textStyle: {color: COLORS.darkGrey},
});
