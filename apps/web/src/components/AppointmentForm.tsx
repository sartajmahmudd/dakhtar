import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { format, isBefore, isToday, startOfDay } from "date-fns";
import dayjs from "dayjs";
import type { ClassNames } from "react-day-picker";
import { z } from "zod";
import type { DayOfWeek } from "@dakthar/db";
import { AppointmentType } from "@dakthar/shared";
import { api } from "~/utils/api";
import { formatTime } from "~/utils/helper";
import { useAppointmentStore } from "~/utils/store/appointment";
import { Loader } from "./loader/Loader";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface TimeSlot {
  id: number;
  dayOfWeek: DayOfWeek;
  startHour: string;
  endHour: string;
}

interface AppointmentDetails {
  date: string;
  time: string;
  location: string;
  type: (typeof AppointmentType)[keyof typeof AppointmentType];
}

// CONSTANTS
const DUMMY_DATE_PREFIX = "1970-01-01T";
const DATE_LOWER_LIMIT = dayjs().format("YYYY-MM-DD").toString();
const DATE_UPPER_LIMIT = dayjs().add(1, "year").format("YYYY-MM-DD").toString();
const DEFAULT_CONSULTATION_FEE = 1000;

const schema = z.object({
  eventDate: z
    .string({ description: "Date" })
    .refine(
      (dateString) =>
        dayjs(dateString).diff(DATE_LOWER_LIMIT, "day", true) >= 0,
      {
        message: `Date cannot be less than ${dayjs(DATE_LOWER_LIMIT).format(
          "DD MMMM YYYY",
        )}`,
      },
    )
    .refine(
      (dateString) =>
        dayjs(dateString).diff(DATE_UPPER_LIMIT, "year", true) <= 0,
      {
        message: `Date cannot be more than ${dayjs(DATE_UPPER_LIMIT).format(
          "DD MMMM YYYY",
        )}`,
      },
    ),
});

