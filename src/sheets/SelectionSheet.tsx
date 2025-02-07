import React from 'react';
import {Dimensions, FlatList, StyleSheet, View} from 'react-native';
import ActionSheet, {
  SheetManager,
  SheetProps,
} from 'react-native-actions-sheet';
import {Checkbox, MD3Theme, useTheme} from 'react-native-paper';

import SheetHeader from '../components/Sheets/SheetHeader';

export interface ISelectionSheetProps {
  title: string;
  options: ISelectionSheetOption[];
  selectedOption?: ISelectionSheetOption;
}
export interface ISelectionSheetOption {
  label: string;
  value: string | number;
  data?: any;
}

export default function SelectionSheet({
  sheetId,
  payload,
}: SheetProps<'selection-sheet'>) {
  const {options, title, selectedOption} = payload!;

  //   const theme = useTheme();
  //   const themedStyles = useThemedStyles(styles);

  const onPressItem = (item: ISelectionSheetOption) => {
    SheetManager.hide(sheetId, {
      payload: item,
    });
  };

  const onPressHeader = () => {
    SheetManager.hide(sheetId);
  };

  return (
    <ActionSheet
      id={sheetId}
      gestureEnabled={true}
      headerAlwaysVisible={false}
      indicatorStyle={{
        width: 50,
        height: 2.81,
        marginTop: 10,
        marginBottom: 8,
        borderRadius: 2,
      }}
      containerStyle={styles.sheetContainer}
      overlayColor={'rgba(0,0,0,0.5'}>
      <SheetHeader title={title} onPress={onPressHeader} />

      <View style={styles.container}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={options}
          renderItem={({item}) => {
            const selected = item.value === selectedOption?.value;

            return (
              <Checkbox.Item
                mode="ios"
                label={item.label}
                status={selected ? 'checked' : 'unchecked'}
                style={styles.item}
                onPress={() => onPressItem(item)}
              />
            );
          }}
        />
      </View>
    </ActionSheet>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    maxHeight: Dimensions.get('screen').height,
    paddingBottom: 16,
  },
  item: {
    paddingVertical: 4,
  },
});
