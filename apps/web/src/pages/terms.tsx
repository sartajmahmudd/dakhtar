import Head from "next/head";

import { Footer } from "~/components/footer/Footer";

const terms = () => {
  return (
    <>
      <Head>
        <title>Terms &amp; Conditions - Dakthar.com</title>
        <meta name="patient view" content="dakthar.com" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="mx-[20px] flex min-h-screen flex-col lg:mx-[90px]">
        <div className="mb-10 flex flex-grow flex-col items-start gap-3">
          <p className="mt-5 text-[20px] font-semibold leading-[36px] tracking-[0.3px] lg:mt-10 lg:text-[30px]">
            Terms & Conditions{" "}
          </p>

          <h2 className="font-semibold">
            WE Do Not Sell User&#39;s Personal Information
          </h2>

          <h2 className="font-semibold">OPT-OUT OF THE SALE OF PERSONAL</h2>

          <p>
            <span className="font-semibold">INFORMATION:</span> Dakhtar.com Ltd
            is committed to protecting the privacy rights of our users and
            healthcare providers, and as such Dakhtar.com Ltd does not sell your
            personal information. In order to help us improve our products,
            aggregate statistics, or to allow us to market our services to
            potential users, we may transfer some of your data, such as IP
            addresses or device IDs, to trusted third-party business partners
            and service providers. Under the UK Data Protection Act 2018
            (“GDPR”), effective 2018 some of these ordinary data transfers to
            third parties could constitute a “sale” as broadly defined by the
            law. Under the GDPR, UK residents have the right to opt-out of the
            sale of their personal information. Although we do not sell our
            user&#39;s or healthcare provider&#39;s personal information, we are
            offering users and healthcare providers the ability to opt-out of
            the transfers of such data where those transfers may be considered
            &#34;sales&#34; under the GDPR. If you do not have a Dakhtar.com Ltd
            account, you can opt-out of certain transfers of your IP address,
            device ID, or other forms of browsing data where such transfers may
            be considered “sales” under the GDPR. For more information regarding
            what data we collect and how it may be used, please see our PRIVACY
            POLICY.
          </p>

          <p>
            <span className="font-semibold">REQUEST DATA ACCESS:</span> Under
            the UK Data Protection Act 2018 (&#34;GDPR&#34;), beginning 2018,
            Dakhtar.com Ltd users and healthcare providers have the right to
            request access to their personal information collected within the
            last 12 months. Please note that Dakhtar.com Ltd cannot honor access
            requests sent by practice staff, including office managers or
            receptionists. All healthcare provider&#39;s requests must be made
            directly by the provider. In order to verify your identity, you will
            need to complete a two-step verification process by logging in and
            entering a PIN code sent to the mobile device associated with your
            account. If you are a healthcare provider, you will be asked to
            submit a scan of a valid government photo ID. If Dakhtar.com Ltd can
            verify your identity, you will be sent a link to download your data
            in a readable format via a secure transfer. This may take up to 45
            days, so we&#39;ll be sure to email you when your data is ready to
            be downloaded.
          </p>

          <p>
            <span className="font-semibold">REQUEST DATA DELETION:</span> Under
            the UK Data Protection Act 2018 of 2018 (&#34;GDPR&#34;), beginning
            2018, UK residents have the right to request the permanent deletion
            of their personal information. As a Dakhtar.com Ltd user, you may
            request the permanent deletion of your personal information, but
            please note that deleting your personal information will
            automatically and permanently delete your Dakhtar.com Ltd account.
            If you are a Dakhtar.com Ltd healthcare provider, you will no longer
            be considered active on Dakhtar.com Ltd if you request deletion.
            This deletion cannot be reversed. If you decide to open a new
            account with Dakhtar.com Ltd, your historical data will not be
            accessible. If you would like to retain any of the information in
            your account, you can request access to your Dakhtar.com Ltd data
            prior to deleting your account. If you would like to request the
            deletion of your personal information and your Dakhtar.com Ltd
            account please email us. Please note that Dakhtar.com Ltd cannot
            honor deletion requests sent by practice staff, including office
            managers or receptionists. All healthcare provider&#39;s requests
            must be made directly by the provider. Dakhtar.com Ltd may retain
            some of your personal information as permitted in Data Protection
            Act 2018 of the GDPR.
          </p>

          <p>
            <span className="font-semibold">
              EXCEPTIONS AND EXEMPTIONS UNDER THE GDPR:
            </span>{" "}
            Rights provided by the GDPR are subject to certain exemptions and
            exceptions, as specified in the applicable statutes and/or
            associated regulations issued by UK&#39;s Office of the Attorney
            General. As a business and service provider, Dakhtar.com Ltd may
            retain some of your personal or account data as provided for in GDPR
            Data Protection Act 2018. Additionally, Dakhtar.com Ltd may be
            unable to fulfill your request if we cannot verify your identity to
            the standard the law and applicable regulations require. Please
            ensure your desktop, mobile device, and browser are updated to the
            most recent operating system or release. If your device is out of
            date, some functionality may not be available.
          </p>

          <a
            href="https://drive.google.com/file/d/1zGdtIq1hNP2zVq5EJ-bWxD-863lyKZSx/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="fw-semibold rounded-[15px] border bg-[#0099FF] px-4 py-1 text-white">
              Read More
            </button>
          </a>
        </div>

        <Footer />
      </section>
    </>
  );
};

export default terms;
