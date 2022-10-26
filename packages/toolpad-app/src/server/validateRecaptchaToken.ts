import logInfo from './logs/logInfo';

const SITE_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const SCORE_THRESHOLD = 0.5;

export interface RecaptchaResJson {
  [key: string]: any;
  success: boolean;
  score: number;
  action: string;
  'error-codes': number[];
}

export const validateRecaptchaToken = async (
  secretKey: string,
  token: string,
): Promise<boolean> => {
  const siteVerifyUrl = new URL(SITE_VERIFY_URL);
  siteVerifyUrl.searchParams.set('secret', secretKey);
  siteVerifyUrl.searchParams.set('response', token);

  const recaptchaResponse = await fetch(siteVerifyUrl, {
    method: 'POST',
  });

  const recaptchaResponseJson: RecaptchaResJson = await recaptchaResponse.json();

  logInfo(
    {
      key: 'captchaValidation',
      token,
      recaptchaRes: recaptchaResponseJson,
    },
    'Validated CAPTCHA',
  );

  const { success, score } = recaptchaResponseJson;
  if (!success || score < SCORE_THRESHOLD) {
    return false;
  }

  return true;
};
