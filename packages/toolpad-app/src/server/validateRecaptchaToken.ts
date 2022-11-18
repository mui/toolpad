const SITE_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

const V3_SCORE_THRESHOLD = 0.75;

export interface RecaptchaResJson {
  [key: string]: any;
  success: boolean;
  action: string;
  'error-codes': number[];
  score?: number;
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

  const { success, score } = recaptchaResponseJson;
  if (!success || (score && score < V3_SCORE_THRESHOLD)) {
    return false;
  }

  return true;
};
