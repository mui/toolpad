import type { LocaleText } from '../AppProvider';
import { getLocalization } from './getLocalization';

const enLabels: LocaleText = {
  // Account
  accountSignInLabel: 'Prihlásiť sa',
  accountSignOutLabel: 'Odhlásiť sa',

  // AccountPreview
  accountPreviewTitle: 'Účet',
  accountPreviewIconButtonLabel: 'Aktuálny používateľ',

  // SignInPage
  signInTitle: (brandingTitle?: string) =>
    brandingTitle ? `Prihlásiť sa do ${brandingTitle}` : 'Prihlásiť sa',
  signInSubtitle: 'Vitajte, pre pokračovanie sa prosím prihláste.',
  signInRememberMe: 'Zapamätať prihlásenie',
  providerSignInTitle: (provider: string) => `Prihlásiť cez ${provider}`,

  // Common authentication labels
  email: 'E-mail',
  password: 'Heslo',
  username: 'Používateľské meno',
  passkey: 'Passkey',

  // Common action labels
  save: 'Uložiť',
  cancel: 'Zrušiť',
  ok: 'Ok',
  or: 'Alebo',
  to: 'do',
  with: 'S pomocou',
  close: 'Zatvoriť',
  delete: 'Vymazať',
  alert: 'Upozornenie',
  confirm: 'Potvrdiť',
  loading: 'Načítavanie...',

  // CRUD
  createNewButtonLabel: 'Vytvoriť nový',
  reloadButtonLabel: 'Obnoviť',
  createLabel: 'Vytvoriť',
  createSuccessMessage: 'Položka bola úspešne vytvorená.',
  createErrorMessage: 'Nepodarilo sa vytvoriť položku. Dôvod:',
  editLabel: 'Upraviť',
  editSuccessMessage: 'Položka bola úspešne upravená.',
  editErrorMessage: 'Nepodarilo sa upraviť položku. Dôvod:',
  deleteLabel: 'Vymazať',
  deleteConfirmTitle: 'Vymazať položku?',
  deleteConfirmMessage: 'Ste si istý, že chcete vymazať položku?',
  deleteConfirmLabel: 'Vymazať',
  deleteCancelLabel: 'Zrušiť',
  deleteSuccessMessage: 'Položka bola úspešne vymazaná.',
  deleteErrorMessage: 'Nepodarilo sa vymazať položku. Dôvod:',
  deletedItemMessage: 'Položka bola úspešne vymazaná.',
};

export default getLocalization(enLabels);
