import React from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { LuAlarmClock } from "react-icons/lu";

import type { $Enums, DayOfWeek } from "@dakthar/db";

import { formatTime } from "~/utils/helper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface Data {
  complaints?: string | undefined;
  findings?: string | undefined;
  diagnosis?: string | undefined;
  medicine?:
    | {
        name: string;
        dosage: string;
        remarks: string;
      }[]
    | undefined;
  advice?: string | undefined;
  followup?: string | undefined;
  visitSummary?: string | undefined;
}

interface HeaderInfo {
  orgLogo: string;
  orgName: string;
  drId: number;
  doctorName: string;
  qualificationsStr: string;
  specialtyStr: string;
  designation: string;
  patientName: string;
  patientGender: string;
  patientAge: number;
}

interface PrescriptionBottomPart {
  availabilities: $Enums.DayOfWeek[];
  startHour: string;
  endHour: string;
  location: string;
  qrCode: string;
}

interface FindingValues {
  findingsName: string;
  leftUpper: Value[];
  rightUpper: Value[];
  leftLower: Value[];
  rightLower: Value[];
}

interface Value {
  position: string;
  letter: string;
}

interface Props {
  data: Data;
  prescriptionHeaderInfo: HeaderInfo;
  findingValues: FindingValues;
  altPrint: boolean;
  prescriptionBottomPart: PrescriptionBottomPart;
}

const DUMMY_DATE_PREFIX = "1970-01-01T";

