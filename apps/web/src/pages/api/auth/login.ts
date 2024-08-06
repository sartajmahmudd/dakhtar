import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import { z } from "zod";

import type { Role } from "@dakthar/db";
import { prisma } from "@dakthar/db";
import { admin } from "@dakthar/firekit-server";
import { BANGLADESHI_PHONE_NUMBER_REGEX } from "@dakthar/shared";

import { env } from "~/env.mjs";

const schema = z.object({
  token: z.string().min(1),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    // Handle any other HTTP method
    res.status(405).json({ error: "Not Allowed" });
  }

  const { token } = schema.parse(req.body);

  try {
    const decodedToken = await admin().auth().verifyIdToken(token);
    const userRecord = await admin().auth().getUser(decodedToken.uid);

    const firebaseId = userRecord.uid;
    // * phone number will always be present if the provider is phone number auth
    const phone = userRecord?.phoneNumber;
    const isBDPhoneNo = BANGLADESHI_PHONE_NUMBER_REGEX.test(phone!);
    const standerizedPhone = phone!.replace(/^\+880/, "0"); // +8801712345678 -> 01712345678

    if (!isBDPhoneNo) {
      console.error("Token doesn't contain Bangladeshi phone no", phone);
      return res
        .status(401)
        .json({
          error: "Unable to authenticate without a Bangladeshi phone number.",
        });
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ firebaseId }, { phone: standerizedPhone }],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseId,
          phone: standerizedPhone,
        },
      });
    }

    if (!user.firebaseId) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          firebaseId,
        },
      });
    }

    if (!user) {
      console.error("Unable to find user account for phone", phone);
      return res
        .status(401)
        .json({
          error:
            "Something went wrong. Please contact administrator or try again later.",
        });
    }

    const customClaims = {
      id: user.id,
      role: user.role,
      firebaseId: user.firebaseId, // ! this can be obtained directly from token. Remove in future.
      onboarding: user.onboarding,
      name: user.name,
      phone: user.phone,
    };

    const expiresIn = 60 * 60 * 24 * 5; // ! 5 days

    const sessionCookie = await admin()
      .auth()
      .createSessionCookie(token, { expiresIn: expiresIn * 1000 });

    const options = {
      httpOnly: true,
      secure: true,
      maxAge: expiresIn,
      path: "/",
    };
    const cookie = serialize("session", sessionCookie, options);

    const claimToken = jwt.sign(customClaims, env.JWT_SECRET, { expiresIn });
    const claimCookie = serialize("claim", claimToken, options);

    res.setHeader("Set-Cookie", [cookie, claimCookie]);
    const redirectUrl = getRedirectRoute({
      userRole: user.role,
      onboardingStatus: user.onboarding,
    });
    res.status(200).json({ redirectUrl: redirectUrl });
  } catch (error) {
    console.error(error);
    res.status(401).send("UNAUTHORIZED REQUEST!");
  }
}

const getRedirectRoute = (args: {
  userRole: Role;
  onboardingStatus: string;
}) => {
  const { userRole, onboardingStatus } = args;
  // TODO: if user is trying to access protected route, but is not authorized, redirect to onboarding
  // TODO: However, this is only applicable to users who are already logged in and have ANONYMOUS role
  // TODO: others shouldn't be able to access onboarding page and shouldn't be redirected from the current page
  // TODO: rather they should get an unauthorized error message

  const isNewUser =
    userRole === "ANONYMOUS" && onboardingStatus === "NOT_STARTED";

  const isPatientWithoutOnboarding =
    userRole === "PATIENT" && onboardingStatus === "NOT_STARTED";

  const isSuperAdmin =
    userRole === "SUPER_ADMIN" && onboardingStatus === "COMPLETED";

  const isPatient = userRole === "PATIENT" && onboardingStatus === "COMPLETED";

  const isDoctorWithPartialOnboarding =
    userRole === "DOCTOR" && onboardingStatus === "IN_PROGRESS";

  const isDoctorWithCompletedOnboarding =
    userRole === "DOCTOR" && onboardingStatus === "COMPLETED";

  const isAdmin = userRole === "ADMIN" && onboardingStatus === "COMPLETED";

  switch (true) {
    case isNewUser:
    case isPatientWithoutOnboarding:
    case isDoctorWithPartialOnboarding:
      return "/onboarding";
    case isSuperAdmin:
      return "/dashboard";
    case isPatient:
      return "/appointments";
    case isAdmin:
    case isDoctorWithCompletedOnboarding:
      return "/admin";
    default:
      return "/";
  }
};
