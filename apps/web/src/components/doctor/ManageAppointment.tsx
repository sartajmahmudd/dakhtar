import { useRef, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { MdToggleOff, MdToggleOn } from "react-icons/md";
import { RiDeleteBin3Line } from "react-icons/ri";
import { VscCopy } from "react-icons/vsc";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type AppointmentTypeState = "online" | "chamber";
type AppointmentDurationState = "15" | "30" | "60" | "custom";

interface Day {
  id: number;
  name: string;
}

const daysOfWeek: Day[] = [
  { id: 0, name: "Sun" },
  { id: 1, name: "Mon" },
  { id: 2, name: "Tue" },
  { id: 3, name: "Wed" },
  { id: 4, name: "Thu" },
  { id: 5, name: "Fri" },
  { id: 6, name: "Sat" },
];

const timeSlots = ["10:00 am", "11:00 am", "12:00 pm", "01:00 pm", "02:00 pm"];

// interface AvailabilitySettings {
//     startTime: string;
//     endTime: string;
// }

// const initialAvailability: AvailabilitySettings = {
//     startTime: "09:00 am",
//     endTime: "11:00 am",
// };

export const ManageAppointment = () => {
  const [appointmentType, setAppointmentType] =
    useState<AppointmentTypeState>("online");
  const [appointmentDuration, setAppointmentDuration] =
    useState<AppointmentDurationState>("30");
  const [toggleStates, setToggleStates] = useState<boolean[]>(
    new Array(7).fill(true),
  );
  const [divCounts, setDivCounts] = useState<number[]>(new Array(7).fill(1));
  const [daysModal, setDaysModal] = useState<Day | null>(null);
  // const [availability, setAvailability] = useState<AvailabilitySettings>(initialAvailability);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const dialogRef = useRef<HTMLButtonElement>(null);

  const handleAppointmentType = (state: AppointmentTypeState) => {
    setAppointmentType(state);
  };

  const handleAppointmentDuration = (state: AppointmentDurationState) => {
    setAppointmentDuration(state);
  };

  const handleToggleDay = (dayId: number) => {
    setToggleStates((prevToggleStates) => {
      const newToggleStates = [...prevToggleStates];
      newToggleStates[dayId] = !newToggleStates[dayId];
      return newToggleStates;
    });
  };

  const handleAdd = (dayId: number) => {
    if (!toggleStates[dayId]) {
      handleToggleDay(dayId);
      divCounts[dayId] = 0;
    }

    // Update the divCounts array to add a new div for the specific day
    setDivCounts((prevDivCounts) => {
      const newDivCounts = [...prevDivCounts];
      newDivCounts[dayId] += 1;
      return newDivCounts;
    });
  };

  const handleDelete = (dayId: number) => {
    if (divCounts[dayId] === 1) {
      handleToggleDay(dayId);
    }

    // Update the divCounts array to delete a div for the specific day
    setDivCounts((prevDivCounts) => {
      const newDivCounts = [...prevDivCounts];
      newDivCounts[dayId] -= 1;
      return newDivCounts;
    });
  };

  const handleDaySelection = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      // If the day is already selected, remove it from the list
      setSelectedDays(selectedDays.filter((id) => id === dayId));
    } else {
      // If the day is not selected, add it to the list
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleApplyButtonClick = (id: number) => {
    if (selectedDays.length > 0 && daysModal) {
      const updatedDivCounts = [...divCounts];

      const selectedDayId = daysModal.id;

      if (divCounts[selectedDayId] !== undefined) {
        selectedDays.forEach((dayId) => {
          if (divCounts[dayId] !== undefined) {
            // updatedDivCounts[dayId] = divCounts[selectedDayId];
          }
          handleToggleDay(dayId);
        });

        setDivCounts(updatedDivCounts);
      }
    }

    if (!toggleStates[id] || divCounts[id] === 0) {
      selectedDays.forEach((dayId) => {
        handleToggleDay(dayId);
        setSelectedDays([]);
      });
    }

    // Close the modal or perform any other actions
    setDaysModal(null);
  };

  // const handleAvailabilityChange = (field: "startTime" | "endTime", value: string) => {
  //     setAvailability((prevAvailability) => ({
  //         ...prevAvailability,
  //         [field]: value,
  //     }));
  // };

  return (
    <div className="px-[20px] pb-[30px] pt-4 lg:bg-gray-100 lg:px-[90px] lg:pb-[70px]">
      <Button className="mb-2 rounded-[15px] border border-[#0099FF] bg-transparent px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#0099FF]">
        <IoIosArrowBack className="-ml-1 mr-0.5 h-6 w-6 pt-0.5" />
        <span>Back</span>
      </Button>

      <h2 className="mb-6 text-[20px] font-[500] leading-[41.6px] lg:text-[30px]">
        Manage Appointment of{" "}
        <span className="font-[700]">Dr. Davis Levin</span>
      </h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
        {/* ------------------------------- Schedule Availability ------------------------------- */}

        <div className=" bg-white lg:rounded-lg lg:p-[50px]">
          <h2 className="mb-[32px] hidden text-[24px] font-bold leading-[32px] lg:block">
            Schedule Availability
          </h2>

          {/* ------------ Appointment Type ------------ */}
          <div className="mb-5">
            <h2 className="mb-2.5 text-sm font-medium">Appointment Type</h2>

            <div className="flex">
              <Button
                onClick={() => handleAppointmentType("online")}
                className={`h-[36px] w-[220px] rounded-md border text-[14px] font-medium leading-[22px] 
                                    ${
                                      appointmentType === "online"
                                        ? "bg-[#0099FF] text-white"
                                        : "bg-[#F7F7F7] text-[#60728A]"
                                    }`}
              >
                Online Appointment
              </Button>

              <Button
                onClick={() => handleAppointmentType("chamber")}
                className={`h-[36px] w-[220px] rounded-md border text-[14px] font-medium leading-[22px] 
                                    ${
                                      appointmentType === "chamber"
                                        ? "bg-[#0099FF] text-white"
                                        : "bg-[#F7F7F7] text-[#60728A]"
                                    }`}
              >
                Chamber Appointment
              </Button>
            </div>
          </div>

          {/* ------------ Select Chamber ------------ */}
          {appointmentType === "chamber" && (
            <div className="mb-5">
              <h2 className="mb-2.5 text-[14px] font-medium leading-[22.4px] tracking-[1%]">
                Select Chamber
              </h2>
              <Select>
                <SelectTrigger className="h-12 w-full rounded-md bg-[#F7F7F7] text-[14px] font-semibold">
                  <SelectValue placeholder="Select Chamber" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="123 9th Ave. Suite 100 Los Angels">
                      123 9th Ave. Suite 100 Los Angels
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ------------ Consultation Fee ------------ */}
          <div className="mb-5">
            <h2 className="mb-2.5 text-[14px] font-medium leading-[24px] tracking-[1%]">
              Consultation Fee
            </h2>
            <Input
              type="text"
              placeholder="Consultation Fee"
              className="w-full rounded-[12px] bg-[#F7F7F7] px-[20px] py-[16px]"
              defaultValue="5000 BDT"
            />
          </div>

          {/* ------------ Follow-up Fee ------------ */}
          <div className="mb-5">
            <h2 className="mb-2.5 text-[14px] font-medium leading-[24px] tracking-[1%]">
              Follow-up Fee
            </h2>
            <Input
              type="text"
              placeholder="Follow-up Fee"
              className="w-full rounded-[12px] bg-[#F7F7F7] px-[20px] py-[16px]"
              defaultValue="5000 BDT"
            />
          </div>

          {/* ------------ Appointment Duration ------------ */}
          <div className="mb-5">
            <h2 className="mb-2.5 text-sm font-medium">Appointment Duration</h2>

            <div className="flex">
              <Button
                onClick={() => handleAppointmentDuration("15")}
                className={`h-[36px] w-[111px] rounded-md border text-[14px] font-medium leading-[22px] 
                                    ${
                                      appointmentDuration === "15"
                                        ? "bg-[#0099FF] text-white"
                                        : "bg-[#F7F7F7] text-[#60728A]"
                                    }`}
              >
                15 min
              </Button>

              <Button
                onClick={() => handleAppointmentDuration("30")}
                className={`h-[36px] w-[111px] rounded-md border text-[14px] font-medium leading-[22px] 
                                    ${
                                      appointmentDuration === "30"
                                        ? "bg-[#0099FF] text-white"
                                        : "bg-[#F7F7F7] text-[#60728A]"
                                    }`}
              >
                30 min
              </Button>

              <Button
                onClick={() => handleAppointmentDuration("60")}
                className={`h-[36px] w-[111px] rounded-md border text-[14px] font-medium leading-[22px] 
                                    ${
                                      appointmentDuration === "60"
                                        ? "bg-[#0099FF] text-white"
                                        : "bg-[#F7F7F7] text-[#60728A]"
                                    }`}
              >
                60 min
              </Button>

              <Button
                onClick={() => handleAppointmentDuration("custom")}
                className={`h-[36px] w-[111px] rounded-md border text-[14px] font-medium leading-[22px] 
                                    ${
                                      appointmentDuration === "custom"
                                        ? "bg-[#0099FF] text-white"
                                        : "bg-[#F7F7F7] text-[#60728A]"
                                    }`}
              >
                Custom
              </Button>
            </div>
          </div>

          {/* ------------ Date Range ------------ */}
          <div className="mb-5">
            <h2 className="mb-3 text-sm font-medium">Date Range</h2>

            <RadioGroup defaultValue="within-date">
              <div className="mb-3 flex items-center space-x-4">
                <RadioGroupItem value="within-date" id="within-date" />
                <Label htmlFor="within-date">Within a Date Range</Label>
                <Input
                  id="within-date"
                  className="h-[40px] rounded-lg bg-[#F0F0F0] pl-2 text-[14px]"
                />
              </div>

              <div className="flex items-center space-x-4">
                <RadioGroupItem value="indefinitely" id="indefinitely" />
                <Label htmlFor="indefinitely">Continue Indefinitely</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* ------------------------------- Hours of Operation ------------------------------- */}

        <div className="lg:rounded-lg lg:bg-white lg:p-[50px]">
          <h2 className="text-[16px] font-semibold leading-[24px] lg:text-center lg:text-[24px] lg:font-bold lg:leading-[32px]">
            Hours of Operation
          </h2>
          <h2 className="mb-[10px] mt-[14px] hidden text-center text-[14px] leading-[22px] lg:block">
            Set-up Your Weekly Business Hours
          </h2>

          {daysOfWeek.map((day) => (
            <div key={day.id} className="flex items-start border-b py-4">
              <div className="flex items-center">
                <Button
                  className="mr-1.5 h-fit bg-transparent p-0 text-black lg:mr-1"
                  onClick={() => handleToggleDay(day.id)}
                >
                  {toggleStates[day.id] ? (
                    <MdToggleOn className="text-[28px] text-[#0099FF] lg:text-4xl" />
                  ) : (
                    <MdToggleOff className="text-[28px] text-[#C1C1C1] lg:text-4xl" />
                  )}
                </Button>

                <span className="mr-2 w-[28px] text-[14px] font-medium leading-[20px] lg:mr-3">
                  {day.name}
                </span>
              </div>

              {toggleStates[day.id] && divCounts[day.id] !== 0 ? (
                <div className="flex flex-col">
                  {Array.from({ length: divCounts[day.id] ?? 0 }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className={`flex items-center ${index > 0 && "pt-4"}`}
                      >
                        <Select>
                          <SelectTrigger className="mr-0.5 h-[32px] w-[83px] rounded-[4px] bg-[#F5F6F8] px-1 text-[14px] leading-[20px] lg:mr-4 lg:w-[98px] lg:px-2 lg:font-medium">
                            <SelectValue placeholder="From" />
                          </SelectTrigger>

                          <SelectContent>
                            {timeSlots.map((timeSlot, index) => (
                              <SelectItem key={index} value={timeSlot}>
                                {timeSlot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <span className="ml-1 mr-1.5 lg:mr-2.5">-</span>

                        <Select>
                          <SelectTrigger className="mr-4 h-[32px] w-[83px] rounded-[4px] bg-[#F5F6F8] px-1 text-[14px] leading-[20px] lg:w-[98px] lg:px-2 lg:font-medium">
                            <SelectValue placeholder="To" />
                          </SelectTrigger>

                          <SelectContent>
                            {timeSlots.map((timeSlot, index) => (
                              <SelectItem key={index} value={timeSlot}>
                                {timeSlot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          className={"mr-3 h-fit bg-transparent p-0 text-black"}
                          onClick={() => handleDelete(day.id)}
                        >
                          <RiDeleteBin3Line className="h-4 w-4 lg:h-5 lg:w-5" />
                        </Button>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <span className="my-auto w-[222px] text-[14px] leading-[22px] text-[#8A8A8A] lg:w-[272px]">
                  Unavailable
                </span>
              )}
              <div className="flex items-center pt-1">
                <Button
                  className="mr-3 h-fit bg-transparent p-0 text-black lg:mr-2.5"
                  onClick={() => handleAdd(day.id)}
                >
                  +
                </Button>

                <Button
                  className="h-fit bg-transparent p-0 text-black"
                  onClick={() => {
                    dialogRef?.current?.click();
                    setDaysModal(day);
                  }}
                >
                  <VscCopy className="h-4 w-4 lg:h-5 lg:w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog>
        <DialogTrigger ref={dialogRef} />

        <DialogContent className="w-2/5 gap-3 lg:w-[20%]">
          <DialogHeader>
            <DialogDescription>Copy Times to...</DialogDescription>
          </DialogHeader>

          {daysOfWeek.map((day) => (
            <div key={day.id}>
              <Label
                className={`flex cursor-pointer items-center py-1.5 hover:bg-gray-100`}
              >
                <Checkbox
                  disabled={
                    daysModal && daysModal?.id === day.id ? true : undefined
                  }
                  checked={
                    daysModal && daysModal?.id === day.id ? true : undefined
                  }
                  onChange={() => handleDaySelection(day.id)}
                />
                <h2 className={`ml-3 text-[14px] `}>{day.name}</h2>
              </Label>
            </div>
          ))}

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                handleApplyButtonClick(daysModal?.id ?? 9);
                dialogRef?.current?.click();
              }}
              className="rounded-lg border bg-[#0099FF] py-1 text-[14px] font-medium text-white"
            >
              Apply
            </Button>

            <Button
              className="rounded-lg border border-[#0099FF] bg-transparent py-1 text-[14px] font-medium text-[#0099FF]"
              onClick={() => {
                setDaysModal(null);
                dialogRef?.current?.click();
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ------------------------------- Buttons ------------------------------- */}
      <div className="mt-6 flex justify-center gap-[8px] lg:justify-end lg:gap-[10px]">
        <Button className="h-[48px] w-[160px] rounded-[15px] border border-[#0099FF] bg-transparent px-[16px]  py-[6px] text-[15px] font-bold leading-[30px] text-[#0099FF] lg:w-[200px] ">
          Cancel
        </Button>

        <Button className="h-[48px] w-[160px] rounded-[15px] bg-[#0099FF] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF] lg:w-[200px]  ">
          Save
        </Button>
      </div>

      {/* -------------------------------- Modal -------------------------------- */}
      {/* {daysModal && (
        <>
          <input
            type="checkbox"
            id="days_modal"
            className="modal-toggle"
            defaultChecked={true}
          />

          <div className="modal">
            <div className="modal-box w-2/5 lg:w-[12%]">
              <h2 className="mb-3 text-[12px] font-light">Copy Times to...</h2>
              {daysOfWeek.map((day) => (
                <div key={day.id}>
                  <label
                    // key={day.id}
                    className={`mb-3 flex cursor-pointer items-center hover:bg-gray-100
                                            ${daysModal &&
                        daysModal.id === day.id
                        ? "disabled"
                        : ""
                      }`}
                  >
                    <input
                      type="checkbox"
                      disabled={daysModal && daysModal.id === day.id}
                      onChange={() => handleDaySelection(day.id)}
                    />
                    <h2 className={`ml-3 text-[14px] `}>{day.name}</h2>
                  </label>
                </div>
              ))}

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleApplyButtonClick(daysModal.id)}
                  className="bg-primary rounded-lg border py-1 text-[14px] font-medium text-white"
                >
                  Apply
                </button>

                <button
                  className="border-primary text-primary rounded-lg border py-1 text-[14px] font-medium"
                  onClick={() => setDaysModal(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )} */}
    </div>
  );
};
