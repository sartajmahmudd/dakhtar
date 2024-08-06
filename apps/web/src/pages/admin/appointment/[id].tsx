import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { IoIosArrowBack } from "react-icons/io";
import { toast } from "sonner";

import type { RouterOutputs } from "@dakthar/api";
import {
  AppointmentType,
  // BANGLADESHI_PHONE_NUMBER_REGEX,
} from "@dakthar/shared";

import { Loader } from "~/components/loader/Loader";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Toaster } from "~/components/ui/sonner";
import { api } from "~/utils/api";
import type { Appointment } from "~/utils/store/admin";

type EdiAppointmentProps = NonNullable<
  RouterOutputs["appointment"]["getAppointmentById"]
> & {
  cb: () => void;
};

const EditAppointment = (props: EdiAppointmentProps) => {
  const mutation = api.appointment.updateAppointment.useMutation();

  const form = useForm<Appointment>({
    defaultValues: {
      type: props.type,
      status: props.status,
      purpose: props.purpose,
      serialNo: props.serialNo,
      fee: props.fee,
      date: dayjs(props.date).format("YYYY-MM-DD"),
      time: props.time,
      location: props.location ?? "",
    },
  });

  const onSubmit = (values: Appointment) => {
    const updatedAppointment = {
      id: props.id,
      type: values.type,
      status: values.status,
      purpose: values.purpose,
      serialNo: values.serialNo,
      fee: values.fee,
      date: dayjs(values.date).format(),
    };

    mutation.mutate(updatedAppointment, {
      onSettled: () => {
        void props.cb();
        toast.success("Appointment has been updated");
      },
    });
  };

  return (
    <div className="mx-[20px] mt-5 lg:mx-[90px] lg:mt-10">
      <Link
        href="/admin"
        className="flex w-fit items-center rounded-[15px] border border-[#0099FF] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#0099FF]"
      >
        <IoIosArrowBack className="-ml-1 mr-0.5 h-6 w-6 pt-0.5" />
        <span>Back to Appointments</span>
      </Link>

      <h2 className="my-6 text-[20px] font-semibold leading-[36px] tracking-[0.3px] lg:text-[30px]">
        Edit Appointment for ID: {props.id}
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="form-control grid grid-cols-1 lg:grid-cols-3 lg:gap-8"
        >
          <div className="col-span-1 mb-4 lg:border-r-2">
            <h3 className="mb-1.5 font-bold lg:mb-3">
              Doctor&apos;s Information
            </h3>
            <div className="mb-2 flex items-center justify-between text-[13px]">
              <h2>ID</h2>
              <span className="w-2/3">{props.doctor.id}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <h2>Name</h2>
              <span className="w-2/3">{props.doctor.user.name}</span>
            </div>

            <h1 className="mb-1.5 mt-4 font-bold lg:mb-3 lg:mt-8">
              Patient&apos;s Information
            </h1>
            <div className="mb-2 flex items-center justify-between text-[13px]">
              <h2>ID</h2>
              <span className="w-2/3">{props.patient.id}</span>
            </div>
            <div className="mb-2 flex items-center justify-between text-[13px]">
              <h2>Name</h2>
              <span className="w-2/3">{props.patient.user.name}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <h2>Phone No.</h2>
              <span className="w-2/3">{props.patient.user.phone}</span>
            </div>
          </div>

          <div className="col-span-2">
            <h3 className="mb-1.5 font-bold lg:mb-3">
              Appointment Information
            </h3>
            <div className="mb-1.5 flex flex-col lg:mb-4 lg:flex-row lg:gap-4">
              <div className="mb-1.5 lg:mb-0 lg:w-1/3">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium text-black">
                        Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        {...field}
                        required
                      >
                        <FormControl className="p-[14px]">
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value={AppointmentType.IN_PERSON}>
                              Chamber Appointment
                            </SelectItem>
                            <SelectItem disabled value={AppointmentType.ONLINE}>
                              Online Appointment
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex w-full gap-4 lg:w-2/3">
                <div className="w-1/2">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[14px] font-medium text-black">
                          Status
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          {...field}
                          required
                        >
                          <FormControl className="p-[14px]">
                            <SelectTrigger>
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="CONFIRMED">
                                Confirmed
                              </SelectItem>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="CANCELLED">
                                Cancelled
                              </SelectItem>
                              <SelectItem value="COMPLETED">
                                Completed
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="w-1/2">
                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[14px] font-medium text-black">
                          Purpose
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          {...field}
                          required
                        >
                          <FormControl className="p-[14px]">
                            <SelectTrigger>
                              <SelectValue placeholder="Select Purpose" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="CONSULTATION">
                                Consultation
                              </SelectItem>
                              <SelectItem value="FOLLOW_UP">
                                Follow Up
                              </SelectItem>
                              <SelectItem value="SHOW_REPORT">
                                Show Report
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="mb-1.5 flex gap-4 lg:mb-4">
              <div className="w-1/2 lg:w-1/3">
                <FormField
                  control={form.control}
                  name="serialNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium text-black">
                        Serial No.
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          min={0}
                          step={1}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            field.onChange(value);
                          }}
                          className="w-full rounded-md bg-[#F7F7F7] p-[14px] text-[13px]"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-1/2 lg:w-1/3">
                <FormField
                  control={form.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium text-black">
                        Fee
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          min={0}
                          step={1}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            field.onChange(value);
                          }}
                          className="w-full rounded-md bg-[#F7F7F7] p-[14px] text-[13px]"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="mb-1.5 flex gap-4 lg:mb-4">
              <div className="w-1/2 lg:w-1/3">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);
                          }}
                          className="w-full rounded-md border bg-[#F7F7F7] p-[14px] text-[13px] focus-visible:ring-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-1/2 lg:w-1/3">
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          className="w-full rounded-md border bg-[#F7F7F7] p-[15px] text-[13px]"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        className="w-full rounded-md border bg-[#F7F7F7] p-[15px] text-[13px]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="my-4 flex justify-end gap-4">
              <Button className="rounded-[15px] border bg-transparent px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-black shadow-sm">
                <Link href="/admin">Cancel</Link>
              </Button>
              <Button
                type="submit"
                className="rounded-[15px] bg-[#0099FF] px-[16px] py-[6px] text-[15px] font-bold leading-[30px]"
              >
                Update
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <Toaster duration={2500} richColors position="top-right" />
    </div>
  );
};

const Index: NextPage = () => {
  const router = useRouter();
  const id = Number(router.query.id);
  const utils = api.useContext();
  const appointmentDetails = api.appointment.getAppointmentById.useQuery(
    {
      id: id,
    },
    {
      enabled: !!id,
    },
  );

  const refresh = () => {
    void appointmentDetails.refetch();
    void utils.appointment.getAppointments.invalidate();
  };

  if (appointmentDetails.isLoading) {
    return <Loader />;
  }

  if (appointmentDetails.isError) {
    return <div>Error...</div>;
  }

  if (appointmentDetails.data === null) {
    return <div>No data</div>;
  }

  return (
    <>
      <Head>
        <title>Appointments - Dakthar.com</title>
        <meta name="appointments" content="dakthar.com" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <EditAppointment {...appointmentDetails.data} cb={refresh} />
    </>
  );
};

export default Index;
