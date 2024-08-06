import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { RouterOutputs } from "@dakthar/api";
import { GenderOptions } from "@dakthar/shared";

import { api } from "~/utils/api";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type CommonOnboardingRaw = RouterOutputs["user"]["getUser"];
type CommonOnboardingProps = Omit<CommonOnboardingRaw, "role">;

const currentDate = dayjs();
const onboardUserSchema = z.object({
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
  role: z.enum(["PATIENT", "DOCTOR"]),
  gender: z.nativeEnum(GenderOptions),
  email: z
    .string()
    .optional()
    // .nullable()
    .refine((val) => {
      if (!val) return true;
      return z.string().email().safeParse(val).success;
    }),
  termsAndConditions: z.boolean(),
});

export const CommonOnboarding = (props: CommonOnboardingProps) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof onboardUserSchema>>({
    resolver: zodResolver(onboardUserSchema),
    defaultValues: {
      name: props.name ?? '',
      dateOfBirth: dayjs(props.dateOfBirth).format("YYYY-MM-DD") ?? undefined,
      gender: props.gender ?? '',
      email: props.email ?? ''
    }
  });

  const user = api.user.updateUser.useMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = (data: z.infer<typeof onboardUserSchema>) => {
    const userDetails = {
      name: data.name,
      gender: data.gender,
      dateOfBirth: dayjs(data.dateOfBirth).format(),
      email: data?.email ?? null,
      role: data.role,
    };

    if (data.termsAndConditions) {
      setIsSubmitting(true);
      user.mutate(userDetails, {
        onSuccess: () => {
          router.reload();
          // setIsSubmitting(false);
        },
      });
    }
  };

  const isFormValid =
    form.watch("role") &&
    form.watch("name") !== "" &&
    form.watch("gender") &&
    form.watch("termsAndConditions") &&
    form.watch("dateOfBirth");

  return (
    <div className="my-5 text-left lg:my-10">
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
                  defaultValue={props.gender ?? ''}
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

          <Label htmlFor="phone">Phone Number</Label>
          <Input
            type="tel"
            id="phone"
            placeholder="015XXXXXXXX"
            defaultValue={props.phone ?? ""}
            className="w-full rounded-md border bg-[#F7F7F7] p-[14px] text-[13px] focus-visible:ring-0"
            disabled
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
                    className="w-full rounded-md border bg-[#F7F7F7] p-[14px] text-[13px] focus-visible:ring-0"
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

          <Button
            type="submit"
            className={`rounded-[15px] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF]                            
                            ${!isFormValid ? "bg-gray-400" : "bg-[#0099FF]"}
             `}
          // disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? "Loading" : "Continue"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
