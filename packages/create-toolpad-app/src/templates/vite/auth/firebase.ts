import { Template } from '../../../types';

const firebaseAuthTemplate: Template = (options) => {
  const { hasCredentialsProvider = true } = options;

  const hasGoogleProvider = true;
  const hasGithubProvider = true;

  return `import {
  ${[
    ...(hasGoogleProvider ? ['GoogleAuthProvider,'] : []),
    ...(hasGithubProvider ? ['GithubAuthProvider,'] : []),
    'setPersistence,',
    'browserSessionPersistence,',
    ...(hasCredentialsProvider ? ['signInWithEmailAndPassword,'] : []),
    'signInWithPopup,',
    'signOut,',
  ].join('\n  ')}
} from 'firebase/auth';
import { firebaseAuth } from './firebaseConfig';

${hasGoogleProvider ? 'const googleProvider = new GoogleAuthProvider();' : ''}
${hasGithubProvider ? 'const githubProvider = new GithubAuthProvider();' : ''}

${
  hasGoogleProvider
    ? `// Sign in with Google functionality
export const signInWithGoogle = async () => {
  try {
    return setPersistence(firebaseAuth, browserSessionPersistence).then(async () => {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      return {
        success: true,
        user: result.user,
        error: null,
      };
    });
  } catch (error: any) {
    return {
      success: false,
      user: null,
      error: error.message,
    };
  }
};`
    : ''
}

${
  hasGithubProvider
    ? `// Sign in with GitHub functionality
export const signInWithGithub = async () => {
  try {
    return setPersistence(firebaseAuth, browserSessionPersistence).then(async () => {
      const result = await signInWithPopup(firebaseAuth, githubProvider);
      return {
        success: true,
        user: result.user,
        error: null,
      };
    });
  } catch (error: any) {
    return {
      success: false,
      user: null,
      error: error.message,
    };
  }
};`
    : ''
}

${
  hasCredentialsProvider
    ? `// Sign in with email and password
export async function signInWithCredentials(email: string, password: string) {
  try {
    return setPersistence(firebaseAuth, browserSessionPersistence).then(async () => {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return {
        success: true,
        user: userCredential.user,
        error: null,
      };
    });
  } catch (error: any) {
    return {
      success: false,
      user: null,
      error: error.message || 'Failed to sign in with email/password',
    };
  }
}`
    : ''
}

// Sign out functionality
export const firebaseSignOut = async () => {
  try {
    await signOut(firebaseAuth);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Auth state observer
export const onAuthStateChanged = (callback: (user: any) => void) => {
  return firebaseAuth.onAuthStateChanged(callback);
};`;
};

export default firebaseAuthTemplate;