const PrintLayout = (props: Props) => {
  function formatDoctorAvailability(
    availabilities: DayOfWeek[] | undefined,
  ): string {
    const order = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

    const sortedDays = availabilities?.sort(
      (a, b) => order.indexOf(a) - order.indexOf(b),
    );

    if (!sortedDays || sortedDays.length === 0) {
      return "";
    }

    let output = "";
    let currentRange: string[] = [];

    for (let i = 0; i < sortedDays.length; i++) {
      const currentDay = sortedDays[i]!;
      const nextDay = sortedDays[i + 1];

      currentRange.push(currentDay);

      if (
        !nextDay ||
        order.indexOf(nextDay) !== order.indexOf(currentDay) + 1
      ) {
        output +=
          currentRange.length > 1
            ? `${currentRange[0]} - ${currentRange[currentRange.length - 1]}, `
            : `${currentRange[0]}, `;
        currentRange = [];
      }
    }

    return output.slice(0, -2);
  }

  return (
    <>
      {/* ---------------------- BG LOGO -------------------------- */}
      <div className="bg-logo absolute left-0 -z-10 flex h-[95%] w-full items-center justify-center opacity-5">
        <Image
          src="/assets/images/logo-for-sidebar.svg"
          width={700}
          height={700}
          alt="bg-logo"
          className={`${props.altPrint ? "alt-print" : ""}`}
        />
      </div>

      {/* ---------------------- HEADING -------------------------- */}
      <div
        className={`flex justify-between gap-2 text-xs lg:text-base ${
          props.altPrint ? "pres-nav" : ""
        }`}
      >
        <div
          className={`flex max-h-28 max-w-[35%] items-center gap-2 lg:max-w-[49%] ${
            props.altPrint ? "alt-print" : ""
          }`}
        >
          <Image
            src={props.prescriptionHeaderInfo.orgLogo}
            width={500}
            height={500}
            alt="organization_logo"
            className="max-h-full max-w-min"
          />
          <div className="w-full lg:w-1/3">
            <h2 className="text-base font-semibold">
              {props.prescriptionHeaderInfo.orgName}
            </h2>
          </div>
        </div>

        <div
          className={`my-auto max-w-[50%] text-right ${
            props.altPrint ? "alt-print" : ""
          }`}
        >
          <h2 className="text-lg font-bold lg:text-xl">
            {props.prescriptionHeaderInfo.drId !== 26 ? "Dr." : ""}{" "}
            {props.prescriptionHeaderInfo.doctorName}
          </h2>
          <h2>{props.prescriptionHeaderInfo.qualificationsStr}</h2>
          <h2 className="font-semibold">
            {props.prescriptionHeaderInfo.specialtyStr}
          </h2>
          <h2 className="font-semibold">
            {props.prescriptionHeaderInfo.designation}
          </h2>
        </div>
      </div>

      <div
        className={`my-7 flex justify-between border-b border-[#0099FF] pb-2 text-xs lg:text-base ${
          props.altPrint ? "alt-patient-info" : ""
        }`}
      >
        <h2 className={`flex flex-col ${props.altPrint ? "alt-name" : ""}`}>
          <span
            className={`font-semibold text-[#0099FF] ${
              props.altPrint ? "alt-print" : ""
            }`}
          >
            Patient:{" "}
          </span>
          <span className={`${props.altPrint ? "alt-patient-name" : ""}`}>
            {props.prescriptionHeaderInfo.patientName}
          </span>
        </h2>

        <h2 className={`flex flex-col ${props.altPrint ? "alt-gender" : ""}`}>
          <span
            className={`font-semibold text-[#0099FF] ${
              props.altPrint ? "alt-print" : ""
            }`}
          >
            Gender:{" "}
          </span>
          <span>{props.prescriptionHeaderInfo.patientGender}</span>
        </h2>
        <h2 className={`flex flex-col ${props.altPrint ? "alt-age" : ""}`}>
          <span
            className={`font-semibold text-[#0099FF] ${
              props.altPrint ? "alt-print" : ""
            }`}
          >
            Age:{" "}
          </span>
          <span className={`${props.altPrint ? "alt-patient-age" : ""}`}>
            {props.prescriptionHeaderInfo.patientAge}
          </span>
        </h2>

        <h2 className={`flex flex-col ${props.altPrint ? "alt-date" : ""}`}>
          <span
            className={`font-semibold text-[#0099FF] ${
              props.altPrint ? "alt-print" : ""
            }`}
          >
            Date:{" "}
          </span>
          <span>{dayjs().format("DD MMM YYYY")}</span>
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2 lg:grid-cols-4">
        <div className="col-span-1 flex flex-col gap-5 text-xs lg:col-span-2 lg:text-base">
          <div>
            <h2
              className={`font-semibold text-[#0099FF] ${
                props.altPrint
                  ? "alt-pres-left-content alt-headline alt-complaints"
                  : ""
              }`}
            >
              Chief Complaints
            </h2>
            <h2>{props.data?.complaints}</h2>
          </div>

          <div>
            <h2
              className={`font-semibold text-[#0099FF] ${
                props.altPrint ? "alt-pres-left-content alt-headline" : ""
              }`}
            >
              On Examination / Findings
            </h2>
            <h2 className="hidden">{props.data?.findings}</h2>
            <h2 className="mt-1.5 font-semibold">
              {props.findingValues.findingsName}
            </h2>

            {
              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
              (props.data?.findings?.includes("Upper Right -") ||
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                props.data?.findings?.includes("Lower Right -") ||
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                props.data?.findings?.includes("Upper Left -") ||
                props.data?.findings?.includes("Lower Left -")) && (
                <div className="quadrant-div mt-2 grid w-11/12 grid-cols-2 lg:w-1/3">
                  <div className="border-b border-r border-black p-1.5 text-center text-xs lg:text-sm">
                    {props.findingValues.rightUpper
                      ?.map((numbering) => numbering.letter)
                      .join(",") ?? ""}
                  </div>
                  <div className="border-b border-l border-black p-1.5 text-center text-xs lg:text-sm">
                    {props.findingValues.leftUpper
                      ?.map((numbering) => numbering.letter)
                      .join(",") ?? ""}
                  </div>
                  <div className="border-r border-t border-black p-1.5 text-center text-xs lg:text-sm">
                    {props.findingValues.rightLower
                      ?.map((numbering) => numbering.letter)
                      .join(",") ?? ""}
                  </div>
                  <div className="border-l border-t border-black p-1.5 text-center text-xs lg:text-sm">
                    {props.findingValues.leftLower
                      ?.map((numbering) => numbering.letter)
                      .join(",") ?? ""}
                  </div>
                </div>
              )
            }
          </div>

          <div>
            <h2
              className={`font-semibold text-[#0099FF] ${
                props.altPrint ? "alt-pres-left-content alt-headline" : ""
              }`}
            >
              Investigation
            </h2>
            <h2>{props.data?.diagnosis}</h2>
          </div>
        </div>

        <div className="col-span-2">
          <h2
            className={`text-lg font-semibold italic text-[#0099FF] lg:text-xl ${
              props.altPrint ? "alt-headline" : ""
            }`}
          >
            RX :
          </h2>
          <div className="pl-4 lg:pl-6">
            <Table className="">
              <TableHeader>
                <TableRow className="border-none text-xs lg:text-base">
                  <TableHead className="pl-0 text-black">Name</TableHead>
                  <TableHead className="pl-0 text-black">Dosage</TableHead>
                  <TableHead className="pl-0 text-black">Days</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {props.data?.medicine?.map((med) => {
                  return (
                    <TableRow
                      key={med?.name}
                      className="border-none text-xs lg:text-base"
                    >
                      <TableCell className="pb-2.5 pl-0 pt-2.5">
                        {med?.name}
                      </TableCell>
                      <TableCell className="pb-2.5 pl-0 pt-2.5">
                        {med?.dosage}
                      </TableCell>
                      <TableCell className="pb-2.5 pl-0 pt-2.5">
                        {med?.remarks}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className={`${props.altPrint ? "alt-advice-flwup" : ""}`}>
        <div
          className={`mt-5 text-xs lg:text-base ${
            props.altPrint ? "alt-advice" : ""
          }`}
        >
          <h2
            className={`font-semibold text-[#0099FF] ${
              props.altPrint ? "alt-pres-left-content alt-headline" : ""
            }`}
          >
            Advice
          </h2>
          <h2>{props.data?.advice}</h2>
        </div>

        <div
          className={`mt-5 text-xs lg:text-base ${
            props.altPrint ? "alt-flwup" : ""
          }`}
        >
          <h2
            className={`font-semibold text-[#0099FF] ${
              props.altPrint ? "alt-pres-left-content alt-headline" : ""
            }`}
          >
            Next Follow-up
          </h2>
          <h2>
            {props.data?.followup
              ? dayjs(props.data?.followup).format("DD MMM YYYY")
              : "No follow-up needed"}
          </h2>
        </div>
      </div>

      <div
        className={`drSign flex w-full items-center justify-between pb-24 pt-3 ${
          props.altPrint ? "alt-print" : ""
        }`}
      >
        <div className={`h-[75px] w-[75px]`}>
          <Image
            src={props.prescriptionBottomPart.qrCode ?? ""}
            height={100}
            width={100}
            alt="Dr_QR"
          />
        </div>

        <div className="flex-col text-right">
          <h2 className="mb-1 mt-10 border-t border-[#0099FF] px-16 text-xs lg:text-base">
            Signature
          </h2>
          <h2 className="text-center text-xs italic lg:text-base">
            {props.prescriptionHeaderInfo.drId !== 26 ? "Dr." : ""}{" "}
            {props.prescriptionHeaderInfo.doctorName ?? "N/A"}
          </h2>
          <h2 className="text-center text-xs italic lg:text-sm">
            {dayjs().format("DD-MM-YYYY")}
          </h2>
        </div>
      </div>

      <div
        className={`pres-footer absolute bottom-0 left-0 right-0 bg-[#0099FF] px-4 py-3 text-[10px] font-bold leading-4 text-white ${
          props.altPrint ? "alt-print" : ""
        }`}
      >
        <h2 className="flex items-start">
          <span className="pr-2 pt-1">
            <LuAlarmClock className="text-white" />
          </span>
          <span>
            {formatDoctorAvailability(
              props.prescriptionBottomPart.availabilities,
            )}{" "}
            (
            {formatTime(
              DUMMY_DATE_PREFIX + props.prescriptionBottomPart.startHour,
              DUMMY_DATE_PREFIX + props.prescriptionBottomPart.endHour,
            )}
            )
          </span>
        </h2>
        <h2 className="flex items-start pt-1">
          <span className="pr-2 pt-1">
            <HiOutlineLocationMarker className="text-white" />
          </span>
          <span>{props.prescriptionBottomPart.location}</span>
        </h2>
      </div>
    </>
  );
};

export default PrintLayout;
