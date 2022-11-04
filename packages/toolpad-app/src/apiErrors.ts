import { ValueOf } from './utils/types';

// Do not export this object directly for easier tree-shaking
const API_ERROR_CODES = {
  APP_NAME_EXISTS: 'TOOLPAD_APP_NAME_EXISTS',
  VALIDATE_CAPTCHA_FAILED: 'TOOLPAD_VALIDATE_CAPTCHA_FAILED',
};

export const APP_NAME_EXISTS_ERROR_CODE = API_ERROR_CODES.APP_NAME_EXISTS;
export const VALIDATE_CAPTCHA_FAILED_ERROR_CODE = API_ERROR_CODES.VALIDATE_CAPTCHA_FAILED;

export type ApiErrorCode = ValueOf<typeof API_ERROR_CODES>;

export class ApiError extends Error {
  code: ApiErrorCode;

  constructor(message: string, code: ApiErrorCode) {
    super(message);
    this.code = code;
  }
}
