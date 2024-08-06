import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { IoMailOutline } from "react-icons/io5";
import { z } from "zod";

import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";

interface SubscribeForm {
  email: string;
}

export const Footer = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SubscribeForm>();

  const isValid = watch("email") !== "";

  const handleSubscribe = (data: SubscribeForm) => {
    console.log(data);
    reset();
  };

  return (
    <footer className="mt-auto w-full">
      <div className="mb-2 flex items-start lg:justify-between">
        {/* LOGO */}
        <div className="hidden lg:flex">
          <Link href="/">
            <Image
              src="/assets/images/logo-for-sidebar.svg"
              alt="Dakther Logo"
              width={150}
              height={50}
            />
          </Link>
        </div>

        {/* FORM */}
        <div className="flex w-full flex-col lg:w-fit">
          <form
            onSubmit={handleSubmit(handleSubscribe)}
            className="items-center justify-between lg:flex lg:gap-[20px]"
          >
            <div className="flex items-center rounded-[30px] bg-gray-100 px-[20px] py-[12px]">
              <IoMailOutline className="mr-[20px]" />
              <Input
                type="email"
                id="email"
                className="w-full bg-transparent lg:w-fit"
                placeholder="Your Email"
                {...register("email", {
                  required: true,
                  validate: (value) => {
                    if (!value) return true;
                    const parsedStatus = z
                      .string()
                      .email()
                      .safeParse(value).success;
                    return parsedStatus || "Invalid email address";
                  },
                })}
              />
            </div>

            <div className="mt-[15px] w-full lg:mt-0">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="submit"
                    className="h-full w-full rounded-[30px] bg-[#0099FF] px-[20px] py-[10px] text-[16px] font-[500] leading-6 text-white disabled:bg-[#0099FF] disabled:opacity-100 lg:w-fit"
                    disabled={!isValid}
                  >
                    Subscribe
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-4/5">
                  <div className="mt-1 flex justify-center">
                    <Image
                      className="h-[150px] w-[150px] object-cover"
                      src="/assets/images/congrats-popup.svg"
                      alt="congratulations"
                      width={150}
                      height={150}
                    />
                  </div>

                  <h5 className="my-6 text-center font-semibold">
                    Thank you for subscribing!
                  </h5>

                  <div className="text-center">
                    <DialogTrigger>
                      <Button className="mb-2 rounded-lg bg-[#0099FF] px-[18px] py-2.5 text-[14px] font-bold text-[#FFF]">
                        Close
                      </Button>
                    </DialogTrigger>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </form>

          <div className="mx-auto text-center lg:text-start">
            {errors.email && (
              <span className="text-sm text-red-500">
                {errors.email.message}
              </span>
            )}
            <p className="mb-7 mt-3 text-[16px] font-[500]">
              Subscribe to get Dakthar.com Updates
            </p>
          </div>
        </div>
      </div>

      <hr></hr>

      <div className="mt-[20px] flex items-center justify-between font-[500] lg:w-1/4">
        <Link href="/terms">Terms & Conditions</Link>
        <Link href="/about">About Us</Link>
      </div>

      <p className="my-[20px] text-center font-[500]">
        Copyright © {new Date().getFullYear()}. Dakthar.com
      </p>

      {/* Modal */}
      {/* {isModalOpen && (
        

        <dialog className="fixed inset-0 flex h-full w-full items-center justify-center bg-[#00000070]">
          <div className="modal-box">
            <div className="mt-1 flex justify-center">
              <Image
                className="h-[150px] w-[150px] object-cover"
                src="/assets/images/congrats-popup.svg"
                alt="congratulations"
                width={150}
                height={150}
              />
            </div>

            <h5 className="my-6 text-center font-semibold">
              Thank you for subscribing!
            </h5>

            <div className="text-center">
              <button
                className="mb-2 rounded-lg bg-[#0099FF] px-[18px] py-2.5 text-[14px] font-bold text-[#FFF]"
                onClick={() => setModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )} */}
    </footer>
  );
};