export const AppointmentForm = (props: { next: () => void }) => {
  const { next } = props;
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [dateError, setDateError] = useState("");
  const { appointmentDetails, setAppointmentDetails } = useAppointmentStore();
  const router = useRouter();
  const slug = router.query?.slug as string;
  const availability = api.doctor.getAvailableSlots.useQuery(
    { slug },
    { enabled: !!slug },
  );

  useEffect(() => {
    const defaultSelectedDate = !availableDays?.includes(
      new Date()?.toLocaleString("en-us", { weekday: 'short' }).toLowerCase())
      ? nextAvailableDate ?? new Date()
      : new Date();

    setSelectedDate(defaultSelectedDate);
    setAppointmentDetails({ time: "", date: format(defaultSelectedDate, "yyyy-MM-dd'T'HH:mm:ssXXX") });

    if (availability?.data && availability.data.length >= 1) {
      setSelectedTime(null);
      setAppointmentDetails({
        location: availability?.data[0]?.location,
      });
    }
  }, [availability.data]);

  const disabledContinueButton =
    appointmentDetails.time === "" ||
    (appointmentDetails.type === AppointmentType.IN_PERSON &&
      appointmentDetails.location === "default-selected-location");

  const currentLocationFee = availability.data?.filter(
    (item) => item.location === appointmentDetails.location,
  )?.[0]?.consultationFee;

  const fee = currentLocationFee ?? DEFAULT_CONSULTATION_FEE;

  // * Filter slots by location
  let specificSlots = null;
  let allSlots = null;

  const selectedDayOfWeek = selectedDate
    ?.toLocaleDateString(undefined, { weekday: "short" })
    .toLowerCase();
  if (availability.data) {
    const filteredSlotsByLocation = availability.data
      .filter((item) => item.location === appointmentDetails.location)?.[0]
      ?.availabilities?.filter(
        (item) => item.dayOfWeek.toLowerCase() === selectedDayOfWeek,
      );

    const filteredSlotsByDayOfWeek = filteredSlotsByLocation?.filter(
      (item) => item.dayOfWeek.toLowerCase() === selectedDayOfWeek,
    );

    specificSlots =
      filteredSlotsByDayOfWeek && filteredSlotsByDayOfWeek.length > 0
        ? filteredSlotsByDayOfWeek
        : null;

    const allFlattenedSlots = availability.data
      .map((item) => item.availabilities)
      .flat()
      .filter((item) => item.dayOfWeek.toLowerCase() === selectedDayOfWeek);

    allSlots = allFlattenedSlots.length > 0 ? allFlattenedSlots : null;
  }

  // FIND NEXT AVAILABLE DATE FOR BOOKING
  const availableDays = availability?.data?.[0]?.availabilities.map((item) =>
    item.dayOfWeek.toLowerCase(),
  );

  const nextAvailableDate = Array.from({ length: 365 }, (_, index) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + index);
      return newDate;
    }
    return null;
  }).find(
    (date) =>
      date &&
      availableDays?.includes(
        date.toLocaleString("en-us", { weekday: "short" }).toLowerCase(),
      ),
  );

  const formattedNextAvailableDate = nextAvailableDate
    ? format(nextAvailableDate, "PPP")
    : null;

  const selectDefaultMonth = !availableDays?.includes(new Date()?.toLocaleString("en-us", { weekday: 'short' }).toLowerCase())
    ? nextAvailableDate?.getMonth()
    : selectedDate?.getMonth();

  const handleNextAvailableClick = () => {
    const newSelectedDate = new Date(selectedDate ?? new Date());
    newSelectedDate.setDate(newSelectedDate.getDate() + 1);

    while (
      !availableDays?.includes(
        newSelectedDate
          .toLocaleString("en-us", { weekday: "short" })
          .toLowerCase(),
      )
    ) {
      newSelectedDate.setDate(newSelectedDate.getDate() + 1);
    }

    setSelectedDate(newSelectedDate);
    setAppointmentDetails({ time: "", date: format(newSelectedDate, "yyyy-MM-dd'T'HH:mm:ssXXX") });
  };

  const handleDateChange = (date: Date) => {
    // Extract the time from the current appointmentDetails.date
    const appointmentTime = dayjs(appointmentDetails.date).format('HH:mm:ss');

    // Format the selected date and combine it with the extracted time
    const formattedDate = dayjs(date).format('YYYY-MM-DD') + 'T' + appointmentTime + dayjs(date).format('Z');

    try {
      schema.parse({ eventDate: formattedDate });
      setSelectedDate(new Date(formattedDate));
      setAppointmentDetails({ time: "", date: formattedDate });
      setDateError("");
    } catch (err) {
      if (err instanceof z.ZodError && err?.issues?.[0]) {
        setDateError(err.issues[0].message);
      }
    }
  };

  const today = new Date()
    .toLocaleString("en-us", { weekday: "short" })
    .toLowerCase();

  const classNames: ClassNames = {
    day_today: `focus:text-white
      ${!availableDays?.includes(today) && "line-through"}`,
    day_selected: `aria-selected:bg-[#0099FF] text-white focus:bg-[#0099FF] focus:text-white`,
  };

  if (typeof slug !== "string" || availability.data?.length === 0) {
    return <div>Please click book now from doctor&apos;s profile</div>;
  }

  if (availability.isLoading) {
    return <Loader />;
  }

  if (availability.isError) {
    return <div>Error...</div>;
  }

  return (
    <main className="mt-5 lg:mt-10">
      <h2 className="text-[20px] font-semibold leading-[36px] tracking-[0.3px] lg:text-[30px]">
        Booking Appointment
      </h2>

      <section className="flex-row-reverse lg:flex lg:items-center">
        {/* // * Pick Date */}
        <section className="relative my-5 lg:my-0 lg:w-1/3">
          <div className="flex flex-col items-center">
            <Calendar
              mode="single"
              showOutsideDays={false}
              selected={selectedDate}
              defaultMonth={new Date(new Date().getFullYear(), selectDefaultMonth!)}
              onSelect={setSelectedDate}
              onDayClick={handleDateChange}
              disabled={(date) => {
                const isBeforeToday = isBefore(date, startOfDay(new Date()));
                const today = isToday(date);
                const isNotAvailableDay = availableDays
                  ? !availableDays.includes(
                    date
                      .toLocaleString("en-us", { weekday: "short" })
                      .toLowerCase(),
                  )
                  : false;

                return isBeforeToday || (isNotAvailableDay && !today);
              }}
              classNames={classNames}
              className="rounded-md border"
            />
            <Button
              onClick={handleNextAvailableClick}
              className="mt-2 h-fit bg-transparent p-0 text-[#0099FF]"
            >
              Go to next available date
            </Button>
            {dateError && <p className="text-red-500">{dateError}</p>}
          </div>
        </section>

        <section className="mb-10 lg:mx-auto lg:mb-0 lg:w-3/5">
          {/* // * Pick Appointment Type & Location */}
          <section>
            <Select>
              <SelectTrigger className="h-12 w-full rounded-md bg-[#F7F7F7] p-[14px] text-[14px] font-semibold">
                <SelectValue
                  defaultValue={AppointmentType.IN_PERSON}
                  placeholder="Chamber Appointment"
                  onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => {
                    setAppointmentDetails({
                      type: evt.target.value as AppointmentDetails["type"],
                    });
                  }}
                />
              </SelectTrigger>

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

            <div className="mt-4" />
            {availability.data.length === 1 && (
              <Select>
                <SelectTrigger className="h-12 w-full rounded-md bg-[#F7F7F7] p-[14px] text-[14px] font-semibold">
                  <SelectValue
                    defaultValue={availability.data[0]?.location}
                    placeholder={availability.data[0]?.location}
                    onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => {
                      setSelectedTime(null);
                      setAppointmentDetails({
                        location: evt.target.value,
                      });
                    }}
                  />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={availability.data[0]?.location ?? ""}>
                      {availability.data[0]?.location ?? ""}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}

            {availability.data.length > 1 && (
              <Select>
                <SelectTrigger className="h-12 w-full rounded-md bg-[#F7F7F7] p-[14px] text-[14px] font-semibold">
                  <SelectValue
                    placeholder="Select Location"
                    onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => {
                      setSelectedTime(null);
                      setAppointmentDetails({
                        location: evt.target.value,
                      });
                    }}
                  />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    {availability.data.map((item) => (
                      <SelectItem key={item.location} value={item.location}>
                        {item.location}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </section>

          {/* // * Pick Time */}
          <section className="w-full">
            {appointmentDetails.type === AppointmentType.IN_PERSON && (
              <div className="mt-4 flex flex-col gap-4">
                {specificSlots ? (
                  specificSlots.map((item) => {
                    const isSelected: boolean = selectedTime !== null && selectedTime.id === item.id;
                    return (
                      <Button
                        type="button"
                        key={item.dayOfWeek + item.startHour + item.endHour}
                        className={`w-full rounded-md border p-[10px] text-[14px] ${isSelected
                          ? "border-[#0099FF] bg-[#0099FF] text-white hover:border-[#0099FF] hover:bg-[#0099FF] hover:text-white"
                          : "bg-transparent text-black"
                          }`}
                        onClick={() => {
                          setSelectedTime(isSelected ? null : item);
                          setAppointmentDetails({
                            time: isSelected
                              ? "" // Clear the time if this slot is already selected and clicked again
                              : formatTime(
                                DUMMY_DATE_PREFIX + item.startHour,
                                DUMMY_DATE_PREFIX + item.endHour,
                              ),
                          });
                        }}
                      >
                        {formatTime(
                          DUMMY_DATE_PREFIX + item.startHour,
                          DUMMY_DATE_PREFIX + item.endHour,
                        )}
                      </Button>
                    );
                  })
                ) : appointmentDetails.location !== "default-selected-location" ? (
                  <div className="px-1 text-red-500">
                    No Available Slots before {formattedNextAvailableDate}.
                    Please Select Another Date or Location.
                  </div>
                ) : null}
              </div>
            )}
            {appointmentDetails.type === AppointmentType.ONLINE && (
              <>
                {allSlots ? (
                  <div className="mt-4 flex flex-col gap-4">
                    {allSlots.map((item) => (
                      <Button
                        type="button"
                        key={item.dayOfWeek + item.startHour + item.endHour}
                        className={`w-full rounded-md border p-[10px] text-[14px] ${appointmentDetails.time !== ""
                          ? "border-[#0099FF] bg-[#0099FF] text-white hover:border-[#0099FF] hover:bg-[#0099FF] hover:text-white"
                          : ""
                          }`}
                        onClick={() => {
                          setSelectedTime(item);
                          setAppointmentDetails({
                            time: formatTime(
                              DUMMY_DATE_PREFIX + item.startHour,
                              DUMMY_DATE_PREFIX + item.endHour,
                            ),
                          });
                        }}
                      >
                        {formatTime(
                          DUMMY_DATE_PREFIX + item.startHour,
                          DUMMY_DATE_PREFIX + item.endHour,
                        )}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="px-1 text-red-500">
                    No Available Slots. Please Select Another Date or Location.
                  </div>
                )}
              </>
            )}
          </section>

          <Button
            className={`btn mt-5 w-full bg-[#0099FF] text-white hover:border-[#0099FF] hover:bg-[#0099FF] hover:text-white 
            ${disabledContinueButton ? "bg-gray-500" : ""}`}
            disabled={disabledContinueButton}
            onClick={() => {
              setAppointmentDetails({ doctorSlug: slug, fee });
              next();
            }}
          >
            Continue
          </Button>
        </section>
      </section>
    </main>
  );
};

export const AppointmentFormForAdmin = (props: { next: () => void }) => {
  const { next } = props;
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [dateError, setDateError] = useState("");
  const { appointmentDetails, setAppointmentDetails } = useAppointmentStore();
  const router = useRouter();
  const slug = router.query?.slug as string;
  const availability = api.doctor.getAvailableSlots.useQuery(
    { slug },
    { enabled: !!slug },
  );

  useEffect(() => {
    const defaultSelectedDate = !availableDays?.includes(
      new Date()?.toLocaleString("en-us", { weekday: 'short' }).toLowerCase())
      ? nextAvailableDate ?? new Date()
      : new Date();

    setSelectedDate(defaultSelectedDate);
    setAppointmentDetails({ time: "", date: format(defaultSelectedDate, "yyyy-MM-dd'T'HH:mm:ssXXX") });

    if (availability?.data && availability.data.length >= 1) {
      setSelectedTime(null);
      setAppointmentDetails({
        location: availability?.data[0]?.location,
      });
    }
  }, [availability.data]);

  const disabledContinueButton =
    appointmentDetails.time === "" ||
    (appointmentDetails.type === AppointmentType.IN_PERSON &&
      appointmentDetails.location === "default-selected-location");

  const currentLocationFee = availability.data?.filter(
    (item) => item.location === appointmentDetails.location,
  )?.[0]?.consultationFee;

  const fee = currentLocationFee ?? DEFAULT_CONSULTATION_FEE;

  // * Filter slots by location
  let specificSlots = null;
  let allSlots = null;

  const selectedDayOfWeek = selectedDate
    ?.toLocaleDateString(undefined, { weekday: "short" })
    .toLowerCase();
  if (availability.data) {
    const filteredSlotsByLocation = availability.data
      .filter((item) => item.location === appointmentDetails.location)?.[0]
      ?.availabilities?.filter(
        (item) => item.dayOfWeek.toLowerCase() === selectedDayOfWeek,
      );

    const filteredSlotsByDayOfWeek = filteredSlotsByLocation?.filter(
      (item) => item.dayOfWeek.toLowerCase() === selectedDayOfWeek,
    );

    specificSlots =
      filteredSlotsByDayOfWeek && filteredSlotsByDayOfWeek.length > 0
        ? filteredSlotsByDayOfWeek
        : null;

    const allFlattenedSlots = availability.data
      .map((item) => item.availabilities)
      .flat()
      .filter((item) => item.dayOfWeek.toLowerCase() === selectedDayOfWeek);

    allSlots = allFlattenedSlots.length > 0 ? allFlattenedSlots : null;
  }

  // FIND NEXT AVAILABLE DATE FOR BOOKING
  const availableDays = availability?.data?.[0]?.availabilities.map((item) =>
    item.dayOfWeek.toLowerCase(),
  );

  const nextAvailableDate = Array.from({ length: 365 }, (_, index) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + index);
      return newDate;
    }
    return null;
  }).find(
    (date) =>
      date &&
      availableDays?.includes(
        date.toLocaleString("en-us", { weekday: "short" }).toLowerCase(),
      ),
  );

  const formattedNextAvailableDate = nextAvailableDate
    ? format(nextAvailableDate, "PPP")
    : null;

  const selectDefaultMonth = !availableDays?.includes(new Date()?.toLocaleString("en-us", { weekday: 'short' }).toLowerCase())
    ? nextAvailableDate?.getMonth()
    : selectedDate?.getMonth();

  const handleNextAvailableClick = () => {
    const newSelectedDate = new Date(selectedDate ?? new Date());
    newSelectedDate.setDate(newSelectedDate.getDate() + 1);

    while (
      !availableDays?.includes(
        newSelectedDate
          .toLocaleString("en-us", { weekday: "short" })
          .toLowerCase(),
      )
    ) {
      newSelectedDate.setDate(newSelectedDate.getDate() + 1);
    }

    setSelectedDate(newSelectedDate);
    setAppointmentDetails({ time: "", date: format(newSelectedDate, "yyyy-MM-dd'T'HH:mm:ssXXX") });
  };

  const handleDateChange = (date: Date) => {
    // Extract the time from the current appointmentDetails.date
    const appointmentTime = dayjs(appointmentDetails.date).format('HH:mm:ss');

    // Format the selected date and combine it with the extracted time
    const formattedDate = dayjs(date).format('YYYY-MM-DD') + 'T' + appointmentTime + dayjs(date).format('Z');

    try {
      schema.parse({ eventDate: formattedDate });
      setSelectedDate(new Date(formattedDate));
      setAppointmentDetails({ time: "", date: formattedDate });
      setDateError("");
    } catch (err) {
      if (err instanceof z.ZodError && err?.issues?.[0]) {
        setDateError(err.issues[0].message);
      }
    }
  };

  const today = new Date()
    .toLocaleString("en-us", { weekday: "short" })
    .toLowerCase();

  const classNames: ClassNames = {
    day_today: `${!availableDays?.includes(today) && "line-through"
      } focus:text-white`,
    day_selected: `aria-selected:bg-[#0099FF] text-white focus:bg-[#0099FF] focus:text-white`,
  };

  if (typeof slug !== "string" || availability.data?.length === 0) {
    return <div>Please click book now from doctor&apos;s profile</div>;
  }

  if (availability.isLoading) {
    return <Loader />;
  }

  if (availability.isError) {
    return <div>Error...</div>;
  }

  return (
    <main className="mt-5 lg:mt-10">
      <h2 className="text-[20px] font-semibold leading-[36px] tracking-[0.3px] lg:text-[30px]">
        Booking Appointment
      </h2>

      <section className="flex-row-reverse lg:flex lg:items-center">
        {/* // * Pick Date */}
        <section className="relative my-5 lg:my-0 lg:w-1/3">
          <div className="flex flex-col items-center">
            <Calendar
              mode="single"
              showOutsideDays={false}
              selected={selectedDate}
              defaultMonth={new Date(new Date().getFullYear(), selectDefaultMonth!)}
              onSelect={setSelectedDate}
              onDayClick={handleDateChange}
              disabled={(date) => {
                const isBeforeToday = isBefore(date, startOfDay(new Date()));
                const today = isToday(date);
                const isNotAvailableDay = availableDays
                  ? !availableDays.includes(
                    date
                      .toLocaleString("en-us", { weekday: "short" })
                      .toLowerCase(),
                  )
                  : false;

                return isBeforeToday || (isNotAvailableDay && !today);
              }}
              classNames={classNames}
              className="rounded-md border"
            />
            <Button
              onClick={handleNextAvailableClick}
              className="mt-2 h-fit bg-transparent p-0 text-[#0099FF]"
            >
              Go to next available date
            </Button>
            {dateError && <p className="text-red-500">{dateError}</p>}
          </div>
        </section>

        <section className="mb-10 lg:mx-auto lg:mb-0 lg:w-3/5">
          {/* // * Pick Appointment Type & Location */}
          <section>
            <Select>
              <SelectTrigger className="h-12 w-full rounded-md bg-[#F7F7F7] p-[14px] text-[14px] font-semibold">
                <SelectValue
                  defaultValue={AppointmentType.IN_PERSON}
                  placeholder="Chamber Appointment"
                  onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => {
                    setAppointmentDetails({
                      type: evt.target.value as AppointmentDetails["type"],
                    });
                  }}
                />
              </SelectTrigger>

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

            <div className="mt-4" />
            {availability.data.length === 1 && (
              <Select>
                <SelectTrigger className="h-12 w-full rounded-md bg-[#F7F7F7] p-[14px] text-[14px] font-semibold">
                  <SelectValue
                    defaultValue={availability.data[0]?.location}
                    placeholder={availability.data[0]?.location}
                    onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => {
                      setSelectedTime(null);
                      setAppointmentDetails({
                        location: evt.target.value,
                      });
                    }}
                  />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={availability.data[0]?.location ?? ""}>
                      {availability.data[0]?.location ?? ""}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}

            {availability.data.length > 1 && (
              <Select>
                <SelectTrigger className="h-12 w-full rounded-md bg-[#F7F7F7] p-[14px] text-[14px] font-semibold">
                  <SelectValue
                    placeholder="Select Location"
                    onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => {
                      setSelectedTime(null);
                      setAppointmentDetails({
                        location: evt.target.value,
                      });
                    }}
                  />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    {availability.data.map((item) => (
                      <SelectItem key={item.location} value={item.location}>
                        {item.location}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </section>

          {/* // * Pick Time */}
          <section className="w-full">
            {appointmentDetails.type === AppointmentType.IN_PERSON && (
              <div className="mt-4 flex flex-col gap-4">
                {specificSlots ? (
                  specificSlots.map((item) => {
                    const isSelected: boolean = selectedTime !== null && selectedTime.id === item.id;
                    return (
                      <Button
                        type="button"
                        key={item.dayOfWeek + item.startHour + item.endHour}
                        className={`w-full rounded-md border p-[10px] text-[14px] ${isSelected
                          ? "border-[#0099FF] bg-[#0099FF] text-white hover:border-[#0099FF] hover:bg-[#0099FF] hover:text-white"
                          : "bg-transparent text-black"
                          }`}
                        onClick={() => {
                          setSelectedTime(isSelected ? null : item);
                          setAppointmentDetails({
                            time: isSelected
                              ? "" // Clear the time if this slot is already selected and clicked again
                              : formatTime(
                                DUMMY_DATE_PREFIX + item.startHour,
                                DUMMY_DATE_PREFIX + item.endHour,
                              ),
                          });
                        }}
                      >
                        {formatTime(
                          DUMMY_DATE_PREFIX + item.startHour,
                          DUMMY_DATE_PREFIX + item.endHour,
                        )}
                      </Button>
                    );
                  })
                ) : appointmentDetails.location !== "default-selected-location" ? (
                  <div className="px-1 text-red-500">
                    No Available Slots before {formattedNextAvailableDate}.
                    Please Select Another Date or Location.
                  </div>
                ) : null}
              </div>
            )}
            {appointmentDetails.type === AppointmentType.ONLINE && (
              <>
                {allSlots ? (
                  <div className="mt-4 flex flex-col gap-4">
                    {allSlots.map((item) => (
                      <Button
                        type="button"
                        key={item.dayOfWeek + item.startHour + item.endHour}
                        className={`w-full rounded-md border p-[10px] text-[14px] ${appointmentDetails.time !== ""
                          ? "border-[#0099FF] bg-[#0099FF] text-white hover:border-[#0099FF] hover:bg-[#0099FF] hover:text-white"
                          : ""
                          }`}
                        onClick={() => {
                          setSelectedTime(item);
                          setAppointmentDetails({
                            time: formatTime(
                              DUMMY_DATE_PREFIX + item.startHour,
                              DUMMY_DATE_PREFIX + item.endHour,
                            ),
                          });
                        }}
                      >
                        {formatTime(
                          DUMMY_DATE_PREFIX + item.startHour,
                          DUMMY_DATE_PREFIX + item.endHour,
                        )}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="px-1 text-red-500">
                    No Available Slots. Please Select Another Date or Location.
                  </div>
                )}
              </>
            )}
          </section>

          <Button
            className={`btn mt-5 w-full bg-[#0099FF] text-white hover:border-[#0099FF] hover:bg-[#0099FF] hover:text-white 
          ${disabledContinueButton ? "bg-gray-500" : ""}`}
            disabled={disabledContinueButton}
            onClick={() => {
              setAppointmentDetails({ doctorSlug: slug, fee });
              next();
            }}
          >
            Continue
          </Button>
        </section>
      </section>
    </main>
  );
};
