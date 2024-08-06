import type { NextPage } from "next";

import { render } from "@dakthar/emails/";
import { PostAppointmentCreation } from "@dakthar/emails/src/custom";

const Email = PostAppointmentCreation;

const Appointment: NextPage = () => {
  const props = {
    patientName: "John Doe",
    doctorName: "Dr. Jane Doe",
    date: "2021-10-10",
    time: "10:00 AM - 11:00 AM",
    location: "Dhaka, Bangladesh",
    serialNo: "12",
  };

  const markup = render(<Email {...props} />, { pretty: true });
  return (
    <>
      <iframe
        title="custom email preview"
        srcDoc={markup}
        className="h-[calc(100vh_-_70px)] w-full"
      />
    </>
  );
};

export default Appointment;
