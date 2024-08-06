import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { prisma } from "@dakthar/db";
import { BANGLADESHI_PHONE_NUMBER_REGEX } from "@dakthar/shared";

import { env } from "~/env.mjs";

const schema = z.object({
  id: z.string(),
  phone: z.string().regex(BANGLADESHI_PHONE_NUMBER_REGEX),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().url().nullable(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    // Handle any other HTTP method
    res.status(405).json({ error: "Not Allowed" });
  }

  const secret = req.headers["x-webhook-secret"];
  if (secret !== env.WEBHOOK_FIREBASE_SECRET) {
    console.log("Unauthorized access attempt with secret", secret);
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    id: firebaseId,
    phone,
    // email,
    // displayName,
    // photoURL,
  } = schema.parse(req.body);

  if (!firebaseId) {
    res.status(400).json({ error: "Bad Request" });
  }

  try {
    const standerizedPhone = phone.replace(/^\+880/, "0"); // +8801712345678 -> 01712345678

    const user = await prisma.user.findFirst({
      where: {
        phone: standerizedPhone,
      },
    });

    if (user) {
      // update doctor with firebase id
      const updateResp = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          firebaseId,
        },
      });

      console.log(JSON.stringify(updateResp));
    } else {
      // create new user
      await prisma.user.create({
        data: {
          firebaseId,
          phone: standerizedPhone,
        },
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
}
