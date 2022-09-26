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

  const recaptchaResponse = await fetch(`${SITE_VERIFY_URL}?${recaptchaParams}`, {
    method: 'POST',
  });
  const recaptchaReponseJson = await recaptchaResponse.json();

  if (!recaptchaReponseJson.success || recaptchaReponseJson.score < SCORE_THRESHOLD) {
    return false;
  }

  return true;
};
