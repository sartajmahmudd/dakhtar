import Image from "next/image";
import dayjs from "dayjs";
import dayjsAdvancedFormat from "dayjs/plugin/advancedFormat";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { IoIosArrowBack } from "react-icons/io";
import { LuAlarmClock } from "react-icons/lu";
import { SlCalender } from "react-icons/sl";

import { useAppointmentDetails } from "~/utils/hooks";
import { Button } from "../ui/button";

interface PropsRoleBasedImage {
  imageUrl: string | null;
  gender: "MALE" | "FEMALE" | "OTHER";
  userRole: "DOCTOR" | "PATIENT";
}

dayjs.extend(dayjsAdvancedFormat);

const RoleBasedImage = (props: PropsRoleBasedImage) => {
  return props.imageUrl ? (
    <div className="mx-auto h-20 w-20 overflow-hidden rounded-full">
      <Image
        src={props.imageUrl}
        width="100"
        height="100"
        alt={`${props.userRole.toLowerCase()} image`}
        className="mx-auto mb-2"
      />
    </div>
  ) : (
    <div className="mx-auto h-20 w-20 overflow-hidden rounded-full">
      <Image
        src={`/assets/images/avatar-${props.userRole.toLowerCase()}-${props.gender.toLowerCase()}.png`}
        width="100"
        height="100"
        alt={`${props.userRole.toLowerCase()} image`}
        className="mx-auto mb-2"
      />
    </div>
  );
};

export const AppointmentDetails = () => {
  const [details, setDetails] = useAppointmentDetails();

  return (
    <div className="w-full px-[20px]">
      <div className="mb-9 flex items-center">
        <Button
          onClick={() => setDetails(null)}
          className="absolute bg-transparent p-0 text-black"
        >
          <IoIosArrowBack className="h-[24px] w-[24px]" />
        </Button>
        <h2 className="mx-auto text-[18px] font-semibold leading-[27px] tracking-[0.3px] text-black">
          Appointment Details
        </h2>
      </div>

      <div className="mb-9 text-center">
        <div>
          {details?.role === "DOCTOR" ? (
            <RoleBasedImage
              gender={details?.doctorGender}
              imageUrl={details?.doctorImage}
              userRole="DOCTOR"
            />
          ) : details?.role === "PATIENT" ? (
            <RoleBasedImage
              gender={details?.patientGender}
              imageUrl={details?.patientImage}
              userRole="PATIENT"
            />
          ) : null}
        </div>
        <div>
          <h2 className="my-1 font-[600px] leading-[24px] text-black">
            {details?.role === "DOCTOR"
              ? `Dr. ${details.doctorName}`
              : details?.role === "PATIENT"
                ? details.patientName
                : "N/A"}
          </h2>
          <h2 className="text-muted-foreground text-[12px] font-[500px] leading-[18px]">
            {details?.role === "DOCTOR" && details?.speciality}
          </h2>
          <h2 className="text-muted-foreground text-[12px] font-[500px] leading-[18px]">
            Licensed Clinical Social Worker
          </h2>
        </div>
      </div>

      <div className="mt-4 flex items-center">
        <div className="mr-5 flex h-[32px] w-[32px] items-center justify-center rounded-[16px] bg-[#EFF1F3]">
          <SlCalender className="h-[18.38px] w-[16.67px] text-[#0099FF]" />
        </div>

        <div>
          <h2 className="text-muted-foreground text-[14px] font-[400px] leading-[24px] ">
            Appointment Time
          </h2>
          <h2 className="text-[14px] font-[600px] leading-[24px] text-black">
            {/* 08/02/2021, 10:30am- 11:00am */}
            {dayjs(details?.date).format("Do MMM YYYY")}, {details?.time}
          </h2>
        </div>
      </div>

      <div className="mt-4 flex items-center">
        <div className="mr-5 flex h-[32px] min-w-[32px] items-center justify-center rounded-[23px] bg-[#EFF1F3]">
          <HiOutlineLocationMarker className="h-[20px] w-[18px] text-[#0099FF]" />
        </div>

        <div className="w-fit">
          <h2 className="text-muted-foreground text-[14px] font-[400px] leading-[24px] ">
            Chamber Appointment
          </h2>
          <h2 className="text-[14px] font-[600px] leading-[24px] text-black">
            {details?.location}
          </h2>
        </div>
      </div>

      <div className="mt-4 flex items-center">
        <div className="mr-5 flex h-[32px] w-[32px] items-center justify-center rounded-[30px] bg-[#EFF1F3]">
          <LuAlarmClock className="h-[18px] w-[19.66px] text-[#0099FF]" />
        </div>

        <div>
          <h2 className="text-muted-foreground text-[14px] font-[400px] leading-[24px] ">
            Waiting List
          </h2>
          <h2 className="text-[14px] font-[600px] leading-[24px] text-black">
            Your Serial : {details?.serialNo}
          </h2>
        </div>
      </div>
    </div>
  );
};
