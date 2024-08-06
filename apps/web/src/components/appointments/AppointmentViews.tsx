import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { api } from "~/utils/api";
import { useUser } from "~/utils/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { AppointmentsForDoctor, AppointmentsForPatient } from "./Appointments";

export const AppointmentSkeleton = () => {
  return (
    <main className="min-h-screen animate-pulse">
      <div className="lg:flex lg:justify-evenly">
        <div className="mr-[37px] flex w-96 flex-col justify-center py-8">
          <div className="mb-8 mt-3 flex justify-between gap-9">
            <div className="h-6 w-20 bg-gray-300 pb-2"></div>

            <div className="h-6 w-20 bg-gray-300 pb-2"></div>

            <div className="h-6 w-20 bg-gray-300 pb-2"></div>
          </div>

          {[1, 2, 3, 4].map((digit) => (
            <div key={digit}>
              <div className="mb-5 mt-2 h-6 w-52 bg-gray-300 text-start"></div>
              <div className="flex">
                <div className="mr-8 h-20 w-20 overflow-hidden rounded-full bg-gray-300"></div>

                <div className="text-start">
                  <div className="mb-1 h-[16.8px] w-28 bg-gray-300"></div>
                  <div className="mb-1 h-[19px] w-20 bg-gray-300"></div>
                  <div className="mb-1 h-[16px] w-24 bg-gray-300"></div>
                  <div className="mb-1 h-[16px] w-16 bg-gray-300"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mr-[50px] mt-20 hidden h-[400px] w-[400px] overflow-hidden rounded-full bg-gray-300 lg:flex">
          <div></div>
        </div>
      </div>
    </main>
  );
};

export const PatientAppointmentView = () => {
  const [user] = useUser();
  const doctorList = api.appointment.getMyAppointmentsForPatient.useQuery(
    undefined,
    {
      enabled: !!user && user.role === "PATIENT",
    },
  );

  const isPatientView =
    user?.role === "PATIENT" &&
    doctorList.data &&
    doctorList.data.appointments.length > 0;

  if (doctorList.isLoading) {
    return <AppointmentSkeleton />;
  }

  if (doctorList.error) {
    return (
      <div className="flex h-screen items-center justify-center text-2xl font-semibold text-red-500">
        Something went wrong. Please refresh or try again later.
      </div>
    );
  }

  return (
    <>
      {isPatientView && (
        <div className="mt-2">
          <AppointmentsForPatient appointments={doctorList.data.appointments} />
        </div>
      )}

      {user && !isPatientView && (
        <div className="mt-5 flex flex-col gap-8 lg:mt-10">
          <h3 className="font-semibold">You have no appointments</h3>
          <div className="flex justify-center">
            <Image
              src="/assets/images/get_appointment.png"
              width={300}
              height={300}
              alt="get_appointment"
            />
          </div>
          <div className="mx-auto">
            <Link
              href={`/doctor`}
              className="w-fit rounded-[15px] bg-[#0099FF] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF]"
            >
              Get Appointment
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export const DoctorAppointmentView = () => {
  const [user] = useUser();
  const patientList = api.appointment.getMyAppointmentsForDoctor.useQuery(
    undefined,
    {
      enabled: !!user && user.role === "DOCTOR",
    },
  );

  const isDoctorView =
    user?.role === "DOCTOR" &&
    patientList.data &&
    patientList.data.appointments.length > 0;

  if (patientList.isLoading) {
    return <AppointmentSkeleton />;
  }

  if (patientList.error) {
    return (
      <div className="flex h-screen items-center justify-center text-2xl font-semibold text-red-500">
        Something went wrong. Please refresh or try again later.
      </div>
    );
  }

  return (
    <>
      {isDoctorView && (
        <div className="mt-2">
          <AppointmentsForDoctor appointments={patientList.data.appointments} />
        </div>
      )}

      {user && !isDoctorView && (
        <div className="mt-2">
          <h3 className="text-center text-2xl font-semibold">
            You have no appointments
          </h3>
        </div>
      )}
    </>
  );
};

export const AdminAppointmentView = () => {
  const [user] = useUser();
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const doctorList = api.appointment.getAdminDoctorList.useQuery(undefined, {
    enabled: !!user && user.role === "ADMIN",
    onSuccess: (resp) => {
      if (resp.list.length > 0 && resp.list[0]?.id) {
        setDoctorId(resp.list[0].id);
      }
    },
  });

  const appointmentsOfPatients =
    api.appointment.getMyAppointmentsForDoctorById.useQuery(
      {
        doctorId: doctorId,
      },
      {
        enabled: !!user && user.role === "ADMIN" && !!doctorId,
      },
    );

  const isAdminView =
    user?.role === "ADMIN" &&
    doctorList.data &&
    doctorList.data.list.length > 0;

  if (
    doctorList.isLoading
    // || appointmentsOfPatients.isLoading
  ) {
    return <AppointmentSkeleton />;
  }

  if (doctorList.error ?? appointmentsOfPatients.error) {
    return (
      <div className="flex h-screen items-center justify-center text-2xl font-semibold text-red-500">
        Something went wrong. Please refresh or try again later.
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Appointment - Dakthar.com</title>
        <meta name="appointment view" content="dakthar.com" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <>
        {!isAdminView && (
          <div className="mt-2">
            <h3 className="text-center text-2xl font-semibold">
              You have no appointments
            </h3>
          </div>
        )}

        {isAdminView && (
          <div className="pt-5">
            <Select onValueChange={(value) => setDoctorId(parseInt(value, 10))}>
              <SelectTrigger className="lg:mx-auto lg:w-1/2">
                <SelectValue placeholder="Select Doctor" />
              </SelectTrigger>

              <SelectContent>
                {doctorList.data.list.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id.toString()}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {appointmentsOfPatients.isLoading ? (
              <AppointmentSkeleton />
            ) : (
              <AppointmentsForDoctor
                appointments={appointmentsOfPatients.data.appointments}
              />
            )}
          </div>
        )}
      </>
    </>
  );
};
