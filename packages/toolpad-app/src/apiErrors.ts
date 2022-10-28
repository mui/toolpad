import { ValueOf } from './utils/types';

export const API_ERROR_CODES = {
  APP_NAME_EXISTS: 'APP_NAME_EXISTS',
  VALIDATE_CAPTCHA_FAILED: 'VALIDATE_CAPTCHA_FAILED',
};

export class ApiError extends Error {
  code: string;

  constructor(message: string, code: ValueOf<typeof API_ERROR_CODES>) {
    super(message);
    this.code = code;
  }
}
