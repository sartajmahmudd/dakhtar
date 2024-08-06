import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import { FaEdit } from "react-icons/fa";
import { TbSwitch3 } from "react-icons/tb";
import { toast } from "sonner";
import { z } from "zod";
import { Loader } from "~/components/loader/Loader";
import PrintLayout from "~/components/prescription/PrintLayout";
import ResizableLayout from "~/components/prescription/ResizableLayout";
import { Button } from "~/components/ui/button";
import { Toaster } from "~/components/ui/sonner";
import { api } from "~/utils/api";
import { useUser } from "~/utils/auth";
import { toTitleCase } from "~/utils/helper";

const prescriptionSchema = z.object({
  complaints: z.string().optional(),
  findings: z.string().optional(),
  diagnosis: z.string().optional(),
  medicine: z
    .array(
      z.object({
        name: z.string(),
        dosage: z.string(),
        remarks: z.string(),
      }),
    )
    .optional(),
  advice: z.string().optional(),
  followup: z.string().optional(),
  visitSummary: z.string().optional(),
});

interface Value {
  position: string;
  letter: string;
}

const parseValues = (values: string[]): Value[] => {
  return values.map((value) => {
    const [position, letter] = value.split(" - ");
    return { position: position!, letter: letter! };
  });
};

const panelSizesSchema = z.object({
  headerPanel: z.number().default(15),
  logoPanel: z.number().default(50),
  drInfoPanel: z.number().default(50),
  patientInfoPanel: z.number().default(3),
  patientInfoLeftPanel: z.number().default(25),
  patientNamePanel: z.number().default(25),
  patientInfoRightPanel: z.number().default(25),
  mainBodyPanel: z.number().default(60),
  mainBodyLeftPanel: z.number().default(25),
  mainBodyLeftUpperPanel: z.number().default(25),
  mainBodyLeftLowerPanel: z.number().default(75),
  rxPanel: z.number().default(45),
  advicePanel: z.number().default(20),
  extraPanel: z.number().default(15),
  extraLeftPanel: z.number().default(20),
  extraDrInfoPanel: z.number().default(80),
});

type PanelSizes = z.infer<typeof panelSizesSchema>;

