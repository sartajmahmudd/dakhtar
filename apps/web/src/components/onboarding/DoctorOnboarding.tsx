import { useState } from "react";
import { useForm } from "react-hook-form";
import type { RouterOutputs } from "@dakthar/api";
import type { DayOfWeek } from "@dakthar/db";
import { Steps, useSteps } from "~/components/Steps";
import { api } from "~/utils/api";
import { Loader } from "../loader/Loader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";

type Specialty = RouterOutputs["doctor"]["getSpecialities"][number];
interface PersonalInfo {
  bio: string;
  specialities: Specialty;
  primarySpeciality: Specialty;
}

const DoctorOnboardingStep1 = () => {
  const { next } = useSteps();
  const specialties = api.doctor.getSpecialities.useQuery();
  const form = useForm<PersonalInfo>();
  const [bio, setBio] = useState("");
  const [selectedItems, setSelectedItems] = useState<Specialty[]>([]);
  const [primarySpeciality, setPrimarySpeciality] = useState<number | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleItemClick = (item: Specialty) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(
        selectedItems.filter((selected) => selected.id !== item.id),
      );
    } else {
      setSelectedItems([...selectedItems, item]);
    }
    setPrimarySpeciality(null); // * reset primary specialty
  };

  const disabled =
    !bio ||
    selectedItems.length === 0 ||
    (selectedItems.length > 1 && !primarySpeciality);

  const info = api.doctor.updateBioAndSpecialities.useMutation();

  const handlePersonalInfo = () => {
    setIsSubmitting(true);

    const data = {
      bio,
      primarySpeciality,
      specialities: selectedItems.map((item) => item.id),
    };

    info.mutate(data, {
      onSuccess: (resp) => {
        if (resp.success) {
          void next();
        }
      },
    });
  };

  if (isSubmitting) {
    return <Loader />;
  }

  return (
    <Form {...form}>
      <form
        className="form-control mb-5 lg:mb-[80px]"
        onSubmit={form.handleSubmit(handlePersonalInfo)}
      >
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="mb-5">
              <FormLabel htmlFor="bio" className="text-base">
                Write Something About Yourself
                <p className="text-muted-foreground mb-3 text-sm">
                  This Will Be Displayed in Your Profile
                </p>
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  id="bio"
                  placeholder="I am a cardiologist with 5 years of experience....."
                  className="border focus-visible:ring-0"
                  onChange={(e) => setBio(e.target.value.trim())}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialities"
          render={() => (
            <FormItem className="mb-5">
              <div className="mb-3">
                <FormLabel className="text-base">Specialization</FormLabel>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {specialties?.data?.map((specialty) => (
                  <FormField
                    key={specialty.id}
                    control={form.control}
                    name="specialities"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={specialty.id}
                          className="flex flex-row items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              {...field}
                              value={specialty.name}
                              onCheckedChange={() => handleItemClick(specialty)}
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer text-sm font-normal">
                            {specialty.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </FormItem>
          )}
        />

        {selectedItems.length > 1 ? (
          <FormField
            control={form.control}
            name="primarySpeciality"
            render={({ field }) => (
              <FormItem className="mb-5">
                <FormLabel className="mb-3 text-base">
                  Select Your Primary Specialty
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    className="grid grid-cols-2 gap-3 lg:grid-cols-3"
                  >
                    {selectedItems.map((specialty) => (
                      <FormItem
                        key={specialty.id}
                        className="flex items-center space-x-3 space-y-0"
                        onChange={() => setPrimarySpeciality(specialty.id)}
                      >
                        <FormControl>
                          <RadioGroupItem
                            {...field}
                            value={specialty.name}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer font-normal">
                          {specialty.name}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        ) : null}

        <Button
          type="submit"
          className={`w-full rounded-[15px] px-4 py-2 text-[15px] font-bold leading-[30px] text-white
                      ${disabled ? "bg-muted-foreground" : "bg-[#0099FF]"}
                    `}
          disabled={disabled}
          onClick={next}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};

const daysOfWeek = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

const formSchema = z.object({
  location: z.string().refine((value) => value.trim() !== "", {
    message: "Location is required",
  }),
  days: z
    .array(z.enum(daysOfWeek))
    .refine((value) => Object.keys(value).length > 0, {
      message: "Please select at least one day",
    }),
  startTime: z.string().refine((value) => value !== "", {
    message: "Please add Start Time",
  }),
  endTime: z.string().refine((value) => value !== "", {
    message: "Please add End Time",
  }),
  consultationFee: z.number().refine((value) => value !== undefined, {
    message: "Consultation fee is required",
  }),
});

const DoctorOnboardingStep2 = () => {
  const utils = api.useContext();
  const info = api.doctor.updateMetadata.useMutation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const days = data.days.map((day) => day.slice(0, 3)) as DayOfWeek[];
    info.mutate(
      {
        ...data,
        days,
      },
      {
        onSuccess: (resp) => {
          if (resp.success) {
            void utils.user.getUser.refetch();
          }
        },
      },
    );
  };

  if (isSubmitting) {
    return <Loader />;
  }

  return (
    <Form {...form}>
      <form
        className="form-control mb-5 lg:mb-[80px]"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem className="mb-5">
              <FormLabel htmlFor="location" className="text-base">
                Add Your Chamber Location
                <p className="text-muted-foreground mb-3 text-sm">
                  You can add multiple locations later
                </p>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="location"
                  placeholder="4/A, Road 4, Dhanmondi, Dhaka..."
                  className="w-full rounded-md border bg-[#F7F7F7] p-[14px] text-[13px] focus-visible:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="days"
          render={() => (
            <FormItem className="mb-5">
              <div className="mb-3">
                <FormLabel className="text-base">
                  Select Days of The Week You Are Available
                </FormLabel>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {daysOfWeek.map((day) => (
                  <FormField
                    key={day}
                    control={form.control}
                    name="days"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={day}
                          className="flex flex-row items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              {...field}
                              value={day}
                              checked={field.value?.includes(day)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                const updatedValues = checked
                                  ? [...currentValues, day]
                                  : currentValues.filter(
                                    (value) => value !== day,
                                  );

                                field.onChange(updatedValues);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer text-sm font-normal">
                            {day}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mb-5">
          <h2 className="mb-2 text-base font-[500]">
            Select Your Available Time
          </h2>
          <div className="flex w-full gap-3 lg:w-2/3">
            <div className="w-1/2 lg:w-1/3">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel htmlFor="startTime" className="text-base">
                      Start Time{" "}
                      <span className="text-muted-foreground text-sm">
                        hh:mm AM/PM
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="startTime"
                        type="time"
                        className="w-full rounded-md border bg-[#F7F7F7] p-[14px] text-[13px] focus-visible:ring-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex w-1/2 flex-col gap-1 lg:w-1/3">
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel htmlFor="endTime" className="text-base">
                      End Time{" "}
                      <span className="text-muted-foreground text-sm">
                        hh:mm AM/PM
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="endTime"
                        type="time"
                        className="w-full rounded-md border bg-[#F7F7F7] p-[14px] text-[13px] focus-visible:ring-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="consultationFee"
          render={({ field }) => (
            <FormItem className="mb-5">
              <div className="flex items-center gap-2">
                <FormLabel htmlFor="consultationFee" className="text-base">
                  Consultation Fee
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="consultationFee"
                    type="number"
                    placeholder="500"
                    className="w-1/2 rounded-md border bg-[#F7F7F7] p-[14px] text-[13px] focus-visible:ring-0 lg:w-1/5"
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      field.onChange(value);
                    }}
                    value={field.value}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className={`w-full rounded-[15px] px-4 py-2 text-[15px] font-bold leading-[30px] text-white
                        ${!formSchema ? "bg-gray-400" : "bg-[#0099FF]"}
                    `}
          disabled={!formSchema}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};

export const DoctorOnboarding = () => {
  const steps = [
    { title: "Professional Information", component: <DoctorOnboardingStep1 /> },
    { title: "Consultation Details", component: <DoctorOnboardingStep2 /> },
  ];
  return <Steps steps={steps} />;
};
