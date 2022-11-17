import type { NextApiRequest, NextApiResponse } from 'next';
import type { RecaptchaResJson } from '../validateRecaptchaToken';
import logger from './logger';

type ReqResLogPayload = {
  key: 'apiReqRes';
  req: NextApiRequest;
  res: NextApiResponse;
};

type RpcReqResLogPayload = {
  key: 'rpcReqRes';
  req: NextApiRequest;
  res: NextApiResponse;
};

type CaptchaValidationLogPayload = {
  key: 'captchaValidation';
  token: string;
  recaptchaRes: RecaptchaResJson;
};

type LogPayload = ReqResLogPayload | RpcReqResLogPayload | CaptchaValidationLogPayload;

function logInfo(payload: LogPayload, message?: string): void {
  logger.info(payload, message);
}

export default logInfo;
