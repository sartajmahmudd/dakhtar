import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState, useRef } from "react";
import * as React from "react"
import Head from "next/head";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format, isBefore, startOfDay } from "date-fns";
import type { ClassNames } from "react-day-picker";
import { useForm } from "react-hook-form";
import { FaCalendarAlt } from "react-icons/fa";
import { IoIosAddCircle } from "react-icons/io";
import { IoTrashBin } from "react-icons/io5";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/utils";
import { api } from "~/utils/api";
import { useUser } from "~/utils/auth";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import dayjs from "dayjs";
import type { QueryKey } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import Findings from "~/components/prescription/Findings";

const Medicine = z.object({
  name: z.string(),
  dosage: z.string(),
  remarks: z.string(),
});

interface SuggestedDiagnosis {
  id: number,
  name: string
}
interface SuggestedMedicine {
  id: number;
  name: string;
  dosageForm: string;
  generic: string;
  strength: string;
}

const formSchema = z.object({
  complaints: z.string().optional(),
  findings: z.string().optional(),
  diagnosis: z.string().optional(),
  medicine: z.array(Medicine).optional(),
  advice: z.string().optional(),
  followup: z.date().optional(),
  visitSummary: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

const Prescription = () => {
  const [user] = useUser();
  const [medicineCount, setMedicineCount] = useState<number[]>([1]);
  const [formData] = useState<FormSchema | null>(null);
  const router = useRouter();
  const userId = Number(user?.id);
  const appointmentId = Number(router.query.appointmentId);
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    shouldUnregister: false,
  });

  const [findingsName, setFindingsName] = useState<string | null>(null);
  const [selectedTeeth, setSelectedTeeth] = useState<string>('');
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
  const [selectedTeethMap, setSelectedTeethMap] = useState<Record<string, (string | number)[]>>(() => ({}));

  const queryClient = useQueryClient();
  const [diagnosisList, setDiagnosisList] = useState<SuggestedDiagnosis[] | null>(
    null
  );
  const [medicineList, setMedicineList] = useState<SuggestedMedicine[] | null>(
    null,
  );
  const [diagnosisInputValue, setDiagnosisInputValue] = useState<string | null>(null);
  const [medicineInputValue, setMedicineInputValue] = useState<string>('');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string[]>([]);
  const [dosageInputValue, setDosageInputValue] = useState<string>('');

  const suggestDiagnosis = api.prescription.getDiagnosisSuggestion.useMutation();
  const suggestMedicine = api.prescription.getMedicineSuggestion.useMutation();

  const [priyoPrescriptionValue, setPriyoPrescriptionValue] = useState<string>('');

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const dialogRef = useRef<HTMLButtonElement>(null);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const getDoctorIdData = api.prescription.getDoctorIdByUserId.useQuery(
    { userId: userId },
    { enabled: !!userId }
  );

  const doctorId = Number(getDoctorIdData.data?.id);

  const getPriyoPrescription = api.prescription.getPrescriptionTemplateByDrId.useQuery(
    { doctorId }
  );
  const createPriyoPrescription = api.prescription.createPrescriptionTemplate.useMutation();
  const deletePriyoPrescription = api.prescription.deletePrescriptionTemplate.useMutation()

  useEffect(() => {
    // Load findingsName from localStorage on component mount
    const savedfindingsName = localStorage.getItem('findingsName');
    if (savedfindingsName) {
      setFindingsName(JSON.parse(savedfindingsName) as string);
    }

    // Load teethMap from localStorage on component mount
    const savedTeethMap = localStorage.getItem('selectedTeethMap');
    if (savedTeethMap) {
      setSelectedTeethMap(JSON.parse(savedTeethMap) as Record<string, string[]>);
    }

    // Load selectedTeethString from localStorage on component mount
    const selectedTeethString = localStorage.getItem('selectedTeethString');
    if (selectedTeethString) {
      setSelectedTeeth(JSON.parse(selectedTeethString) as string);
    }
  }, []);

  useEffect(() => {
    handleFindingsValue();
  }, [findingsName, selectedTeeth]);

  useEffect(() => {
    const delay = 300;
    const cb = () => {
      if (diagnosisInputValue) {
        suggestDiagnosis.mutate(
          { inputValue: diagnosisInputValue },
          {
            onSuccess: (result) => setDiagnosisList(result),
          },
        );
      }
    };
    const timeout = setTimeout(cb, delay);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagnosisInputValue]);

  useEffect(() => {
    form.setValue('diagnosis', selectedDiagnosis.join(', '));
  }, [selectedDiagnosis]);

  useEffect(() => {
    // Load selectedDiagnosis from localStorage on component mount
    const savedDiagnosis = localStorage.getItem('selectedDiagnosis');
    if (savedDiagnosis) {
      setSelectedDiagnosis(JSON.parse(savedDiagnosis) as string[]);
    }
  }, []);

  useEffect(() => {
    const delay = 300;
    const cb = () => {
      suggestMedicine.mutate(
        { inputValue: medicineInputValue },
        {
          onSuccess: (result) => setMedicineList(result),
        },
      );
    };
    const timeout = setTimeout(cb, delay);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicineInputValue]);

  useEffect(() => {
    // Retrieve and set medicineCount from localStorage
    const storedMedicineCount = localStorage.getItem("medicineCount");
    if (storedMedicineCount) {
      setMedicineCount(JSON.parse(storedMedicineCount) as number[]);
    }

    // Check if form data is passed as query parameter
    if (router.query.formData) {
      const parsedFormData = JSON.parse(
        router.query.formData as string,
      ) as FormSchema;

      // Convert date strings back to Date objects
      if (
        parsedFormData?.followup &&
        typeof parsedFormData.followup === "string"
      ) {
        parsedFormData.followup = new Date(parsedFormData.followup);
      }

      // Set the form data to pre-fill the fields
      form.reset(parsedFormData);
    }
  }, [form, router.query.formData]);

  const handlePriyoPrescription = (id: number) => {
    const selectedTemplate = getPriyoPrescription.data?.find(priyo => priyo.id === id);
    if (selectedTemplate) {
      form.setValue('complaints', selectedTemplate.complaint ?? '');
      form.setValue('advice', `• ${selectedTemplate.advice}` ?? '• ');

      const getfindingsName = selectedTemplate?.findings?.split(', ').find(value => !value.includes('Left') && !value.includes('Right')) ?? '';
      form.setValue('findings', getfindingsName);
      setFindingsName(getfindingsName);
      localStorage.setItem('findingsName', JSON.stringify(getfindingsName));

      setSelectedTeethMap(() => ({}))
      localStorage.removeItem("selectedTeethMap");

      setSelectedDiagnosis([selectedTemplate?.diagnosis ?? '']);
      localStorage.setItem('selectedDiagnosis', JSON.stringify([selectedTemplate?.diagnosis ?? '']))

      const medicineData = selectedTemplate.medicine.map(med => ({
        name: med.name,
        dosage: med.dosage,
        remarks: med.remarks ?? '',
      }));
      form.setValue('medicine', medicineData);
      if (medicineData.length === 0) {
        setMedicineCount([1])
      } else {
        setMedicineCount(Array.from({ length: medicineData.length }, (_, index) => index + 1));
      }
    }

    // Set follow-up visit date to 1 week later than today
    const oneWeekLaterDate = addDays(new Date(), 7);
    form.setValue('followup', oneWeekLaterDate);
  }

  const handleDeletePriyoPrescription = (id: number) => {
    deletePriyoPrescription.mutate(
      { id },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ doctorId } as unknown as QueryKey);
        }
      }
    )
  }

  const increaseMedCount = () => {
    setMedicineCount((prevMedCount) => {
      const lastElement =
        prevMedCount.length > 0 ? prevMedCount[prevMedCount.length - 1] : 0;
      const nextElement = lastElement !== undefined ? lastElement + 1 : 1;
      localStorage.setItem(
        "medicineCount",
        JSON.stringify([...prevMedCount, nextElement]),
      );
      return [...prevMedCount, nextElement];
    });
  };

  const decreaseMedCount = (id: number) => {
    const newMedCounts = [...medicineCount];
    newMedCounts.splice(id, 1);
    localStorage.setItem("medicineCount", JSON.stringify(newMedCounts));
    setMedicineCount(newMedCounts);
  };

  const handleDiagnosisInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target?.value;
    const lowercasedInput = input.toLowerCase();

    setDiagnosisInputValue(lowercasedInput);
  };

  const handleDiagnosisInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && diagnosisInputValue) {
      event.preventDefault();
      setSelectedDiagnosis([...selectedDiagnosis, diagnosisInputValue]);
      setDiagnosisInputValue('');
      localStorage.setItem('selectedDiagnosis', JSON.stringify([...selectedDiagnosis, diagnosisInputValue]));
    }
  };

  const handleSelectedDiagnosisDelete = (selectedDiagnosisIndex: number) => {
    setSelectedDiagnosis(prevSelectedDiagnosis =>
      prevSelectedDiagnosis.filter((diagnosis, index) => index !== selectedDiagnosisIndex)
    );

    // Update local storage after removing the tag
    localStorage.setItem(
      'selectedDiagnosis',
      JSON.stringify(selectedDiagnosis.filter((_, index) => index !== selectedDiagnosisIndex))
    );
  };

  const handleMedicineInputChange = (e: FormEvent<HTMLInputElement>) => {
    // @ts-expect-error value exists at runtime
    const input = (e.target?.value as string) ?? "";
    const lowercasedInput = input.toLowerCase();

    setMedicineInputValue(lowercasedInput);
  };

  const handleFindingsName = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target?.value;
    setFindingsName(newValue);
    localStorage.setItem('findingsName', JSON.stringify(newValue));
  };

  const handleQuadrant = (name: string) => {
    setSelectedQuadrant(name);
  }

  const handleSelectedTooth = (tooth: string | number) => {
    setSelectedTeethMap(prevSelectedTeethMap => {
      const updatedTeethMap = { ...prevSelectedTeethMap };
      const quadrantKey = selectedQuadrant ?? "";
      const existingTeeth = updatedTeethMap[quadrantKey] ?? [];

      // Check if the tooth is already selected
      const toothIndex = existingTeeth.indexOf(tooth);
      if (toothIndex !== -1) {
        // If it's selected, remove it
        updatedTeethMap[quadrantKey] = existingTeeth.filter((_, index) => index !== toothIndex);
      } else {
        // If it's not selected, add it
        updatedTeethMap[quadrantKey] = [...existingTeeth, tooth];
      }

      const selectedTeethString = Object.entries(updatedTeethMap)
        .flatMap(([quadrant, teethForQuadrant]) => {
          if (teethForQuadrant) {
            const formattedTeeth = teethForQuadrant.map(tooth => `${quadrant} - ${tooth}`);
            return formattedTeeth;
          } else {
            return [];
          }
        })
        .join(", ");

      setSelectedTeeth(selectedTeethString);

      localStorage.setItem('selectedTeethMap', JSON.stringify(updatedTeethMap));
      localStorage.setItem('selectedTeethString', JSON.stringify(selectedTeethString));

      return updatedTeethMap;
    });
  }

  const handleFindingsValue = () => {
    const value = findingsName ? `${findingsName}, ${selectedTeeth}` : selectedTeeth;
    form.setValue('findings', value);
  }

  const handleDiagnosisSuggestionClick = (clickedDiagnosis: string) => {

    setSelectedDiagnosis([...selectedDiagnosis, clickedDiagnosis]);
    localStorage.setItem('selectedDiagnosis', JSON.stringify([...selectedDiagnosis, clickedDiagnosis]));

    // Close the suggestion dropdown
    setDiagnosisList([]);
    setDiagnosisInputValue('');
  };

  const handleMedicineSuggestionClick = (
    clickedMedicine: SuggestedMedicine,
    index: number,
  ) => {
    // Set the selected suggestion to the corresponding medicine field
    form.setValue(
      `medicine.${index}.name`,
      `${(clickedMedicine.dosageForm.includes('Tablet') || clickedMedicine.dosageForm.includes('Capsule') || clickedMedicine.dosageForm.startsWith('Injection'))
        ? `${clickedMedicine.dosageForm.slice(0, 3)}. ` : ''
      }${clickedMedicine.name} ${clickedMedicine.strength}`,
    );
    form.setValue(`medicine.${index}.dosage`, ""); // Reset dosage
    form.setValue(`medicine.${index}.remarks`, ""); // Reset remarks

    // Close the suggestion dropdown
    setMedicineList([]);
  };

  const handleDosageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const formattedValue = formatDosageInputValue(rawValue);
    setDosageInputValue(formattedValue);
  };

  const formatDosageInputValue = (value: string): string => {
    // Remove all existing hyphens and add a hyphen after every digit except for the last one
    return value
      .replace(/-/g, "")
      .split("")
      .map((char, index, array) => {
        // Check if the character is a digit and not the last one
        if (/\d/.test(char) && index < array.length - 1) {
          return `${char}-`;
        } else {
          return char;
        }
      })
      .join("");
  };

  const onSubmit = async (data: FormSchema) => {
    await router.push({
      pathname: `/admin/prescription/${appointmentId}/preview`,
      query: { formData: JSON.stringify(data) },
    });
  };

  const classNames: ClassNames = {
    day_selected: `aria-selected:bg-[#0099FF] text-white focus:bg-[#0099FF] focus:text-white`,
  };

  if (!!user && user.role !== "DOCTOR") {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Prescription - Dakthar.com</title>
        <meta name="prescription" content="dakthar.com" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="mx-[20px] my-5 lg:mx-[90px] lg:my-10">
        <h2 className="text-[20px] font-semibold leading-[36px] tracking-[0.3px] lg:text-[30px]">
          Prescription
        </h2>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild className="my-3">
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between"
            >
              {value
                ? getPriyoPrescription?.data?.find((priyo) => priyo.name === value)?.name
                : "Select from Priyo Prescription"}
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[245px] max-h-[210px] p-0">
            <Command>
              <CommandInput
                placeholder="Search Priyo Prescription"
                className="h-9"
              />
              <CommandList>
                <CommandEmpty>No Priyo Prescription found</CommandEmpty>
                <CommandGroup>
                  {getPriyoPrescription?.data?.map((priyo) => (
                    <div key={priyo.id} className="flex">
                      <CommandItem
                        key={priyo.id}
                        value={priyo.name ?? ''}
                        className="w-full cursor-pointer border-r mb-1"
                        onSelect={(currentValue: string) => {
                          setValue(currentValue === value ? "" : currentValue)
                          setOpen(false)
                          handlePriyoPrescription(priyo.id)
                        }}
                      >
                        {priyo.name}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            value === priyo.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                      <CommandItem
                        key={priyo.id}
                      >
                        <button
                          onClick={() => handleDeletePriyoPrescription(priyo.id)}
                        >
                          <IoTrashBin className="h-5 w-5 text-red-500" />
                        </button>
                      </CommandItem>
                    </div>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="complaints">
                <AccordionTrigger>Chief Complaints</AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="complaints"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            defaultValue={formData?.complaints}
                            placeholder="Fever, Backpain ..."
                            className="border focus-visible:ring-0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="findings">
                <AccordionTrigger>On Examination / Findings</AccordionTrigger>
                <AccordionContent>
                  <Findings
                    findingsName={findingsName}
                    selectedQuadrant={selectedQuadrant}
                    selectedTeethMap={selectedTeethMap}
                    handleFindingsName={handleFindingsName}
                    handleQuadrant={handleQuadrant}
                    handleSelectedTooth={handleSelectedTooth}
                  />

                  <FormField
                    control={form.control}
                    name="findings"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={form.getValues('findings') ?? ''}
                            defaultValue={formData?.findings}
                            placeholder="Toothache, Sensitivity, Gum Swelling"
                            className="border focus-visible:ring-0 hidden"
                            onChange={(e) => form.setValue('findings', e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="diagnosis">
                <AccordionTrigger>Investigation</AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <>
                            {selectedDiagnosis.length > 0 &&
                              <div>
                                {selectedDiagnosis.map((tag, index) => (
                                  <span key={index} className="mr-2 px-1 rounded-md bg-muted w-fit mb-2">
                                    <span className="mr-2">{tag}</span>
                                    <button
                                      type="button"
                                      className="pb-2"
                                      onClick={() => handleSelectedDiagnosisDelete(index)}
                                    >x</button>
                                  </span>
                                ))}
                              </div>
                            }

                            <Input
                              {...field}
                              onSubmit={field.onChange}
                              onChangeCapture={handleDiagnosisInputChange}
                              onKeyDown={handleDiagnosisInputKeyDown}
                              defaultValue={formData?.diagnosis}
                              value={diagnosisInputValue ?? ''}
                              placeholder="X-Rays, CBC ..."
                              className="my-2 w-full rounded-md bg-[#F7F7F7] p-[14px] text-[13px]"
                            />
                            {diagnosisInputValue &&
                              diagnosisList &&
                              diagnosisList?.length > 0 && (
                                <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
                                  {diagnosisList?.slice(0, 20).map((suggestion, index) => (
                                    <button
                                      key={index}
                                      type="button"
                                      className="text-start hover:bg-muted p-1.5 w-full"
                                      onClick={() => handleDiagnosisSuggestionClick(suggestion.name)}
                                    >
                                      <b>{suggestion.name}</b>
                                    </button>
                                  ))}
                                </div>
                              )
                            }
                          </>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="medicine">
                <AccordionTrigger>Medicine</AccordionTrigger>
                <AccordionContent>
                  <Accordion
                    type="single"
                    collapsible
                    className="mx-auto w-11/12"
                  >
                    {medicineCount?.map((singleMedicine, index) => (
                      <AccordionItem
                        key={index}
                        value={`medicine-${singleMedicine}`}
                      >
                        <AccordionTrigger>
                          {form.watch(`medicine.${index}.name`)
                            ? form.watch(`medicine.${index}.name`)
                            : `Medicine - ${singleMedicine}`}
                        </AccordionTrigger>
                        <AccordionContent>
                          <FormField
                            control={form.control}
                            name={`medicine`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Medicine Name</FormLabel>
                                <FormControl>
                                  <>
                                    <Input
                                      onSubmit={field.onChange}
                                      onChangeCapture={
                                        handleMedicineInputChange
                                      }
                                      placeholder="Cardizem SR 120"
                                      className="my-2 w-full rounded-md bg-[#F7F7F7] p-[14px] text-[13px]"
                                      {...form.register(
                                        `medicine.${index}.name`,
                                      )}
                                      defaultValue={
                                        formData?.medicine?.[index]?.name
                                      }
                                    />

                                    {medicineInputValue &&
                                      medicineList &&
                                      medicineList?.length > 0 && (
                                        <div className="scrollbar-hide max-h-[200px] overflow-y-auto">
                                          {medicineList
                                            ?.slice(0, 20)
                                            .map((suggestion) => (
                                              <button
                                                key={suggestion.id}
                                                type="button"
                                                className="hover:bg-muted w-full p-1.5 text-start"
                                                onClick={() =>
                                                  handleMedicineSuggestionClick(
                                                    suggestion,
                                                    index,
                                                  )
                                                }
                                              >
                                                <span className="text-xs italic">
                                                  {suggestion.dosageForm}{" "}
                                                </span>
                                                - <b>{suggestion.name} </b>
                                                <span className="text-xs italic">
                                                  ( {suggestion.generic} ){" "}
                                                </span>
                                                -{" "}
                                                <span className="text-xs italic">
                                                  {suggestion.strength}
                                                </span>
                                              </button>
                                            ))}
                                        </div>
                                      )}
                                  </>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`medicine`}
                            render={({ field }) => (
                              <FormItem className="mt-2.5">
                                <FormLabel>Dosage</FormLabel>
                                <FormControl>
                                  <Input
                                    onChangeCapture={handleDosageInputChange}
                                    onSubmit={field.onChange}
                                    placeholder="e.g. 101"
                                    className="my-2 w-full rounded-md bg-[#F7F7F7] p-[14px] text-[13px]"
                                    {...form.register(
                                      `medicine.${index}.dosage`,
                                    )}
                                    defaultValue={
                                      formData?.medicine?.[index]?.dosage
                                    }
                                    value={dosageInputValue}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`medicine`}
                            render={({ field }) => (
                              <FormItem className="mt-2.5">
                                <FormLabel>Days / Remarks</FormLabel>
                                <FormControl>
                                  <Textarea
                                    onSubmit={field.onChange}
                                    placeholder="e.g. 7 Days (After meal)"
                                    className="mt-2 border focus-visible:ring-0"
                                    {...form.register(
                                      `medicine.${index}.remarks`,
                                    )}
                                    defaultValue={
                                      formData?.medicine?.[index]?.remarks
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="mt-3 flex items-center gap-3">
                            <Button
                              type="button"
                              className="h-fit bg-transparent px-[0px] py-[0px]"
                              onClick={increaseMedCount}
                            >
                              <IoIosAddCircle className="h-9 w-9 text-[#0099FF]" />
                            </Button>

                            {medicineCount.length > 1 && (
                              <Button
                                type="button"
                                className="h-fit bg-transparent px-[0px] py-[0px]"
                                onClick={() => {
                                  decreaseMedCount(index);
                                  form.setValue(`medicine.${index}.name`, "");
                                  form.setValue(`medicine.${index}.dosage`, "");
                                  form.setValue(
                                    `medicine.${index}.remarks`,
                                    "",
                                  );
                                }}
                              >
                                <IoTrashBin className="h-8 w-8 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="advice">
                <AccordionTrigger>Advice</AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="advice"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            defaultValue={formData?.advice ? `• ${formData.advice}` : "• "}
                            placeholder="Do Exercise..."
                            className="border focus-visible:ring-0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="followup">
                <AccordionTrigger>Follow Up Visit Date</AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="followup"
                    render={({ field }) => (
                      <FormItem>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <FaCalendarAlt className="ml-auto h-4 w-4 opacity-80" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(e) => {
                                field.onChange(e);
                                setIsCalendarOpen(false)
                              }}
                              disabled={(date) => {
                                const isBeforeToday = isBefore(
                                  date,
                                  startOfDay(new Date()),
                                );
                                return isBeforeToday;
                              }}
                              classNames={classNames}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="visitSummary">
                <AccordionTrigger>Remarks (Visit Summary)</AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="visitSummary"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            defaultValue={formData?.visitSummary}
                            placeholder="Removed the infected pulp, and sealed it to prevent further infection. Residual symptoms may indicate the need for additional assessment and intervention."
                            className="border focus-visible:ring-0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

            </Accordion>

            <div className="flex mt-5 justify-between">
              <Button
                type="button"
                onClick={() => dialogRef?.current?.click()}
                className={`w-fit rounded-[15px] bg-[#0099FF] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF]`}
              >
                Save as Priyo Prescription
              </Button>

              <Button
                type="submit"
                className={`w-fit rounded-[15px] bg-[#0099FF] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF]`}
              >
                Preview
              </Button>
            </div>

            <Dialog>
              <DialogTrigger ref={dialogRef} />
              <DialogContent
                className="w-4/5"
                onInteractOutside={(e) => {
                  e.preventDefault();
                }}
              >
                <div className="grid w-full items-center gap-3 my-3">
                  <Label htmlFor="priyoPrescription">Priyo Prescription Name</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Root Canal"
                    value={priyoPrescriptionValue ?? ''}
                    onChange={(e) => setPriyoPrescriptionValue(e.target.value)}
                    className="border focus-visible:ring-0 p-2"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    className="mb-5 w-full rounded-[15px] bg-transparent px-[18px] py-2.5 text-[14px] font-bold text-[#0099FF] border border-[#0099FF]"
                    onClick={() => dialogRef?.current?.click()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="mb-5 w-full text-center rounded-[15px] bg-[#0099FF] px-[18px] py-2.5 text-[14px] font-bold text-[#FFF]"
                    onClick={async () => {
                      await form.handleSubmit(onSubmit)();

                      createPriyoPrescription.mutate({
                        name: priyoPrescriptionValue ?? '',
                        doctorId: doctorId,
                        complaint: form.getValues('complaints'),
                        findings: form.getValues('findings'),
                        diagnosis: form.getValues('diagnosis'),
                        advice: form.getValues('advice'),
                        followUp: dayjs(form.getValues('followup')).toISOString(),
                        medicine: form.getValues('medicine')
                      })
                    }}
                  >
                    Save & Preview
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </form>
        </Form>
      </main>
    </>
  );
};

export default Prescription;
