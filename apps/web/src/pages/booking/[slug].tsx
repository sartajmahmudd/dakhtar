import { useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import dayjs from "dayjs";
import dayjsAdvancedFormat from "dayjs/plugin/advancedFormat";

import { AppointmentForm } from "~/components/AppointmentForm";
import { PatientForm } from "~/components/PatientForm";

dayjs.extend(dayjsAdvancedFormat);

const Booking: NextPage = () => {
  const [showAppointmentForm, setShowAppointmentForm] = useState(true);
  const [showPatientForm, setShowPatientForm] = useState(false);

  const prev = () => {
    setShowAppointmentForm(true);
    setShowPatientForm(false);
  };

  const next = () => {
    setShowAppointmentForm(false);
    setShowPatientForm(true);
  };

  return (
    <>
      <Head>
        <title>Booking - Dakthar.com</title>
        <meta name="book appointment" content="dakthar.com" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="mx-[20px] mt-5 lg:mx-[90px] lg:mt-10 ">
        {showAppointmentForm ? <AppointmentForm next={next} /> : null}
        {showPatientForm ? <PatientForm prev={prev} next={next} /> : null}
      </main>
    </>
  );
};

export default Booking;
