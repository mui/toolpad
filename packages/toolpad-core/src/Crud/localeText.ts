import { LocaleText } from '../AppProvider/LocalizationProvider';

export type CRUDLocaleText = Pick<
  LocaleText,
  | 'createSuccessMessage'
  | 'createErrorMessage'
  | 'editSuccessMessage'
  | 'editErrorMessage'
  | 'deleteConfirmTitle'
  | 'deleteConfirmMessage'
  | 'deleteSuccessMessage'
  | 'deleteErrorMessage'
>;

export const CRUD_DEFAULT_LOCALE_TEXT: CRUDLocaleText = {
  createSuccessMessage: 'Item created successfully.',
  createErrorMessage: 'Failed to create item. Reason:',
  editSuccessMessage: 'Item edited successfully.',
  editErrorMessage: 'Failed to edit item. Reason:',
  deleteConfirmTitle: 'Delete item?',
  deleteConfirmMessage: 'Do you wish to delete this item?',
  deleteSuccessMessage: 'Item deleted successfully.',
  deleteErrorMessage: 'Failed to delete item. Reason:',
};