const Preview = () => {
  const [user] = useUser();
  const router = useRouter();
  const userId = Number(user?.id);
  const appointmentId = Number(router.query.appointmentId);

  const data = router.query.formData
    ? prescriptionSchema.parse(JSON.parse(router.query.formData as string))
    : null;

  const loggedInDr = api.doctor.getLoggedinDrInfo.useQuery(
    { id: userId },
    { enabled: !!userId },
  );

  const organizationId = Number(
    loggedInDr.data?.user.doctor?.organizations[0]?.organization.id,
  );

  const previewInfo = api.prescription.getPrescriptionPreviewInfo.useQuery(
    { appointmentId },
    {
      enabled: !!appointmentId && !!user,
    },
  );

  const appointment = api.appointment.updateAppointment.useMutation();
  const prescription = api.prescription.createPrescription.useMutation({
    retry: 3,
  });

  const [renderEditableLayout, setRenderEditableLayout] = useState(false);
  const [isEditClicked, setIsEditClicked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedIsEditClicked = localStorage.getItem('isEditClicked');
      return storedIsEditClicked ? JSON.parse(storedIsEditClicked) as boolean : false;
    }
    return false;
  });

  const [showSaveBtn, setShowSaveBtn] = useState(false);

  const getPrescriptionLayoutData =
    api.prescription.getPrescriptionLayoutByOrgId.useQuery({ organizationId }, {
      onSettled: () => {
        setRenderEditableLayout(true)
      }
    });

  const createPrescriptionLayout =
    api.prescription.createAlternatePrescriptionLayout.useMutation();

  const [toggle, setToggle] = useState(() => {
    if (typeof window !== "undefined") {
      const storedToggle = localStorage.getItem("toggle");
      return storedToggle ? (JSON.parse(storedToggle) as boolean) : false;
    }
    return false;
  });

  const [altPrint, setAltPrint] = useState(toggle ? true : false);

  const [editAltPrint, setEditAltPrint] = useState(() => {
    if (typeof window !== "undefined") {
      const storedEditAlt = localStorage.getItem("editAlt");
      return storedEditAlt ? (JSON.parse(storedEditAlt) as boolean) : false;
    }
    return false;
  });

  const [showOrgLogo, setShowOrgLogo] = useState(false);
  const [showDrInfo, setShowDrInfo] = useState(false);
  const [showDrInfoExtraPanel, setShowDrInfoExtraPanel] = useState(false);

  const defaultPanelSizes: PanelSizes = {
    headerPanel: 15,
    logoPanel: 50,
    drInfoPanel: 50,
    patientInfoPanel: 3,
    patientInfoLeftPanel: 25,
    patientNamePanel: 25,
    patientInfoRightPanel: 25,
    mainBodyPanel: 60,
    mainBodyLeftPanel: 25,
    mainBodyLeftUpperPanel: 25,
    mainBodyLeftLowerPanel: 75,
    rxPanel: 45,
    advicePanel: 20,
    extraPanel: 15,
    extraLeftPanel: 20,
    extraDrInfoPanel: 80,
  };

  const [panelSizes, setPanelSizes] = useState<PanelSizes>(defaultPanelSizes);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("toggle", JSON.stringify(toggle));
      localStorage.setItem("editAlt", JSON.stringify(editAltPrint));
      localStorage.setItem('isEditClicked', JSON.stringify(isEditClicked));
    }
  }, [toggle, editAltPrint, isEditClicked]);

  useEffect(() => {
    if (!getPrescriptionLayoutData.data) {
      return
    } else {
      setShowOrgLogo(getPrescriptionLayoutData.data.showLogo ?? false);
      setShowDrInfo(getPrescriptionLayoutData.data.showDrInfo ?? false);
      setShowDrInfoExtraPanel(getPrescriptionLayoutData.data.showDrInfoExtraPanel ?? false);

      const fetchedPanelSizes = {
        headerPanel: getPrescriptionLayoutData.data.headerPanel,
        logoPanel: getPrescriptionLayoutData.data.logoPanel,
        drInfoPanel: getPrescriptionLayoutData.data.drInfoPanel,
        patientInfoPanel: getPrescriptionLayoutData.data.patientInfoPanel,
        patientInfoLeftPanel:
          getPrescriptionLayoutData.data.patientInfoLeftPanel,
        patientNamePanel: getPrescriptionLayoutData.data.patientNamePanel,
        patientInfoRightPanel:
          getPrescriptionLayoutData.data.patientInfoRightPanel,
        mainBodyPanel: getPrescriptionLayoutData.data.mainBodyPanel,
        mainBodyLeftPanel: getPrescriptionLayoutData.data.mainBodyLeftPanel,
        mainBodyLeftUpperPanel:
          getPrescriptionLayoutData.data.mainBodyLeftUpperPanel,
        mainBodyLeftLowerPanel:
          getPrescriptionLayoutData.data.mainBodyLeftLowerPanel,
        rxPanel: getPrescriptionLayoutData.data.rxPanel,
        advicePanel: getPrescriptionLayoutData.data.advicePanel,
        extraPanel: getPrescriptionLayoutData.data.extraPanel,
        extraLeftPanel: getPrescriptionLayoutData.data.extraLeftPanel,
        extraDrInfoPanel: getPrescriptionLayoutData.data.extraDrInfoPanel,
      };

      console.log("Fetched Panel Sizes:", fetchedPanelSizes);
      setPanelSizes(fetchedPanelSizes);
    }
  }, [getPrescriptionLayoutData.data, getPrescriptionLayoutData.isLoading]);

  const doctorName = toTitleCase(loggedInDr.data?.user.doctor?.user.name ?? "");

  const qualificationsStr =
    loggedInDr.data?.user?.doctor?.qualifications?.reduce(
      (acc, curr, index, array) => {
        if (curr.institute) {
          if (index === array.length - 1) {
            return acc + curr.name + " (" + curr.institute + ")";
          } else {
            return acc + curr.name + " (" + curr.institute + "), ";
          }
        } else {
          if (index === array.length - 1) {
            return acc + curr.name;
          } else {
            return acc + curr.name + ", ";
          }
        }
      },
      "",
    );

  const specialtyStr = loggedInDr.data?.user?.doctor?.specialities
    .map((spcl) => spcl.speciality.name)
    .join(", ");

  const designation = loggedInDr.data?.user?.doctor?.qualifications?.find(
    (desig) => desig.degree,
  )?.degree;

  const patientAge = dayjs().diff(
    dayjs(previewInfo.data?.patient.user.dateOfBirth),
    "year",
  );

  const findingsName =
    data?.findings
      ?.split(", ")
      .find((value) => !value.includes("Left") && !value.includes("Right")) ??
    "";
  const quadrantValues =
    data?.findings
      ?.split(", ")
      .filter((value) => value.includes("Left") || value.includes("Right")) ??
    [];
  const parsedValues = parseValues(quadrantValues);

  const leftUpper = parsedValues.filter(
    (value) => value.position === "Upper Left",
  );
  const rightUpper = parsedValues.filter(
    (value) => value.position === "Upper Right",
  );
  const leftLower = parsedValues.filter(
    (value) => value.position === "Lower Left",
  );
  const rightLower = parsedValues.filter(
    (value) => value.position === "Lower Right",
  );

  const prescriptionHeaderInfo = {
    showOrgLogo,
    setShowOrgLogo,
    showDrInfo,
    setShowDrInfo,
    orgLogo:
      loggedInDr.data?.user.doctor?.organizations[0]?.organization.image ?? "",
    orgName:
      loggedInDr.data?.user.doctor?.organizations[0]?.organization.name ?? "",
    drId: loggedInDr.data?.user.doctor?.id ?? 0,
    doctorName: doctorName ?? "N/A",
    qualificationsStr: qualificationsStr ?? "N/A",
    specialtyStr: specialtyStr ?? "N/A",
    designation: designation ?? "",
    patientName: previewInfo?.data?.patient?.user?.name?.toUpperCase() ?? "N/A",
    patientGender: previewInfo?.data?.patient?.user?.gender ?? "",
    patientAge: patientAge ?? 0,
    showDrInfoExtraPanel,
    setShowDrInfoExtraPanel
  };

  const prescriptionBottomPart = {
    availabilities:
      loggedInDr.data?.user?.doctor?.availabilities?.map(
        (avl) => avl.dayOfWeek,
      ) ?? [],
    startHour: previewInfo.data?.doctor.availabilities[0]?.startHour ?? "",
    endHour: previewInfo.data?.doctor.availabilities[0]?.endHour ?? "",
    location: loggedInDr.data?.user?.doctor?.metadata[0]?.location ?? "N/A",
    qrCode: loggedInDr.data?.user?.doctor?.qrCode ?? "",
  };

  const findingValues = {
    findingsName,
    leftUpper,
    rightUpper,
    leftLower,
    rightLower
  };

  const handleToggleClick = () => {
    setToggle(!toggle);
    if (isEditClicked) {
      setAltPrint(false);
      setEditAltPrint(!toggle);
    } else {
      setEditAltPrint(false);
      setAltPrint(!toggle);
    }
  };

  const updatePrescriptionLayout = () => {
    createPrescriptionLayout.mutate(
      {
        advicePanel: panelSizes.advicePanel,
        headerPanel: panelSizes.headerPanel,
        logoPanel: panelSizes.logoPanel,
        drInfoPanel: panelSizes.drInfoPanel,
        patientInfoPanel: panelSizes.patientInfoPanel,
        patientInfoLeftPanel: panelSizes.patientInfoLeftPanel,
        patientNamePanel: panelSizes.patientNamePanel,
        patientInfoRightPanel: panelSizes.patientInfoRightPanel,
        mainBodyPanel: panelSizes.mainBodyPanel,
        mainBodyLeftPanel: panelSizes.mainBodyLeftPanel,
        mainBodyLeftUpperPanel: panelSizes.mainBodyLeftUpperPanel,
        mainBodyLeftLowerPanel: panelSizes.mainBodyLeftLowerPanel,
        rxPanel: panelSizes.rxPanel,
        organizationId: organizationId,
        showLogo: showOrgLogo,
        showDrInfo: showDrInfo,
        extraPanel: panelSizes.extraPanel,
        extraLeftPanel: panelSizes.extraLeftPanel,
        extraDrInfoPanel: panelSizes.extraDrInfoPanel,
        showDrInfoExtraPanel: showDrInfoExtraPanel,
      },
      {
        onSuccess: () => {
          toast.success("Prescription Template Saved");
          setShowSaveBtn(false);
        },
        onError: () => {
          toast.error("Prescription Template Not Saved");
        }
      },
    );
  };

  const updateAppointment = () => {
    if (!previewInfo.data) return;

    // ! IS THIS EVEN REQUIRED ?
    appointment.mutate({
      status: "COMPLETED",
      date: dayjs(previewInfo.data.appointment.date).format(),
      id: previewInfo.data.appointment.id,
      serialNo: previewInfo.data.appointment.serialNo,
      purpose: previewInfo.data.appointment.purpose,
      fee: previewInfo.data.appointment.fee,
    });
  };

  if (!data) {
    return (
      <div>Something went wrong. Please fill up the prescription again</div>
    );
  }

  if (!!user && user.role !== "DOCTOR") {
    console.log("not authorized");
    return <div>Loading...</div>;
  }

  if (!previewInfo.data && !getPrescriptionLayoutData.data) {
    console.log("no data");
    return <div>Loading...</div>;
  }

  return (
    <main className="mx-[20px] mb-10 mt-5 min-h-full lg:mx-[90px] lg:mt-10">
      <Button
        onClick={async () => {
          if (editAltPrint) {
            toast.success("Prescription Template Saved");
          }
          await router.push({
            pathname: `/admin/prescription/${appointmentId}`,
            query: { formData: JSON.stringify(data) },
          });
        }}
        className="mb-5 rounded-[15px] border border-[#0099FF] bg-transparent px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#0099FF]"
      >
        Go Back
      </Button>

      <h2 className="text-[20px] font-semibold leading-[36px] tracking-[0.3px] lg:text-[30px]">
        Prescription Preview
      </h2>

      <div className="my-5 flex justify-end lg:justify-between">
        <Button
          className="hidden rounded-[15px] bg-[#0099FF] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF] lg:flex"
          onClick={() => {
            if (editAltPrint) {
              toast.success("Prescription Template Saved");
            }
            prescription.mutate(
              {
                appointmentId,
                complaint: data.complaints,
                findings: data.findings,
                diagnosis: data.diagnosis,
                advice: data.advice,
                followUp: dayjs(data.followup).toISOString(),
                medicine: data.medicine,
                visitSummary: data.visitSummary,
              },
              {
                onSuccess: () => {
                  updateAppointment();
                  localStorage.removeItem("medicineCount");
                  localStorage.removeItem("selectedDiagnosis");
                  localStorage.removeItem("findingsName");
                  localStorage.removeItem("selectedTeethMap");
                  localStorage.removeItem("selectedTeethString");
                  void router.push({ pathname: `/admin` });
                },
              },
            );
          }}
        >
          Send to Patient
        </Button>

        <div className="flex gap-3">
          <button
            // ! COULD THIS BE HANDLED BY FEWER STATES ?
            onClick={handleToggleClick}
          >
            <TbSwitch3 className="h-5 w-5" />
          </button>

          {toggle ? (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  prescription.mutate(
                    {
                      appointmentId,
                      complaint: data.complaints,
                      findings: data.findings,
                      diagnosis: data.diagnosis,
                      advice: data.advice,
                      followUp: dayjs(data.followup).toISOString(),
                      medicine: data.medicine,
                      visitSummary: data.visitSummary,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Prescription saved");
                        // void router.push({ pathname: `/admin` });
                        // localStorage.removeItem("medicineCount");
                      },
                      onError: () => {
                        toast.error("Prescription not saved");
                      },
                    },
                  );
                  window.print();
                }}
                className="rounded-[15px] bg-[#0099FF] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF]"
              >
                Alternate Print
              </Button>
              {
                !showSaveBtn ?
                  <button
                    className="hidden lg:flex items-center justify-center gap-1 px-3 py-0.5 font-semibold border border-[#0099FF] text-[#0099FF] rounded-[15px]"
                    onClick={() => {
                      setEditAltPrint(true);
                      setIsEditClicked(true);
                      setShowSaveBtn(true);
                    }}
                  >
                    <FaEdit /> <span className="hidden lg:block">Edit</span>
                  </button>
                  :
                  <button
                    className="hidden lg:flex items-center justify-center gap-1 px-4 py-0.5 font-semibold text-white bg-[#0099FF] rounded-[15px]"
                    onClick={updatePrescriptionLayout}
                  >
                    {createPrescriptionLayout.isLoading ? 'Loading' : 'Save Layout'}
                  </button>
              }
            </div>
          ) : (
            <Button
              onClick={() => {
                prescription.mutate(
                  {
                    appointmentId,
                    complaint: data?.complaints ?? "N/A",
                    findings: data?.findings,
                    diagnosis: data?.diagnosis,
                    advice: data?.advice,
                    followUp: dayjs(data?.followup).toISOString(),
                    medicine: data?.medicine,
                    visitSummary: data?.visitSummary,
                  },
                  {
                    onSuccess: () => {
                      toast.success("Prescription saved");
                      // void router.push({ pathname: `/admin` });
                      // localStorage.removeItem("medicineCount");
                    },
                    onError: () => {
                      toast.error("Prescription not saved");
                    },
                  },
                );
                window.print();
              }}
              className="rounded-[15px] bg-[#0099FF] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF]"
            >
              Default Print
            </Button>
          )}
        </div>
      </div>

      {/* ---------------------------------- WILL GO FOR PRINT ------------------------------------ */}
      <div
        id="preview"
        className="relative min-h-full border-t p-4 shadow-xl lg:p-8"
      >
        {!editAltPrint ? (
          <PrintLayout
            data={data}
            altPrint={altPrint}
            prescriptionHeaderInfo={prescriptionHeaderInfo}
            prescriptionBottomPart={prescriptionBottomPart}
            findingValues={findingValues}
          />
        ) : (
          <>
            {!getPrescriptionLayoutData.isLoading && renderEditableLayout ? (
              <ResizableLayout
                data={data}
                altPrint={altPrint}
                prescriptionHeaderInfo={prescriptionHeaderInfo}
                panelSizes={panelSizes}
                setPanelSizes={setPanelSizes}
                findingValues={findingValues}
                showSaveBtn={showSaveBtn}
              />
            ) : (
              <Loader />
            )}
          </>
        )}
      </div>

      <Toaster duration={2500} richColors position="top-right" />
    </main>
  );
};

export default Preview;