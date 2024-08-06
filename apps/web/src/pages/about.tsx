import type { NextPage } from "next";
import Head from "next/head";

import { Footer } from "~/components/footer/Footer";

const AboutUs: NextPage = () => {
  return (
    <>
      <Head>
        <title>About Us - Dakthar.com</title>
        <meta name="patient view" content="dakthar.com" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="mx-[20px] flex min-h-screen flex-col lg:mx-[90px]">
        <div className="mb-10 flex flex-grow flex-col gap-3">
          <p className="mt-5 text-[20px] font-semibold leading-[36px] tracking-[0.3px] lg:mt-10 lg:text-[30px]">
            About Us
          </p>

          <h2 className="font-semibold">
            <a target="_blank" rel="noreferrer" href="http://Dakthar.com">
              Dakthar.com
            </a>{" "}
            Ltd.: Your Trusted Health Partner
          </h2>
          <p>
            At{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="http://Dakthar.com"
              className="text-[#0099FF]"
            >
              Dakthar.com
            </a>{" "}
            Ltd., we are dedicated to revolutionizing healthcare access and
            management. Our platform bridges the gap between patients and
            healthcare providers, offering seamless appointment bookings and
            efficient healthcare management.
          </p>

          <h2 className="font-semibold">Our Vision and Services</h2>
          <ul className="ml-8 list-outside list-disc">
            <li>
              <span className="font-semibold">
                Empowering Patients and Providers:
              </span>{" "}
              We provide an intuitive platform for patients to find and book
              appointments with healthcare providers effortlessly.
            </li>
            <li>
              <span className="font-semibold">
                Innovative Healthcare Solutions:
              </span>{" "}
              Leveraging technology, we offer solutions like live updates for
              patients and self-appointment bookings, catering to the dynamic
              needs of modern healthcare.
            </li>
          </ul>

          <h2 className="font-semibold">Commitment to Privacy</h2>
          <ul className="ml-8 list-outside list-disc">
            <li>
              <span className="font-semibold">Protecting Your Data:</span> We
              adhere to the UK Data Protection Act 2018 (GDPR), ensuring the
              highest standards of data privacy and security.
            </li>
            <li>
              <span className="font-semibold">Transparency and Control:</span>{" "}
              Our practices are designed to respect your privacy. We do not sell
              personal information and offer clear options to manage your data.
            </li>
          </ul>

          <h2 className="font-semibold">Looking Ahead</h2>
          <ul className="ml-8 list-outside list-disc">
            <li>
              We are continuously evolving, adding new features and
              functionalities that respond to the needs of our users and the
              healthcare community. Join us on our journey to transform
              healthcare and enhance the wellbeing of communities worldwide.
            </li>
          </ul>

          <h2 className="font-semibold">Our Location:</h2>
          <ul className="ml-8 list-outside list-disc">
            <li>
              <span className="font-semibold">Headquarters:</span> 126 Tower
              Hamlets Road, London, E7 9DB, UNITED KINGDOM
            </li>
          </ul>

          <h2 className="font-semibold">Contact Us:</h2>
          <ul className="ml-8 list-outside list-disc">
            <li>
              For any inquiries or feedback, please reach out to us at{" "}
              <a href="mailto:info@dakthar.com" className="text-[#0099FF]">
                info@dakthar.com
              </a>
              .
            </li>
          </ul>
        </div>
        <Footer />
      </section>
    </>
  );
};

export default AboutUs;
