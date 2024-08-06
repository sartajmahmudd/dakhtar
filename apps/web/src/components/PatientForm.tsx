import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  AppointmentType,
  BANGLADESHI_PHONE_NUMBER_REGEX,
} from "@dakthar/shared";
import type { UserDetails } from "@dakthar/shared";

import { api } from "~/utils/api";
import { useUser } from "~/utils/auth";
import { useAppointmentStore } from "~/utils/store/appointment";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const Gender = z.enum(["MALE", "FEMALE", "OTHER"]);

const formSchema = z.object({
  name: z.string(),
  age: z.string().optional(),
  gender: Gender,
  phone: z
    .string()
    .refine((value) => BANGLADESHI_PHONE_NUMBER_REGEX.test(value), {
      message: "Invalid phone number",
    }),
  email: z
    .string()
    .refine((value) => {
      if (!value) return true;
      const parsedStatus = z.string().email().safeParse(value).success;
      return parsedStatus || "Invalid email address";
    })
    .optional(),
  termsAndConditions: z.boolean(),
});

interface Props {
  prev: () => void;
  next: () => void;
}

export const PatientForm = (props: Props) => {
  const { prev, next } = props;
  const [user] = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [serialNo, setSerialNo] = useState<null | number>(null);
  const { appointmentDetails, setUserDetails } = useAppointmentStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const appointment = api.appointment.createAppointment.useMutation();
  const dialogRef = useRef<HTMLButtonElement>(null);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const dateOfBirth = data.age
      ? dayjs().subtract(Number(data.age), "year").format()
      : null;

    const userDetails: UserDetails = {
      name: data.name,
      gender: data.gender,
      dateOfBirth,
      phone: data.phone,
      email: data?.email ?? null,
    };

    if (data.termsAndConditions) {
      setUserDetails(userDetails);
      const appointmentInput = { userDetails, appointmentDetails };
      setIsSubmitted(true);
      appointment.mutate(appointmentInput, {
        onSuccess: (resp) => {
          setSerialNo(resp.appointment.serialNo);
          dialogRef?.current?.click();
          setIsSubmitted(false);
        },
      });
    }
  };

  const isFormValid =
    form.watch("name") !== "" &&
    form.watch("gender") &&
    form.watch("phone") !== "" &&
    form.watch("phone") !== undefined &&
    form.watch("termsAndConditions");

  return (
    <div className="my-8 text-left">
      <h5 className="mb-1 text-lg font-semibold">Patient Information</h5>
      <p className="text-sm text-gray-400">
        Please fill up patient information to book the appointment
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-4 flex w-full flex-col space-y-4 rounded-md border border-gray-200 p-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mt-5 text-[14px] font-medium text-black">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    id="name"
                    placeholder="Enter Your Full Name"
                    {...field}
                    className="mt-2 w-full rounded-md bg-[#F7F7F7] p-[14px] text-[13px]"
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mt-5 text-[14px] font-medium text-black">
                  Age
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    id="dateOfBirth"
                    {...field}
                    min={1}
                    max={100}
                    placeholder="Enter Your Age"
                    className="mt-2 w-full rounded-md bg-[#F7F7F7] p-[14px] text-[13px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mt-5 text-[14px] font-medium text-black">
                  Gender
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  {...field}
                  required
                >
                  <FormControl className="p-[14px]">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mt-5 text-[14px] font-medium text-black">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    id="phone"
                    {...field}
                    placeholder="015XXXXXXXX"
                    className="mt-2 w-full rounded-md bg-[#F7F7F7] p-[14px] text-[13px]"
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mt-5 text-[14px] font-medium text-black">
                  Email Address
                  <span className="text-gray-400"> (Optional)</span>{" "}
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    id="email"
                    {...field}
                    placeholder="Email"
                    className="mt-2 w-full rounded-md bg-[#F7F7F7] p-[14px] text-[13px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="termsAndConditions"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    required
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="relative text-[14px] font-medium text-black">
                    I have read and understood the
                    <Link
                      href="/terms"
                      className="hover-none ml-1 border-none text-[#0099FF] "
                    >
                      Terms and Conditions
                    </Link>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-between">
            <Button
              type="button"
              className="rounded-[15px] border border-[#0099FF] bg-transparent px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#0099FF]"
              disabled={isSubmitted}
              onClick={prev}
            >
              Go Back
            </Button>

            <Button
              type="submit"
              className={`rounded-[15px] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF]                        
                    ${!isFormValid ? "bg-gray-500" : "bg-[#0099FF]"}    
                `}
              disabled={isSubmitted || !isFormValid}
              onClick={next}
            >
              {isSubmitted ? "Loading" : "Continue"}
            </Button>
          </div>
        </form>
      </Form>
      <Dialog>
        <DialogTrigger ref={dialogRef} />
        <DialogContent
          className="w-4/5"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <div className="flex justify-center">
            <Image
              className="h-[150px] w-[150px] object-cover"
              src="/assets/images/congrats-popup.svg"
              alt="congratulations"
              width={150}
              height={150}
            />
          </div>
          <h5 className="mb-1 mt-4 text-center font-semibold">
            Appointment Successfully Booked
          </h5>
          <div className="mx-2 flex flex-col justify-center text-center">
            <p className="py-2 text-sm text-[#41516E]">
              Serial No :{" "}
              <span className="text-[13px] font-semibold text-black">
                {serialNo ? serialNo : "N/A"}
              </span>
            </p>
            <p className="mt-2 text-sm text-[#41516E]">
              Appointment Date:{" "}
              <span className="text-[13px] font-semibold  text-black ">
                {dayjs(appointmentDetails?.date).format("Do MMM YYYY")}
              </span>
            </p>
            <p className="py-2 text-sm text-[#41516E]">
              Appointment Time :{" "}
              <span className="text-[13px] font-semibold text-black">
                {appointmentDetails.time}
              </span>
            </p>
            <p className="text-sm text-[#41516E] ">
              Chamber Location :{" "}
              <span className="inline-block text-[13px] font-semibold text-black">
                {appointmentDetails.type === AppointmentType.ONLINE
                  ? "Online"
                  : appointmentDetails.location}
              </span>
            </p>

            <p className="my-8 text-center text-sm text-[#41516E]">
              Please Keep A Screenshot for Future Reference
            </p>

            <Link
              className="mb-5 w-full rounded-lg bg-[#34A853] px-[18px] py-2.5 text-[14px] font-bold text-[#FFF]"
              href={!user ? "/login" : "/appointments"}
            >
              Done
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const PatientFormForAdmin = (props: Props) => {
  const { prev, next } = props;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      termsAndConditions: true,
    },
  });
  const [serialNo, setSerialNo] = useState<null | number>(null);
  const { appointmentDetails, setUserDetails } = useAppointmentStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const appointment = api.appointment.createAppointmentFromAdmin.useMutation();
  const dialogRef = useRef<HTMLButtonElement>(null);
  const appointmentId = appointment.data?.appointment?.id;

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const dateOfBirth = data.age
      ? dayjs().subtract(Number(data.age), "year").format()
      : null;

    const userDetails: UserDetails = {
      name: data.name,
      gender: data.gender,
      dateOfBirth,
      phone: data.phone,
      email: data?.email ?? null,
    };

    if (data) {
      setUserDetails(userDetails);
      const appointmentInput = { userDetails, appointmentDetails };
      setIsSubmitted(true);
      appointment.mutate(appointmentInput, {
        onSuccess: (resp) => {
          setSerialNo(resp.appointment.serialNo);
          dialogRef?.current?.click();
          setIsSubmitted(false);
        },
      });
    }
  };

  const isFormValid =
    form.watch("name") !== "" &&
    form.watch("gender") &&
    form.watch("phone") !== "" &&
    form.watch("phone") !== undefined &&
    form.watch("termsAndConditions");

  return (
    <div className="my-8 text-left">
      <h5 className="mb-1 text-lg font-semibold">Patient Information</h5>
      <p className="text-sm text-gray-400">
        Please fill up patient information to book the appointment
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-4 flex w-full flex-col space-y-4 rounded-md border border-gray-200 p-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mt-5 text-[14px] font-medium text-black">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    id="name"
                    placeholder="Enter Your Full Name"
                    {...field}
                    className="mt-2 w-full rounded-md bg-[#F7F7F7] p-[14px] text-[13px]"
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mt-5 text-[14px] font-medium text-black">
                  Age
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    id="dateOfBirth"
                    {...field}
                    min={1}
                    max={100}
                    placeholder="Enter Your Age"
                    className="mt-2 w-full rounded-md bg-[#F7F7F7] p-[14px] text-[13px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mt-5 text-[14px] font-medium text-black">
                  Gender
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  {...field}
                  required
                >
                  <FormControl className="p-[14px]">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mt-5 text-[14px] font-medium text-black">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    id="phone"
                    {...field}
                    placeholder="015XXXXXXXX"
                    className="mt-2 w-full rounded-md bg-[#F7F7F7] p-[14px] text-[13px]"
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mt-5 text-[14px] font-medium text-black">
                  Email Address
                  <span className="text-gray-400"> (Optional)</span>{" "}
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    id="email"
                    {...field}
                    placeholder="Email"
                    className="mt-2 w-full rounded-md bg-[#F7F7F7] p-[14px] text-[13px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="termsAndConditions"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    disabled
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="relative text-[14px] font-medium text-black">
                    I have read and understood the
                    <Link
                      href="/terms"
                      className="hover-none ml-1 border-none text-[#0099FF] "
                    >
                      Terms and Conditions
                    </Link>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-between">
            <Button
              type="button"
              className="rounded-[15px] border border-[#0099FF] bg-transparent px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#0099FF]"
              disabled={isSubmitted}
              onClick={prev}
            >
              Go Back
            </Button>

            <Button
              type="submit"
              className={`rounded-[15px] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF]                        
                    ${!isFormValid ? "bg-gray-500" : "bg-[#0099FF]"}    
                `}
              disabled={isSubmitted || !isFormValid}
              onClick={next}
            >
              {isSubmitted ? "Loading" : "Continue"}
            </Button>
          </div>
        </form>
      </Form>
      <Dialog>
        <DialogTrigger ref={dialogRef} />
        <DialogContent
          className="w-4/5"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <div className="flex justify-center">
            <Image
              className="h-[150px] w-[150px] object-cover"
              src="/assets/images/congrats-popup.svg"
              alt="congratulations"
              width={150}
              height={150}
            />
          </div>
          <h5 className="mb-1 mt-4 text-center font-semibold">
            Appointment Successfully Booked
          </h5>
          <div className="mx-2 flex flex-col justify-center text-center">
            <p className="py-2 text-sm text-[#41516E]">
              Serial No :{" "}
              <span className="text-[13px] font-semibold text-black">
                {serialNo ? serialNo : "N/A"}
              </span>
            </p>
            <p className="mt-2 text-sm text-[#41516E]">
              Appointment Date:{" "}
              <span className="text-[13px] font-semibold  text-black ">
                {dayjs(appointmentDetails?.date).format("Do MMM YYYY")}
              </span>
            </p>
            <p className="py-2 text-sm text-[#41516E]">
              Appointment Time :{" "}
              <span className="text-[13px] font-semibold text-black">
                {appointmentDetails.time}
              </span>
            </p>
            <p className="text-sm text-[#41516E] ">
              Chamber Location :{" "}
              <span className="inline-block text-[13px] font-semibold text-black">
                {appointmentDetails.type === AppointmentType.ONLINE
                  ? "Online"
                  : appointmentDetails.location}
              </span>
            </p>

            <p className="my-8 text-center text-sm text-[#41516E]">
              Please Keep A Screenshot for Future Reference
            </p>

            <div className="flex gap-3 mb-5">
              <Link
                className="w-full rounded-lg bg-[#0099FF] px-[18px] py-2.5 text-[14px] font-bold text-[#FFF]"
                href={`/admin/prescription/${appointmentId}`}
              >
                Rx
              </Link>
              <Link
                className="w-full rounded-lg bg-[#34A853] px-[18px] py-2.5 text-[14px] font-bold text-[#FFF]"
                href="/admin"
              >
                Done
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
