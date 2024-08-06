import type { NextPage } from "next";
import Head from "next/head";

import {
  AdminAppointmentView,
  DoctorAppointmentView,
  PatientAppointmentView,
} from "~/components/appointments/AppointmentViews";
import { useUser } from "~/utils/auth";

const AppointmentsHome: NextPage = () => {
  const [user] = useUser();

  const roleBasedViews = {
    PATIENT: <PatientAppointmentView />,
    DOCTOR: <DoctorAppointmentView />,
    ADMIN: <AdminAppointmentView />,
    ANONYMOUS: <div>Please complete the onboarding process first.</div>,
    SUPER_ADMIN: <div>You are logged in as a super admin.</div>,
  };

  return (
    <>
      <Head>
        <title>Appointment - Dakthar.com</title>
        <meta name="appointment view" content="dakthar.com" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="mx-[20px] lg:mx-[90px] ">
        {user?.role && roleBasedViews[user.role]}
      </section>
    </>
  );
};

export default AppointmentsHome;
