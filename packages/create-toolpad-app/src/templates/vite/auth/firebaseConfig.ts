import { Template } from '../../../types';

const firebaseConfigTemplate: Template = () => `import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const requiredEnvVars = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGE_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check for missing environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.warn(\`Missing required environment variable: \${key}\`);
  }
});

const app = initializeApp({
  apiKey: requiredEnvVars.VITE_FIREBASE_API_KEY,
  authDomain: requiredEnvVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: requiredEnvVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: requiredEnvVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: requiredEnvVars.VITE_FIREBASE_MESSAGE_SENDER_ID,
  appId: requiredEnvVars.VITE_FIREBASE_APP_ID,
});

export const firebaseAuth = getAuth(app);
export default app;`;

export default firebaseConfigTemplate;
