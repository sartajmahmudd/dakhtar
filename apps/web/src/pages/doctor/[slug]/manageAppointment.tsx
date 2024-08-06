import Head from "next/head";

import { ManageAppointment } from "~/components/doctor/ManageAppointment";

const ManageAppointments = () => {
  return (
    <>
      <Head>
        <title>ManageAppointments - Dakthar.com</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <ManageAppointment />
      </div>
    </>
  );
};

export default ManageAppointments;
