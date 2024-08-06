import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { RiSearchLine } from "react-icons/ri";
import { VscSettings } from "react-icons/vsc";

import type { RouterOutputs } from "@dakthar/api";

import { Footer } from "~/components/footer/Footer";
import { Loader } from "~/components/loader/Loader";
import { Input } from "~/components/ui/input";
import { api } from "~/utils/api";

type DoctorCardProps =
  RouterOutputs["doctor"]["getDoctorListInfo"]["doctorListDetails"][number];

const DoctorCard = (props: DoctorCardProps) => {
  return (
    <Link href={`/doctor/${props.slug}`} className="hover:scale-105">
      <div className="flex h-[80px] flex-row items-center justify-start border-b-[1.5px] py-3 lg:h-[192px] lg:flex-col lg:justify-center lg:rounded-[8px] lg:border-none lg:py-5 lg:shadow-md">
        <Image
          width="500"
          height="500"
          className="mb-3 mr-[16px] h-[64px] w-[64px] rounded-full lg:mr-0"
          src={
            props.image ? props.image : "/assets/images/avatar-doctor-male.png"
          }
          alt="Doctor Image"
        />

        <div className="flex flex-col justify-center lg:items-center">
          <h5 className=" text-sm font-semibold"> {props.slug !== 'mustaq-ahammed-jibon' ? 'Dr.' : ''} {props.name}</h5>
          <h5 className="inline-flex text-xs font-medium text-[#0099FF] lg:items-center ">
            {props.speciality}
          </h5>
          <h5 className="mb-3 text-xs font-medium text-gray-400 ">
            {/* Doctor at {"N/A"} */}
          </h5>
        </div>
      </div>
    </Link>
  );
};

const Doctor = () => {
  const doctorListDetails = api.doctor.getDoctorListInfo.useQuery();

  if (doctorListDetails.isLoading) return <Loader />;
  if (doctorListDetails.error)
    return <div>{doctorListDetails.error.message}</div>;

  return (
    <>
      <Head>
        <title>Doctor List - Dakthar.com</title>
        <meta name="patient view" content="dakthar.com" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col">
        <section className="flex-grow px-[20px] lg:px-[90px]">
          <div className="mb-7 mt-5 flex flex-col lg:mt-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="order-2 mt-3 text-[20px] font-semibold leading-[36px] tracking-[0.3px] lg:order-1 lg:mt-0 lg:text-[30px]">
              Doctors List
            </div>

            <div className="order-1 flex w-full items-center justify-between rounded-[8px] border-0 bg-gray-100 px-5 py-1 text-sm leading-6 lg:order-2 lg:h-[42px] lg:w-1/4 lg:border-[1.5px] lg:bg-white">
              <div className="flex w-full items-center">
                <RiSearchLine className="h-5 w-5  fill-[#0099FF] lg:fill-[#84818A]" />
                <Input
                  type="text"
                  name="search"
                  id="search"
                  className="ml-1 w-full border-none bg-gray-100 outline-none lg:bg-white"
                  placeholder="Find Doctor"
                />
              </div>

              <div>
                <VscSettings className="ml-1.5 h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-[16px] lg:grid-cols-5 lg:gap-[27px]">
            {doctorListDetails.data.doctorListDetails.map((info, index) => (
              <DoctorCard
                key={index}
                {...info}
              // hospital="Apple Hospital"
              />
            ))}
          </div>
        </section>

        <div className="mx-[20px] mt-12 lg:mx-[90px]">
          <Footer />
        </div>
      </main>
    </>
  );
};

export default Doctor;
