import { ValueOf } from './utils/types';

export const API_ERROR_CODES = {
  APP_NAME_EXISTS: 'APP_NAME_EXISTS',
  VALIDATE_CAPTCHA_FAILED: 'VALIDATE_CAPTCHA_FAILED',
};

export type ApiErrorCode = ValueOf<typeof API_ERROR_CODES>;

export class ApiError extends Error {
  code: string;

  constructor(message: string, code: ApiErrorCode) {
    super(message);
    this.code = code;
  }
}
