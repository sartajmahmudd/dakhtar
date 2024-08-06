import type { AppType } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { api } from "~/utils/api";

import "~/styles/globals.css";

import { Navbar } from "~/components/navbar/Navbar";
import { useAuthState } from "~/utils/auth";

const MyApp: AppType = ({ Component, pageProps }) => {
  useAuthState();
  return (
    <main>
      <Navbar />
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </main>
  );
};

export default api.withTRPC(MyApp);
// export default MyApp;
