import * as apiErrorCodes from './apiErrorCodes';

import { ValueOf } from './utils/types';

export type ApiErrorCode = ValueOf<typeof apiErrorCodes>;

export class ApiError extends Error {
  code: ApiErrorCode;

  constructor(message: string, code: ApiErrorCode) {
    super(message);
    this.code = code;
  }
}
