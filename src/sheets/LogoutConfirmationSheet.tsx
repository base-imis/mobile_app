// import React from 'react';
// import {StyleSheet, View} from 'react-native';
// import ActionSheet, {
//   SheetManager,
//   SheetProps,
// } from 'react-native-actions-sheet';
// import {MD3Theme, Text, useTheme} from 'react-native-paper';

// import {ContainedButton, PrimarySpinner} from '@components';
// import {useAuthentication} from '@hooks/useAuthentication';
// import {useThemedStyles} from '@hooks/useThemedStyles';
// import {lightTheme} from '@themes';

// export default function LogoutConfirmationSheet({sheetId}: SheetProps) {
//   const {isLoading, logoutUser} = useAuthentication();
//   const theme = useTheme();
//   const styles = useThemedStyles(themedStyles);

//   const hideSheet = () => {
//     SheetManager.hide(sheetId);
//   };

//   const onPressYes = async () => {
//     await logoutUser();
//     hideSheet();
//   };

//   return (
//     <ActionSheet
//       id={sheetId}
//       containerStyle={styles.sheetContainer}
//       overlayColor={theme.colors.onBackground}>
//       <View style={styles.sheetContent}>
//         <Text variant="titleMedium" style={styles.textAlignCenter}>
//           Are you sure you want to logout?
//         </Text>

//         <View style={styles.buttonGroup}>
//           {isLoading ? (
//             <PrimarySpinner />
//           ) : (
//             <>
//               <ContainedButton
//                 title="No"
//                 onPress={hideSheet}
//                 bgColor={lightTheme.colors.error}
//               />

//               <ContainedButton title="Yes" onPress={onPressYes} />
//             </>
//           )}
//         </View>
//       </View>
//     </ActionSheet>
//   );
// }

// const themedStyles = (theme: MD3Theme) =>
//   StyleSheet.create({
//     sheetContainer: {
//       backgroundColor: theme.colors.background,
//     },
//     sheetContent: {
//       alignItems: 'center',
//       padding: 36,
//       gap: 24,
//     },
//     textAlignCenter: {
//       textAlign: 'center',
//     },
//     buttonGroup: {
//       height: 44,
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       gap: 16,
//     },
//   });
