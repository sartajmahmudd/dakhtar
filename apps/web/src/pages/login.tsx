import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { IoIosArrowBack } from "react-icons/io";

import type { ConfirmationResult } from "@dakthar/firekit-client";
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "@dakthar/firekit-client";
import { BANGLADESHI_PHONE_NUMBER_REGEX } from "@dakthar/shared";

import { Loader } from "~/components/loader/Loader";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { login } from "~/utils/auth";

const formatPhoneNumber = (phoneNumber: string): string => {
  // * converts +8801712345678 or 01712-345678 -> +880 1712-345678 format
  const prefix = phoneNumber.startsWith("0") ? "+88" : "";
  const idealNumberFormat = prefix + phoneNumber.replace(/[^0-9]/g, "");
  const section1 = idealNumberFormat.slice(0, 4);
  const section2 = idealNumberFormat.slice(4, 7);
  const section3 = idealNumberFormat.slice(7);

  return `${section1} ${section2}-${section3}`;
};

function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [result, setResult] = useState<ConfirmationResult | null>(null);
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [error, setError] = useState("");
  const verifier = useRef<RecaptchaVerifier | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [activeOTPIndex, setActiveOTPIndex] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, [result, activeOTPIndex]);

  useEffect(() => {
    if (verifier.current) return;

    verifier.current = new RecaptchaVerifier(auth(), "recaptcha-container", {
      size: "invisible",
    });
  }, []);

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    e.preventDefault();
    try {
      if (!verifier?.current) {
        throw new Error("RecaptchaVerifier is not initialized");
      }

      const isValidNo = BANGLADESHI_PHONE_NUMBER_REGEX.test(phoneNumber);
      if (!isValidNo) {
        throw new Error(
          "Phone number must start with +88 and consist of 11 digits (excluding +88), without any gaps",
        );
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth(),
        formatPhoneNumber(phoneNumber),
        verifier.current,
      );
      setResult(confirmationResult);
      setIsSubmitting(false);
      setOtp(new Array(6).fill(""));
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);

      if (error instanceof Error && error?.message) {
        // Handle Firebase specific error with code -39
        if (error.message.includes("auth/error-code:-39")) {
          setError("Something went wrong. Please try again later.");
        } else {
          setError(error.message);
        }
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  const handleVerification = async (e: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6 || result === null) return;

    try {
      const userCredential = await result.confirm(otpString);
      const user = userCredential.user;
      await login(user);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      if (error instanceof Error && error?.message) {
        setError(
          "Please ensure the correct OTP with a stable internet connection",
        );
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  const handleOtpInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const newValue = e.target.value;
    const newOtp = [...otp];

    if (/^\d$/.test(newValue) && index >= 0 && index < otp.length) {
      newOtp[index] = newValue;
      setOtp(newOtp);

      // Automatically move to the next input field
      setActiveOTPIndex(index + 1);
    }
  };

  const handleBackspace = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      const newOtp = [...otp];

      // Clear the current input field
      newOtp[index] = "";

      // If the current input field is empty, also clear the previous input field
      if (index > 0 && newOtp[index - 1] === "") {
        newOtp[index - 1] = "";
      }

      setOtp(newOtp);

      // Automatically move to the previous input field
      setActiveOTPIndex(index - 1);
    }
  };

  const clearOTPField = () => {
    setOtp(new Array(6).fill(""));
    setActiveOTPIndex(0);
  };

  return (
    <>
      <Head>
        <title>Login - Dakthar.com</title>
        <meta name="login | Dakthar" content="dakthar.com login page" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="login-div flex">
          <div className="hidden h-full bg-[#0099FF] bg-opacity-20 lg:flex lg:w-2/5">
            <Image
              src="/assets/images/login-welcome.png"
              width={300}
              height={300}
              alt="welcome"
              className="mx-auto my-auto h-2/3"
            />
          </div>
          <div className="my-auto w-full lg:w-2/3">
            <Image
              src="/assets/images/login-bg.png"
              width={330}
              height={300}
              alt="welcome"
              className="absolute left-0 top-32 lg:hidden"
            />
            {!result ? (
              <div className="mx-auto flex w-96 flex-col p-8">
                <h1 className="mb-4 text-[20px] font-[700] leading-[36px] tracking-[0.3px] text-[#070C18] lg:text-[30px]">
                  Welcome to Dakthar.com
                </h1>
                <p className="mb-8 text-[16px] leading-[26px] tracking-[1%] text-[#727A83]">
                  Hello There, Insert Your Phone Number to Get Started!
                </p>

                <form onSubmit={handleSignIn}>
                  <div className="mb-4">
                    <Label
                      htmlFor="phoneNumber"
                      className="block text-[16px] font-[500]"
                    >
                      Phone Number
                    </Label>

                    <Input
                      ref={inputRef}
                      type="tel"
                      id="phoneNumber"
                      defaultValue="+88"
                      required
                      onChange={(e) => {
                        setError("");
                        setPhoneNumber(e.target.value.slice(3));
                      }}
                      className="my-3 w-full rounded-[12px] bg-[#F7F7F7] px-5 py-4 text-[#727A83] focus:border focus:border-[#0099FF] focus:outline-none"
                      onFocus={() => {
                        // Move the cursor to the end of the input on focus
                        if (inputRef.current) {
                          inputRef.current.selectionStart =
                            inputRef.current.selectionEnd =
                              inputRef.current.value.length;
                        }
                      }}
                      disabled={isSubmitting}
                    />
                  </div>
                  {error && (
                    <p className="mb-4 text-sm text-red-500">{error}</p>
                  )}
                  <Button
                    type="submit"
                    id="sign-in-button"
                    disabled={isSubmitting}
                    className="w-full rounded-[15px] bg-[#0099FF] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF] focus:outline-none"
                  >
                    Login
                  </Button>

                  {isSubmitting && (
                    <div className="absolute left-0 top-20 w-full">
                      <Loader />
                    </div>
                  )}
                </form>
              </div>
            ) : (
              <form
                onSubmit={handleVerification}
                className="mx-auto flex w-96 flex-col p-8"
              >
                <IoIosArrowBack
                  width="20"
                  height="20"
                  className="z-10 mb-8 h-6 w-6 cursor-pointer"
                  onClick={() => {
                    setResult(null);
                    setPhoneNumber("");
                    setIsSubmitting(false); // to prevent the login btn from submitting while going back
                  }}
                />

                <div className="my-4">
                  <Label
                    htmlFor="otp"
                    className="mb-4 block text-[20px] font-[700] leading-[36px] lg:text-[30px]"
                  >
                    OTP Verification
                  </Label>

                  <p className="mb-6 text-[16px] leading-[21px] text-[#80807F]">
                    Enter The Verification Code We Just Sent to Your Number +88{" "}
                    {phoneNumber.substring(0, phoneNumber.length - 9)}*******
                    {phoneNumber.slice(-2)}.
                  </p>

                  <div className="flex space-x-2 lg:mb-2">
                    {otp.map((digit, index) => (
                      <Input
                        ref={index === activeOTPIndex ? inputRef : null}
                        key={index}
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        disabled={isSubmitting}
                        onChange={(e) => handleOtpInputChange(e, index)}
                        onKeyDown={(e) => handleBackspace(e, index)}
                        className={`h-[50px] w-[46px] rounded-lg border-[2px] bg-[#D9D9D933] text-center text-[20px] shadow-sm ${
                          digit && "border-[#0099FF]"
                        } focus:border-[#0099FF] focus:outline-none focus:ring-[#0099FF]`}
                      />
                    ))}
                  </div>

                  <div className="mt-2.5 text-end lg:hidden">
                    <Button
                      type="button"
                      onClick={clearOTPField}
                      className="h-0 bg-transparent p-0 text-black"
                      disabled={isSubmitting}
                    >
                      Clear OTP
                    </Button>
                  </div>

                  {/* <p className="text-center mt6 text-[14px] leading-[21px] text-[#80807F]">
                Didn&#39;t receive code? <span className="font-semibold text-[#0099FF]">Resend</span>
              </p> */}
                </div>

                {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
                <Button
                  type="submit"
                  disabled={otp.some((digit) => digit === "")}
                  className={`${
                    otp.some((digit) => digit === "")
                      ? "bg-[#80807F59] text-[#80807F]"
                      : "bg-[#0099FF] text-white"
                  } w-full rounded-[15px] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] focus:outline-none`}
                >
                  Verify
                </Button>

                {isSubmitting && (
                  <div className="absolute left-0 top-20 z-20 w-full">
                    <Loader />
                  </div>
                )}
              </form>
            )}
            <div id="recaptcha-container" />
          </div>
        </div>
      </main>
    </>
  );
}

export default Login;
