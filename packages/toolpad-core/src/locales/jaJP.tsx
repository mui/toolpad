import type { LocaleText } from '../AppProvider';
import { getLocalization } from './getLocalization';

const jaLabels: LocaleText = {
  // Account
  accountSignInLabel: 'サインイン',
  accountSignOutLabel: 'サインアウト',

  // AccountPreview
  accountPreviewTitle: 'アカウント',
  accountPreviewIconButtonLabel: '現在のユーザー',

  // SignInPage
  signInTitle: (brandingTitle?: string) =>
    brandingTitle ? `${brandingTitle}にサインイン` : 'サインイン',
  signInSubtitle: 'ようこそユーザー、続行するにはサインインしてください',
  signInRememberMe: 'ログイン情報を記憶する',
  providerSignInTitle: (provider: string) => `${provider}でサインイン`,

  // Common authentication labels
  email: 'メール',
  password: 'パスワード',
  username: 'ユーザー名',
  passkey: 'パスキー',

  // Common action labels
  save: '保存',
  cancel: 'キャンセル',
  ok: 'OK',
  or: 'または',
  to: 'に',
  with: 'と',
  close: '閉じる',
  delete: '削除',
  alert: 'アラート',
  confirm: '確認',
  loading: '読み込み中...',

  // CRUD
  createNewButtonLabel: '新規作成',
  reloadButtonLabel: 'データを再読み込み',
  createLabel: '作成',
  createSuccessMessage: 'アイテムが正常に作成されました。',
  createErrorMessage: 'アイテムの作成に失敗しました。理由:',
  editLabel: '編集',
  editSuccessMessage: 'アイテムが正常に編集されました。',
  editErrorMessage: 'アイテムの編集に失敗しました。理由:',
  deleteLabel: '削除',
  deleteConfirmTitle: 'アイテムを削除しますか？',
  deleteConfirmMessage: 'このアイテムを削除してもよろしいですか？',
  deleteConfirmLabel: '削除',
  deleteCancelLabel: 'キャンセル',
  deleteSuccessMessage: 'アイテムが正常に削除されました。',
  deleteErrorMessage: 'アイテムの削除に失敗しました。理由:',
  deletedItemMessage: 'このアイテムは削除されました。',
};

export default getLocalization(jaLabels);
