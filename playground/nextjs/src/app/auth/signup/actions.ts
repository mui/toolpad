'use server';

import { AuthProvider, SignUpActionResponse } from '@toolpad/core/SignUpPage';

const signupAction = async (
  provider: AuthProvider,
  formData?: FormData,
  _callbackUrl?: string,
): Promise<SignUpActionResponse> => {
  if (provider.id !== 'credentials') {
    return { error: 'Now supporting email authentication only.' };
  }

  const email = formData?.get('email')?.toString();
  const password = formData?.get('password')?.toString();

  if (!email || !password) {
    return { error: 'Email and password are required!' };
  }

  try {
    // Would normally call an API to register the user
    // For example: await api.register({ email, password });
    // Simulating a successful registration
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: 'OK' };
  } catch (err: any) {
    return { error: err.message || 'Failed to register.' };
  }
};

export default signupAction;
