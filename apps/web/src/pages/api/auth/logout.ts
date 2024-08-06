import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    // Correctly return after sending a response for non-POST methods
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const options = { httpOnly: true, secure: true, maxAge: 0, path: "/" };
    const cookie = serialize("session", "", options);
    res.setHeader("Set-Cookie", cookie);
    res.status(200).json({ redirectUrl: "/login" });
  } catch (error) {
    console.error(error);
    res.status(401).send("UNAUTHORIZED REQUEST!");
  }
}
