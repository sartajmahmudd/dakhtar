import axios from "axios";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { config, logger, region } from "firebase-functions";

type User = {
  uid: string;
  phoneNumber?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
};

initializeApp();

const saveUserOnFirestore = async (user: User) => {
  return getFirestore()
    .collection("users")
    .doc(user.uid)
    .set(
      {
        uid: user.uid,
        phone: user?.phoneNumber ?? null,
        email: user?.email ?? null,
        displayName: user?.displayName ?? null,
        photoURL: user?.photoURL ?? null,
      },
      {
        merge: true,
      },
    );
};

const syncWithExternalService = async (user: User) => {
  // send id and phone no to webhook
  const url = config().webhookconfigs.url;
  const secret = config().webhookconfigs.secret;

  if (!url || !secret) {
    logger.error("Missing webhook url or secret");
    return;
  }

  const headers = { "x-webhook-secret": secret };
  const body = {
    id: user.uid,
    phone: user?.phoneNumber ?? null,
    email: user?.email ?? null,
    displayName: user?.displayName ?? null,
    photoURL: user?.photoURL ?? null,
  };
  return axios.post(url, body, { headers });
};

exports.createUserDocument = region("asia-southeast1")
  .auth.user()
  .onCreate(async (user) => {
    // ! phoneNumber, email, displayName, photoURL are optional
    const userInfo = {
      uid: user.uid,
      phoneNumber: user.phoneNumber,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };

    try {
      const promises = await Promise.allSettled([
        saveUserOnFirestore(userInfo),
        syncWithExternalService(userInfo),
      ]);

      const failedPromises = promises.filter(
        (promise) => promise.status === "rejected",
      ) as PromiseRejectedResult[];

      if (failedPromises.length > 0) {
        logger.error(
          `Failed to create user document for ${user.uid}`,
          failedPromises.map((promise) => promise.reason),
        );

        logger.error(
          "Failed to sync user with external service",
          failedPromises,
        );

        return;
      }

      logger.info(`Successfully created user document for ${user.uid}`);
      return promises;
    } catch (error) {
      logger.error(`Error creating user document for ${user.uid}`, error);
      return;
    }
  });
