import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { TiPlus } from "react-icons/ti";

// import { AppointmentTable } from "~/components/admin/AppointmentTable";
import { UpdateLiveAppointmentStatus } from "~/components/LiveAppointment";
import { Loader } from "~/components/loader/Loader";
import { api } from "~/utils/api";
import { toTitleCase } from "~/utils/helper";

const Admin = () => {
  const router = useRouter();
  const slug = router.query.slug as string;
  const doctorInfo = api.doctor.getBySlug.useQuery(
    { slug },
    {
      enabled: !!slug,
    },
  );
  const appointments = api.appointment.getAppointments.useQuery(
    { slug, },
    {
      enabled: !!slug,
    },
  );
  const [parent] = useAutoAnimate();

  if (appointments.isLoading || doctorInfo.isLoading) {
    return <Loader />;
  }

  if (appointments.isError || doctorInfo.isError) {
    return <div>Error: {appointments?.error?.message}</div>;
  }

  return (
    <>
      <Head>
        <title>
          Admin {toTitleCase(`${doctorInfo?.data?.user.name ?? "N/A"}`)}
        </title>
        <meta name="description" content="Generated by create-t3-app" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main ref={parent}>
        <h2 className="mx-[20px] mt-5 text-[20px] font-semibold leading-[36px] tracking-[0.3px] lg:mx-[90px] lg:mt-10 lg:text-[30px]">
          Live Serial Update
        </h2>

        <div className="mx-[20px] mt-4 flex items-center justify-between lg:mx-[90px] lg:mt-6">
          <div className="w-full lg:w-1/2">
            <Link
              href={`/booking/${slug}`}
              className="flex w-fit items-center gap-2 rounded-[15px] bg-[#0099FF] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF]"
            >
              <TiPlus /> New Appointment
            </Link>
            <div>
              <UpdateLiveAppointmentStatus doctorSlug={slug} />
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-[15px] lg:block lg:w-5/12">
            <Image
              src="/assets/images/appointment-serial.jpg"
              width={200}
              height={200}
              alt="appointment-serial"
              className="w-full"
            />
          </div>
        </div>

        <section className="mx-[20px] mt-5 lg:mx-[90px] lg:mt-0">
          <h2 className="text-[20px] font-semibold leading-[36px] tracking-[0.3px] lg:text-[30px]">
            Patient Appointment List
          </h2>
          {/* {appointments.data && (
            <AppointmentTable appointments={appointments.data.appointments} />
          )} */}
        </section>
      </main>
    </>
  );
};

export default Admin;
