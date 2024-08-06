import type { AppType } from "next/app";

import "~/styles/globals.css";

import { Montserrat } from "next/font/google";

const mon = Montserrat({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-inter",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={`${mon.className}`}>
      <Component {...pageProps} />
    </main>
  );
};

export default MyApp;
