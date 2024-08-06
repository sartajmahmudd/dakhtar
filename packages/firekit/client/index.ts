export * from "./src/app";
export * from "./src/store";
export * from "./src/db";
export { onSnapshot } from "firebase/firestore";
export {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  onAuthStateChanged,
  onIdTokenChanged,
  signOut,
} from "firebase/auth";

export type { ConfirmationResult, User, ParsedToken } from "firebase/auth";
export type { Timestamp } from "firebase/firestore";
