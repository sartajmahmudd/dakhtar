import Image from "next/image";
import dayjs from "dayjs";

import type { RouterOutputs } from "@dakthar/api";

import { toTitleCase } from "~/utils/helper";
import { useAppointmentDetails } from "~/utils/hooks";
import { Button } from "../ui/button";

type AppointmentsDoctorList =
  RouterOutputs["appointment"]["getMyAppointmentsForPatient"]["appointments"];

type AppointmentsPatientList =
  RouterOutputs["appointment"]["getMyAppointmentsForDoctor"]["appointments"];

export const AppointmentListDoctor = (props: {
  appointmentLists: AppointmentsDoctorList;
}) => {
  const [, setDetails] = useAppointmentDetails();
  return (
    <div className="scrollbar-hide h-screen overflow-y-auto lg:h-[460px]">
      {props.appointmentLists.length !== 0 ? (
        props.appointmentLists.map((appointment) => {
          const imageAlt = appointment.doctorName
            ? `Dr. ${toTitleCase(appointment.doctorName)}`
            : "doctor image";

          return (
            <Button
              key={appointment.id}
              className="mb-1 flex h-auto w-full flex-col items-start bg-transparent pl-0"
              onClick={() => setDetails({ ...appointment, role: "DOCTOR" })}
            >
              <h2 className="mb-5 text-start text-base font-semibold leading-6 text-black">
                {dayjs(appointment.date).format("dddd, MMMM DD, YYYY")}
              </h2>

              <div className="flex">
                <div className="mr-8 h-20 w-20 overflow-hidden rounded-full">
                  {appointment.doctorImage ? (
                    <Image
                      src={appointment.doctorImage}
                      alt={imageAlt}
                      height={100}
                      width={100}
                    />
                  ) : (
                    <Image
                      src={`/assets/images/avatar-doctor-${appointment.doctorGender.toLowerCase()}.png`}
                      alt={imageAlt}
                      height={100}
                      width={100}
                    />
                  )}
                </div>

                <div className="text-start">
                  <h2 className="text-muted-foreground mb-1 text-[12px] leading-[16.8px]">
                    {appointment.type === "IN_PERSON"
                      ? "Chamber Consultation"
                      : "Online Consultation"}
                  </h2>
                  <h2 className="mb-1 text-[14px] font-semibold leading-[19.6px] text-black">
                    Dr. {appointment.doctorName}
                  </h2>
                  <h2 className="mb-1 text-[13px] font-[400] leading-[16px] text-black">
                    {appointment.time}
                  </h2>
                  <h2 className="mb-1 text-[13px] font-[400] leading-[16px] text-black">
                    Serial : {appointment.serialNo}
                  </h2>
                </div>
              </div>
            </Button>
          );
        })
      ) : (
        <h2 className="font-semibold leading-6">
          You have no appointments here!
        </h2>
      )}
    </div>
  );
};

export const AppointmentListPatient = (props: {
  appointmentLists: AppointmentsPatientList;
}) => {
  const [, setDetails] = useAppointmentDetails();

  return (
    <div className="scrollbar-hide h-screen overflow-y-auto lg:h-[460px]">
      {props.appointmentLists.length !== 0 ? (
        props.appointmentLists.map((appointment) => {
          const imageAlt = appointment.patientName
            ? `${toTitleCase(appointment.patientName)}`
            : "patient image";

          return (
            <Button
              key={appointment.id}
              className="mb-1 flex h-auto w-full flex-col items-start bg-transparent pl-0"
              onClick={() => setDetails({ ...appointment, role: "PATIENT" })}
            >
              <h2 className="mb-5 text-start text-base font-semibold leading-6 text-black">
                {dayjs(appointment.date).format("dddd, MMMM DD, YYYY")}
              </h2>

              <div className="flex">
                <div className="mr-8 h-20 w-20 overflow-hidden rounded-full">
                  {appointment.patientImage ? (
                    <Image
                      src={appointment.patientImage}
                      alt={imageAlt}
                      height={100}
                      width={100}
                    />
                  ) : (
                    <Image
                      src={`/assets/images/avatar-patient-${appointment.patientGender.toLowerCase()}.png`}
                      alt={imageAlt}
                      height={100}
                      width={100}
                    />
                  )}
                </div>

                <div className="text-start">
                  <h2 className="text-muted-foreground mb-1 text-[12px] leading-[16.8px]">
                    {appointment.type === "IN_PERSON"
                      ? "Chamber Consultation"
                      : "Online Consultation"}
                  </h2>
                  <h2 className="mb-1 text-[14px] font-semibold leading-[19.6px] text-black">
                    {appointment.patientName}
                  </h2>
                  <h2 className="mb-1 text-[13px] font-[400] leading-[16px] text-black">
                    {appointment.time}
                  </h2>
                  <h2 className="mb-1 text-[13px] font-[400] leading-[16px] text-black">
                    Serial : {appointment.serialNo}
                  </h2>
                </div>
              </div>
            </Button>
          );
        })
      ) : (
        <h2 className="font-semibold leading-6">
          You have no appointments here!
        </h2>
      )}
    </div>
  );
};
