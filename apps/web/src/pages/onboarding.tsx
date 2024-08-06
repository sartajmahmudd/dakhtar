import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { Loader } from "~/components/loader/Loader";
import { CommonOnboarding } from "~/components/onboarding/CommonOnboarding";
import { DoctorOnboarding } from "~/components/onboarding/DoctorOnboarding";
import { api } from "~/utils/api";

const Onboarding = () => {
  const userInfo = api.user.getUser.useQuery();

  if (userInfo.isLoading) {
    return <Loader />;
  }

  if (userInfo.isError) {
    return <div>Error: {userInfo.error.message}</div>;
  }

  if (userInfo.data.onboarding === "COMPLETED") {
    return <OnboardingCompletionView />;
  }

  const roleBasedViews = {
    ANONYMOUS: <CommonOnboarding {...userInfo.data} />,
    PATIENT: <CommonOnboarding {...userInfo.data} />,
    DOCTOR: <DoctorOnboarding />,
    SUPER_ADMIN: <OnboardingCompletionView />,
    ADMIN: <div>Please Contact Support Team For Your Onboarding.</div>,
  };

  return (
    <>
      <Head>
        <title>Onboarding - Dakthar.com</title>
        <meta name="onboarding view" content="dakthar.com" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mx-[20px] mt-5 lg:mx-[90px] lg:mt-10">
        {roleBasedViews[userInfo.data.role]}
      </div>
    </>
  );
};

export default Onboarding;

const OnboardingCompletionView = () => {
  return (
    <>
      <Head>
        <title>Onboarding - Dakthar.com</title>
        <meta name="onboarding view" content="dakthar.com" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mx-[20px] mt-5 lg:mx-[90px] lg:mt-10">
        <div className="flex flex-col gap-8">
          <h2 className="font-semibold">Congratulations! You Are Onboarded.</h2>
          <div className="flex justify-center">
            <Image
              src="/assets/images/congrats-popup.svg"
              width={300}
              height={300}
              alt="congrats-popup"
            />
          </div>
          <div className="mx-auto">
            <Link
              href={`/doctor`}
              className="flex items-center gap-2 w-fit rounded-[15px] bg-[#0099FF] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF]">
              Get Appointment
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
