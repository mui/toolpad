import { LocaleText } from '../AppProvider/LocalizationProvider';

export type CRUDLocaleText = Pick<
  LocaleText,
  | 'createNewButtonLabel'
  | 'reloadButtonLabel'
  | 'createLabel'
  | 'createSuccessMessage'
  | 'createErrorMessage'
  | 'editLabel'
  | 'editSuccessMessage'
  | 'editErrorMessage'
  | 'deleteLabel'
  | 'deleteConfirmTitle'
  | 'deleteConfirmMessage'
  | 'deleteConfirmLabel'
  | 'deleteCancelLabel'
  | 'deleteSuccessMessage'
  | 'deleteErrorMessage'
  | 'deletedItemMessage'
>;

export const CRUD_DEFAULT_LOCALE_TEXT: CRUDLocaleText = {
  createNewButtonLabel: 'Create new',
  reloadButtonLabel: 'Reload data',
  createLabel: 'Create',
  createSuccessMessage: 'Item created successfully.',
  createErrorMessage: 'Failed to create item. Reason:',
  editLabel: 'Edit',
  editSuccessMessage: 'Item edited successfully.',
  editErrorMessage: 'Failed to edit item. Reason:',
  deleteLabel: 'Delete',
  deleteConfirmTitle: 'Delete item?',
  deleteConfirmMessage: 'Do you wish to delete this item?',
  deleteConfirmLabel: 'Delete',
  deleteCancelLabel: 'Cancel',
  deleteSuccessMessage: 'Item deleted successfully.',
  deleteErrorMessage: 'Failed to delete item. Reason:',
  deletedItemMessage: 'This item has been deleted.',
};
