const SITE_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const SCORE_THRESHOLD = 0.5;

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

  const { success, score } = await recaptchaResponse.json();
  if (!success || score < SCORE_THRESHOLD) {
    return false;
  }

  return true;
};
