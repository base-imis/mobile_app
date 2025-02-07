import {SheetDefinition, registerSheet} from 'react-native-actions-sheet';

// import LogoutConfirmationSheet from './LogoutConfirmationSheet';
import SelectionSheet, {
  ISelectionSheetOption,
  ISelectionSheetProps,
} from './SelectionSheet';
import {kSheets} from './constants';

// registerSheet(kSheets.logoutConfirmationSheet, LogoutConfirmationSheet);
registerSheet(kSheets.selectionSheet, SelectionSheet);

declare module 'react-native-actions-sheet' {
  interface Sheets {
    // [kSheets.logoutConfirmationSheet]: SheetDefinition;
    [kSheets.selectionSheet]: SheetDefinition<{
      payload: ISelectionSheetProps;
      returnValue: ISelectionSheetOption;
    }>;
  }
}

export {};
