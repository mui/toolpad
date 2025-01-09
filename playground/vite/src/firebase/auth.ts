import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  getAdditionalUserInfo,
  signOut,
} from 'firebase/auth';
import { firebaseAuth } from './firebaseConfig';

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Sign in with Google functionality
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
};

// Sign in with GitHub functionality
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
};

// Sign in with email and password

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
}

// Sign up with email and password
const actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be in the authorized domains list in the Firebase Console.
  url: 'http://localhost:5173/sign-up?partial=true&provider=email',
  // This must be true.
  handleCodeInApp: true,
};

export async function signUpWithCredentials(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    return {
      success: true,
      user: userCredential.user,
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      user: null,
      error: error.message || 'Failed to sign in with email/password',
    };
  }
}

// Sign up with email link
export async function signUpWithEmailLink(email: string, callbackUrl?: string) {
  try {
    if (callbackUrl) {
      actionCodeSettings.url += new URLSearchParams({ callbackUrl }).toString();
    }
    await sendSignInLinkToEmail(firebaseAuth, email, actionCodeSettings);

    // The link was successfully sent. Inform the user.
    // Save the email locally so you don't need to ask the user for it again
    // if they open the link on the same device.
    localStorage.setItem('toolpad-firebase-signup-partial', email);

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      user: null,
      error: error.message,
    };
  }
}

export async function completeSignUpWithEmailLink() {
  // Confirm the link is a sign-in with email link.
  if (isSignInWithEmailLink(firebaseAuth, window.location.href)) {
    // Additional state parameters can also be passed via URL.
    // This can be used to continue the user's intended action before triggering
    // the sign-in operation.
    // Get the email if available. This should be available if the user completes
    // the flow on the same device where they started it.
    const email = window.localStorage.getItem('toolpad-firebase-signup-partial');

    // The client SDK will parse the code from the link for you.
    try {
      if (email) {
        const result = await signInWithEmailLink(firebaseAuth, email, window.location.href);

        // Clear email from storage.
        window.localStorage.removeItem('emailForSignIn');
        // You can access the new user by importing getAdditionalUserInfo
        // and calling it with result:
        const user = getAdditionalUserInfo(result);
        return {
          success: true,
          user,
          error: null,
        };
      }
      return {
        error: "Error accessing the user's email address for sign up verification",
        success: false,
        user: null,
      };
    } catch (error: any) {
      // Some error occurred, you can inspect the code: error.code
      // Common errors could be invalid email and invalid or expired OTPs.
      return {
        success: false,
        error: error.message,
        user: null,
      };
    }
  }
  return {};
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
};
