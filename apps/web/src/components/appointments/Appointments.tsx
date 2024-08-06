import { useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"
dayjs.extend(utc);
import type { RouterOutputs } from "@dakthar/api";

import { useAppointmentDetails } from "~/utils/hooks";
import { Button } from "../ui/button";
import { AppointmentDetails } from "./AppointmentDetails";
import {
  AppointmentListDoctor,
  AppointmentListPatient,
} from "./AppointmentList";

type AppointmentState = "upcoming" | "completed" | "cancelled";

type DoctorAppointment =
  RouterOutputs["appointment"]["getMyAppointmentsForDoctor"]["appointments"][number];

type PatientAppointment =
  RouterOutputs["appointment"]["getMyAppointmentsForPatient"]["appointments"][number];
interface PropsAppointmentsForDoctor {
  appointments: DoctorAppointment[];
}

interface PropsAppointmentsForPatient {
  appointments: PatientAppointment[];
}

export const AppointmentsForDoctor = (props: PropsAppointmentsForDoctor) => {
  const [activeState, setActiveState] = useState<AppointmentState>("upcoming");
  const [details] = useAppointmentDetails();

  const Today = dayjs().utc();

  const upcomingAppointments = props.appointments.filter((appointment) => {
    return (
      (dayjs.utc(appointment.date).isAfter(Today, 'day') || Today) &&
      appointment.status !== "CANCELLED"
    );
  });

  const completedAppointments = props.appointments.filter((appointment) => {
    return (
      dayjs.utc(appointment.date).isBefore(Today, 'day') &&
      appointment.status !== "CANCELLED"
    );
  });

  const cancelledAppointments = props.appointments.filter((appointment) => {
    return appointment.status === "CANCELLED";
  });

  const handleActiveState = (state: AppointmentState) => {
    setActiveState(state);
  };

  const activeAppointmentView = {
    upcoming: upcomingAppointments,
    completed: completedAppointments,
    cancelled: cancelledAppointments,
  };

  return (
    <main className="min-h-screen">
      <div className="lg:flex lg:justify-evenly">
        <div
          className={`flex flex-col justify-center py-8 lg:w-96 ${details && "pointer-events-none lg:pointer-events-auto"
            }`}
        >
          <div className="mb-8 flex justify-between">
            <Button
              onClick={() => handleActiveState("upcoming")}
              className={`rounded-none bg-transparent px-0 pb-2 text-[14px] font-semibold leading-[19.6px] ${activeState === "upcoming"
                ? "border-b-2 border-b-black text-black"
                : "text-muted-foreground"
                }`}
            >
              Upcoming
            </Button>

            <Button
              onClick={() => handleActiveState("completed")}
              className={`rounded-none bg-transparent px-0 pb-2 text-[14px] font-semibold leading-[19.6px] ${activeState === "completed"
                ? "border-b-2 border-b-black text-black"
                : "text-muted-foreground"
                }`}
            >
              Completed
            </Button>

            <Button
              onClick={() => handleActiveState("cancelled")}
              className={`rounded-none bg-transparent px-0 pb-2 text-[14px] font-semibold leading-[19.6px] ${activeState === "cancelled"
                ? "border-b-2 border-b-black text-black"
                : "text-muted-foreground"
                }`}
            >
              Cancelled
            </Button>
          </div>

          <AppointmentListPatient
            appointmentLists={activeAppointmentView[activeState]}
          />
        </div>

        {!details ? (
          <div className="my-auto hidden lg:flex">
            <Image
              src="/assets/images/appointment.jpg"
              width={500}
              height={550}
              alt="appointment"
            />
          </div>
        ) : (
          <div className="absolute top-[185px] my-auto w-[89.5%] rounded-[15px] border bg-white py-8 shadow-lg lg:relative lg:top-0 lg:w-1/2 lg:border-none lg:py-0 lg:shadow-none">
            <AppointmentDetails />
          </div>
        )}
      </div>
    </main>
  );
};

export const AppointmentsForPatient = (props: PropsAppointmentsForPatient) => {
  const [activeState, setActiveState] = useState<AppointmentState>("upcoming");
  const [details] = useAppointmentDetails();

  const Today = dayjs().utc();

  const upcomingAppointments = props.appointments.filter((appointment) => {
    return (
      (dayjs.utc(appointment.date).isAfter(Today, 'day') || Today) &&
      appointment.status !== "CANCELLED"
    );
  });

  const completedAppointments = props.appointments.filter((appointment) => {
    return (
      dayjs.utc(appointment.date).isBefore(Today, 'day') &&
      appointment.status !== "CANCELLED"
    );
  });

  const cancelledAppointments = props.appointments.filter((appointment) => {
    return appointment.status === "CANCELLED";
  });

  const handleActiveState = (state: AppointmentState) => {
    setActiveState(state);
  };

  const activeAppointmentView = {
    upcoming: upcomingAppointments,
    completed: completedAppointments,
    cancelled: cancelledAppointments,
  };

  return (
    <main className="min-h-screen">
      <div className="lg:flex lg:justify-evenly">
        <div
          className={`flex flex-col justify-center py-8 lg:w-96 ${details && "pointer-events-none lg:pointer-events-auto"
            }`}
        >
          <div className="mb-8 flex justify-between">
            <Button
              onClick={() => handleActiveState("upcoming")}
              className={`rounded-none bg-transparent px-0 pb-2 text-[14px] font-semibold leading-[19.6px] ${activeState === "upcoming"
                ? "border-b-2 border-b-black text-black"
                : "text-muted-foreground"
                }`}
            >
              Upcoming
            </Button>

            <Button
              onClick={() => handleActiveState("completed")}
              className={`rounded-none bg-transparent px-0 pb-2 text-[14px] font-semibold leading-[19.6px] ${activeState === "completed"
                ? "border-b-2 border-b-black text-black"
                : "text-muted-foreground"
                }`}
            >
              Completed
            </Button>

            <Button
              onClick={() => handleActiveState("cancelled")}
              className={`rounded-none bg-transparent px-0 pb-2 text-[14px] font-semibold leading-[19.6px] ${activeState === "cancelled"
                ? "border-b-2 border-b-black text-black"
                : "text-muted-foreground"
                }`}
            >
              Cancelled
            </Button>
          </div>
          <AppointmentListDoctor
            appointmentLists={activeAppointmentView[activeState]}
          />
        </div>

        {!details ? (
          <div className="my-auto hidden lg:flex">
            <Image
              src="/assets/images/appointment.jpg"
              width={500}
              height={550}
              alt="appointment"
            />
          </div>
        ) : (
          <div className="absolute top-[185px] my-auto w-[89.5%] rounded-[15px] border bg-white py-8 shadow-lg lg:relative lg:top-0 lg:w-1/2 lg:border-none lg:py-0 lg:shadow-none">
            <AppointmentDetails />
          </div>
        )}
      </div>
    </main>
  );
};
