import Head from "next/head";

import { Footer } from "~/components/footer/Footer";

const Index = () => {
  return (
    <>
      <Head>
        <title>Internal Server Error</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="flex min-h-screen flex-col">
        <div className="flex h-[45vh] flex-grow flex-col items-center justify-center text-[20px] font-[700] lg:text-[30px]">
          <p>Error 500. Internal Server Error</p>
          <p>Please Contact Administrator</p>
        </div>

        <div className="mx-[20px] lg:mx-[90px] ">
          <Footer />
        </div>
      </section>
    </>
  );
};

export default Index;
