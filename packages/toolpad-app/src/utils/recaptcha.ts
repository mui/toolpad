export const getRecaptchaToken = async (siteKey: string): Promise<string> => {
  await new Promise<void>((resolve) => grecaptcha.ready(resolve));
  return grecaptcha.execute(siteKey, {
    action: 'submit',
  });
};

const SITE_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const SCORE_THRESHOLD = 0.5;

export const validateRecaptchaToken = async (
  secretKey: string,
  token: string,
): Promise<boolean> => {
  const recaptchaParams = new URLSearchParams({
    secret: secretKey,
    response: token,
  });
  const siteVerifyUrlWithParams = `${SITE_VERIFY_URL}?${recaptchaParams}`;

  const recaptchaResponse = await fetch(siteVerifyUrlWithParams, {
    method: 'POST',
  });

  const { success, score } = await recaptchaResponse.json();
  if (!success || score < SCORE_THRESHOLD) {
    return false;
  }

  return true;
};
