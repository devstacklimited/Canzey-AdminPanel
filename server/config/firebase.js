import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Firebase Admin SDK Configuration
// Parse private key robustly — handles \\n, \n, and literal newlines (WHM/cPanel safe)
const parsePrivateKey = (key) => {
  if (!key) return undefined;
  // Replace literal \n sequences (common in cPanel .env) with actual newlines
  return key.replace(/\\n/g, '\n').replace(/\\r/g, '');
};

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin SDK initialized');
  console.log('   🔥 Firebase Project:', process.env.FIREBASE_PROJECT_ID || 'NOT SET - CHECK .env!');
  console.log('   📧 Service Account:', process.env.FIREBASE_CLIENT_EMAIL || 'NOT SET - CHECK .env!');
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  console.error('   Check that FIREBASE_PROJECT_ID and FIREBASE_PRIVATE_KEY are set in your .env');
}

// Firebase Web Configuration (for Flutter and Web clients)
export const firebaseWebConfig = {
  apiKey: process.env.FIREBASE_WEB_API_KEY,
  authDomain: process.env.FIREBASE_WEB_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_WEB_PROJECT_ID,
  storageBucket: process.env.FIREBASE_WEB_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_WEB_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_WEB_APP_ID,
  measurementId: process.env.FIREBASE_WEB_MEASUREMENT_ID
};

export default admin;
