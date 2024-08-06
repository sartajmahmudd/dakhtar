import Image from "next/image";
import Link from "next/link";

import { LiveAppointmentStatus } from "~/components/LiveAppointment";
import type { RouterOutputs } from "~/utils/api";
import { formatTime, toTitleCase } from "~/utils/helper";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type Props = NonNullable<RouterOutputs["doctor"]["getBySlug"]>;

const DUMMY_DATE_PREFIX = "1970-01-01T";

export const DoctorInfo = (props: Props) => {
  const { user, specialities, bio, slug, metadata } = props;

  const imageAlt = user.name ? `Dr. ${toTitleCase(user.name)}` : "doctor image";

  return (
    <div className="pb-8">
      <section className="flex items-center justify-center">
        <div className="h-24 w-24 overflow-hidden rounded-full">
          {user.image ? (
            <Image src={user.image} alt={imageAlt} height={100} width={100} />
          ) : (
            <Image
              src={`/assets/images/avatar-doctor-${user.gender.toLowerCase()}.png`}
              alt={imageAlt}
              height={100}
              width={100}
            />
          )}
        </div>

        <div className="ml-6 lg:ml-9">
          <h4 className="text-lg font-bold">
            {slug !== 'mustaq-ahammed-jibon' ? 'Dr.' : ''} {toTitleCase(`${user.name}`)}
          </h4>
          <p className="text-sm text-gray-400 ">
            {specialities[0]?.speciality.name ?? "N/A"}
          </p>
          <Link href={`/booking/${slug}`}>
            <Button className="mt-2 rounded-[15px] bg-[#0099FF] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF]">
              Book Now
            </Button>
          </Link>
        </div>
      </section>
      <section className="mt-8">
        <h5 className="mb-1 text-[20px] font-[500] lg:text-[30px]">
          About Doctor
        </h5>
        <p className="text-[16px] ">{bio}</p>
      </section>

      <section className="mt-8 ">
        <LiveAppointmentStatus doctorSlug={slug} />
      </section>

      <section className="mt-8">
        <h5 className="mb-1 text-[20px] font-[500] lg:text-[30px]">
          Working Time
        </h5>
        {/* <pre>{JSON.stringify(metadata, null, 2)}</pre> */}

        {metadata.map((item, index) => {
          return (
            <div key={index}>
              <p className="mb-1">{item.location}</p>

              <div key={index} className="w-3/4 overflow-x-auto lg:w-1/4">
                <Table className="leading-[2px]">
                  <TableHeader>
                    <TableRow className="border-none">
                      <TableHead className="pr-0 text-black">Day</TableHead>
                      <TableHead className="pl-0 text-black">
                        From - To
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {item.availabilities.map((item, index) => {
                      return (
                        <TableRow key={index} className="border-none">
                          <TableCell className="pr-0">
                            {item.dayOfWeek}{" "}
                          </TableCell>
                          <TableCell className="pl-0">
                            {formatTime(
                              DUMMY_DATE_PREFIX + item.startHour,
                              DUMMY_DATE_PREFIX + item.endHour,
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-8">
        <h5 className="mb-1 text-[20px] font-[500] lg:text-[30px]">Our Fees</h5>
        <p className="text-[16px] ">
          Consultation Fee{" "}
          {metadata[0]?.consultationFee
            ? `৳ ${metadata[0].consultationFee} (incl. VAT)`
            : "N/A"}
        </p>
        <p className="text-[16px] ">
          Follow-up Fee{" "}
          {metadata[0]?.followUpFee && metadata[0]?.followUpFeeValidity
            ? `৳ ${metadata[0].followUpFee} (incl. VAT) (Within ${metadata[0].followUpFeeValidity} days)`
            : "N/A"}
        </p>
      </section>
    </div>
  );
};
