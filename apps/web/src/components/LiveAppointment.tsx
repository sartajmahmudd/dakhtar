import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { BiReset } from "react-icons/bi";
import { BsFillCircleFill } from "react-icons/bs";
import { TiMinus, TiPlus } from "react-icons/ti";

import { api } from "~/utils/api";
import { useLiveAppointment } from "~/utils/hooks";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

interface Props {
  doctorSlug: string;
}

export function LiveAppointmentStatus(props: Props) {
  const { data } = useLiveAppointment(props.doctorSlug);
  const lastDateTimeObj = data?.timestamp
    ? dayjs(data.timestamp.toDate())
    : dayjs();
  const lastDateTime = lastDateTimeObj.format("DD MMM YYYY, h:mm A");
  return (
    <div>
      <h2 className="mb-1 text-[20px] font-[500] lg:text-[30px]">
        Live Appointment Update
      </h2>

      <h2 className="mb-1 flex text-[16px] font-[400]">
        Ongoing Serial &nbsp; <strong> {data?.position ?? 0}</strong>
        {data?.live ? (
          <sup className="flex items-center gap-1">
            <BsFillCircleFill className=" w-[4px] text-[#FF0000]" />
            <span>(live now)</span>
          </sup>
        ) : (
          <sup className="flex items-center gap-1">
            <BsFillCircleFill className="-mt-0.5 ml-0.5 w-[4px] text-black " />
            <span>(offline)</span>
          </sup>
        )}
      </h2>

      <p className="text-[16px] font-[400px]">Last updated: {lastDateTime}</p>
    </div>
  );
}

export function UpdateLiveAppointmentStatus(props: Props) {
  const { data } = useLiveAppointment(
    props.doctorSlug,
  );

  const [isHeartbeat, setIsHeartbeat] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [playAudio, setPlayAudio] = useState(false);
  const audioRef = useRef(new Audio("/assets/soft_bell.mp3"));

  const increment = api.appointment.incrementSerialNo.useMutation();
  const decrement = api.appointment.decrementSerialNo.useMutation();
  const reset = api.appointment.resetSerialNo.useMutation();

  useEffect(() => {
    console.log("this is being consoled by the live appointment");

    setShowAnimation(true);
    setIsHeartbeat(true);

    if (playAudio) {
      const playAudioFunction = async () => {
        try {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
          setPlayAudio(true);
        } catch (error) {
          console.error("Error playing audio:", error);
        }
      };
      void playAudioFunction();
    }
    // setPlayAudio(false);
  }, [data?.position, playAudio]);

  useEffect(() => {
    const heartbeatTimeout = setTimeout(() => {
      setIsHeartbeat(false);
    }, 700);

    const animationTimeout = setTimeout(() => {
      setShowAnimation(false);
    }, 2000);

    return () => {
      clearTimeout(heartbeatTimeout);
      clearTimeout(animationTimeout);
    };
  }, [isHeartbeat]);

  return (
    <div className="mx-auto my-9 flex flex-col items-center justify-center lg:my-0 lg:min-h-screen">
      <div
        className={`h-72 w-72 overflow-hidden rounded-full bg-gradient-to-br from-[#0099FF] to-white
        ${isHeartbeat ? "heartbeat" : ""}
      `}
      ></div>
      <div className="-mt-64 flex h-56 w-56 flex-col items-center justify-center overflow-hidden rounded-full border-2 bg-white font-semibold shadow-lg">
        <h2 className="text-center">Ongoing Serial Number</h2>

        <span className="flex flex-col items-center">
          <h2
            className={`mb-3 text-6xl text-[#35AEFF] ${showAnimation ? "fade-out" : "fade-in"
              }`}
          >
            {data?.position ?? 0}
          </h2>
          {data?.live ? (
            <sup className="flex items-center gap-1 text-[15px]">
              <BsFillCircleFill className="w-[4px] text-[#FF0000]" />
              <span>(Live Now)</span>
            </sup>
          ) : (
            <sup className="flex items-center gap-1">
              <BsFillCircleFill className="-mt-0.5 ml-0.5 w-[4px] text-black " />
              <span>(Offline)</span>
            </sup>
          )}
        </span>
      </div>

      <div className="-mt-[28px] h-[75px] w-[75px] overflow-hidden rounded-full">
        <Image
          src="/assets/images/avatar-patient-other.png"
          width={100}
          height={100}
          alt="patient"
        />
      </div>

      <div className="mt-7 flex gap-7 lg:mt-8">
        <Label
          htmlFor="previous"
          className="flex cursor-pointer flex-col items-center gap-1 text-[15px] font-semibold"
        >
          <Button
            id="previous"
            className="h-fit rounded-[15px] bg-[#0099FF] p-5 text-[16px] font-bold text-white shadow-xl"
            onClick={() => {
              decrement.mutate({
                currentSerial: data?.position,
                slug: props.doctorSlug,
              });
              setPlayAudio(true);
            }}
          >
            <TiMinus className="text-xl lg:text-2xl" />
          </Button>
          Previous
        </Label>

        <Label
          htmlFor="reset"
          className="flex cursor-pointer flex-col items-center gap-1 text-[15px] font-semibold"
        >
          <Button
            id="reset"
            type="submit"
            className="h-fit rounded-[15px] bg-[#0099FF] p-5 text-[16px] font-bold text-white shadow-xl"
            onClick={() => {
              reset.mutate({
                slug: props.doctorSlug,
              });
              setPlayAudio(true);
            }}
          >
            <BiReset className="text-xl lg:text-2xl" />
          </Button>
          Reset
        </Label>

        <Label
          htmlFor="next"
          className="flex cursor-pointer flex-col items-center gap-1 text-[15px] font-semibold"
        >
          <Button
            id="next"
            className="h-fit rounded-[15px] bg-[#0099FF] p-5 text-[16px] font-bold text-white shadow-xl"
            onClick={() => {
              increment.mutate({
                slug: props.doctorSlug,
              });
              setPlayAudio(true);
            }}
          >
            <TiPlus className="text-xl lg:text-2xl" />
          </Button>
          Next
        </Label>
      </div>
    </div>
  );
}
