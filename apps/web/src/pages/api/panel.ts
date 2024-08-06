import type { NextApiRequest, NextApiResponse } from "next";
import { renderTrpcPanel } from "trpc-panel";

import { appRouter } from "@dakthar/api";

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  const isDev = process.env.NODE_ENV === "development";

  const documentation = renderTrpcPanel(appRouter, {
    url: "http://localhost:3000/api/trpc",
    transformer: "superjson",
  });

  const statusCOde = isDev ? 200 : 404;
  const customResponse = isDev ? documentation : "Not Found";

  res.status(statusCOde).send(customResponse);
}
