import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { RouterOutputs } from "@dakthar/api";
import { BANGLADESHI_PHONE_NUMBER_REGEX, GenderOptions } from "@dakthar/shared";

import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/utils/api";

type CommonOnboardingRaw = RouterOutputs["user"]["getUser"];
type CommonOnboardingProps = Omit<CommonOnboardingRaw, "role">;

const currentDate = dayjs();
const updateUserSchema = z.object({
  name: z.string().min(1),
  dateOfBirth: z
    .string()
    .min(1)
    .refine(
      (val) => {
        const enteredDate = dayjs(val);
        return enteredDate.isValid() && enteredDate.isBefore(currentDate);
      },
      {
        message: "Invalid date or date is in the future",
      },
    ),
  role: z.enum(["PATIENT", "DOCTOR", "ADMIN"]),
  gender: z.nativeEnum(GenderOptions),
  email: z
    .string()
    .optional()
    // .nullable()
    .refine((val) => {
      if (!val) return true;
      return z.string().email().safeParse(val).success;
    }),
  phone: z
    .string()
    .refine((value) => BANGLADESHI_PHONE_NUMBER_REGEX.test(value), {
      message: "Invalid phone number",
    }),
});

const CommonOnboarding = (props: CommonOnboardingProps) => {
  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
  });

  const user = api.user.createUserFromAdmin.useMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLButtonElement>(null);

  const onSubmit = (data: z.infer<typeof updateUserSchema>) => {
    console.log(data);
    const userDetails = {
      name: data.name,
      gender: data.gender,
      dateOfBirth: dayjs(data.dateOfBirth).format(),
      email: data?.email ?? null,
      role: data.role,
      phone: data.phone,
    };

    if (data) {
      setIsSubmitting(true);
      user.mutate(userDetails, {
        onSuccess: (res) => {
          console.log(res.user);
          dialogRef?.current?.click();
          form.reset();
          setIsSubmitting(false);
        },
      });
    }
  };

  const isFormValid =
    form.watch("role") &&
    form.watch("name") !== "" &&
    form.watch("dateOfBirth") &&
    form.watch("phone");

  return (
    <div className="my-5 px-[20px] text-left lg:my-10 lg:px-[90px]">
      <h5 className="mb-1 text-[20px] font-semibold leading-[36px] tracking-[0.3px] lg:text-[30px]">
        User Information
      </h5>
      <p className="text-muted-foreground">
        Please Fill-up The Following Form to Complete Your Profile
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-4 flex w-full flex-col space-y-4 rounded-md border border-gray-200 p-4"
        >
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <div className="mb-1 flex items-center space-x-3">
                  <FormLabel>I am a</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-3"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="PATIENT" />
                        </FormControl>
                        <FormLabel className="cursor-pointer font-normal">
                          Patient
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="DOCTOR" />
                        </FormControl>
                        <FormLabel className="cursor-pointer font-normal">
                          Doctor
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ADMIN" />
                        </FormControl>
                        <FormLabel className="cursor-pointer font-normal">
                          Admin
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </div>
                <span className="text-xs text-red-500">
                  You cannot change this later
                </span>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="name">Full Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="name"
                    placeholder="Enter Your Full Name"
                    className="w-full rounded-md border bg-[#F7F7F7] p-[14px] text-[13px] focus-visible:ring-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="dateOfBirth">Date of Birth</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="date"
                    id="dateOfBirth"
                    defaultValue={
                      props.dateOfBirth
                        ? dayjs(props.dateOfBirth).format("YYYY-MM-DD")
                        : ""
                    }
                    className="w-full rounded-md border bg-[#F7F7F7] p-[14px] text-[13px] focus-visible:ring-0"
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
                <FormLabel>Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={props.gender}
                >
                  <FormControl>
                    <SelectTrigger className="w-full rounded-md border p-[14px] text-[13px] focus-visible:ring-0">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MALE">MALE</SelectItem>
                    <SelectItem value="FEMALE">FEMALE</SelectItem>
                    <SelectItem value="OTHER">OTHER</SelectItem>
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
                <FormLabel htmlFor="phone">Phone Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    id="phone"
                    placeholder="015XXXXXXXX"
                    defaultValue={props.phone ?? ""}
                    className="w-full rounded-md border bg-[#F7F7F7] p-[14px] text-[13px] focus-visible:ring-0"
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
                <FormLabel htmlFor="email">
                  Email{" "}
                  <span className="text-muted-foreground">(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    id="email"
                    placeholder="Email"
                    defaultValue={props.email ?? ""}
                    className="w-full rounded-md border bg-[#F7F7F7] p-[14px] text-[13px] focus-visible:ring-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className={`rounded-[15px] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF]                            
                            ${!isFormValid ? "bg-gray-400" : "bg-[#0099FF]"}
             `}
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? "Loading" : "Continue"}
          </Button>
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
          <h5 className="mt-5 text-center font-semibold">
            User Created Successfully for <br /> {form.watch("name")}
          </h5>

          <div className="mx-2 mt-4 flex flex-col justify-center text-center">
            {form.watch("role") === "PATIENT" && (
              <DialogTrigger asChild>
                <Button
                  className="mb-5 w-full rounded-lg bg-[#34A853] px-[18px] py-2.5 text-[14px] font-bold text-[#FFF]"
                  // onClick={() => setModal(false)}
                >
                  Done
                </Button>
              </DialogTrigger>
            )}
            {form.watch("role") === "DOCTOR" && (
              <Link
                className="mb-5 w-full rounded-lg bg-[#34A853] px-[18px] py-2.5 text-[14px] font-bold text-[#FFF]"
                href="/superAdmin/createUser/doctorOnboarding"
              >
                Next
              </Link>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default CommonOnboarding;
