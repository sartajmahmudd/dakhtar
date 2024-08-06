import type { ServiceAccount } from "firebase-admin";
import firebaseAdmin from "firebase-admin";

// import { getAuth as _getAuth } from "firebase-admin/auth";

import { env } from "../env.mjs";

export type { UserRecord } from "firebase-admin/auth";

const serviceAccount = {
  project_id: env.FIREBASE_PROJECT_ID,
  private_key: env.FIREBASE_PRIVATE_KEY,
  client_email: env.FIREBASE_CLIENT_EMAIL,
} as ServiceAccount;

export const admin = () => {
  if (firebaseAdmin.apps.length === 0) {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(serviceAccount),
    });
  }
  return firebaseAdmin;
};

// export const app = () => {
//   if (firebaseAdmin.apps.length === 0) {
//     return initializeApp(serviceAccount);
//   }
//   const a =  firebaseAdmin.app()
//   return a;
// };

// export const getAuth = () => {
//   const _app = app();
//   return _getAuth(_app);
// };
