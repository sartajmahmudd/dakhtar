import React from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { HiEye } from "react-icons/hi";
import { RiEyeCloseLine } from "react-icons/ri";
import { z } from "zod";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface Data {
  complaints?: string | undefined;
  findings?: string | undefined;
  diagnosis?: string | undefined;
  medicine?:
  | {
    name: string;
    dosage: string;
    remarks: string;
  }[]
  | undefined;
  advice?: string | undefined;
  followup?: string | undefined;
  visitSummary?: string | undefined;
}

interface HeaderInfo {
  showOrgLogo: boolean;
  setShowOrgLogo: React.Dispatch<React.SetStateAction<boolean>>;
  showDrInfo: boolean;
  setShowDrInfo: React.Dispatch<React.SetStateAction<boolean>>;
  showDrInfoExtraPanel: boolean;
  setShowDrInfoExtraPanel: React.Dispatch<React.SetStateAction<boolean>>;
  orgLogo: string;
  orgName: string;
  drId: number;
  doctorName: string;
  qualificationsStr: string;
  specialtyStr: string;
  designation: string;
  patientName: string;
  patientGender: string;
  patientAge: number;
}

interface FindingValues {
  findingsName: string;
  leftUpper: Value[];
  rightUpper: Value[];
  leftLower: Value[];
  rightLower: Value[];
}

interface Value {
  position: string;
  letter: string;
}

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

interface Props {
  data: Data;
  prescriptionHeaderInfo: HeaderInfo;
  findingValues: FindingValues;
  altPrint: boolean;
  showSaveBtn: boolean;
  panelSizes: PanelSizes;
  setPanelSizes: React.Dispatch<React.SetStateAction<PanelSizes>>;
}

const ResizableLayout = (props: Props) => {
  console.log('from props', props.panelSizes);

  const handlePanelSize = (panel: keyof PanelSizes, newSize: number) => {
    props.setPanelSizes((prevSizes) => ({
      ...prevSizes,
      [panel]: newSize,
    }));
  };

  return (
    <>
      <ResizablePanelGroup
        direction="vertical"
        className={`main-resizable-div min-h-screen rounded-lg border ${!props.showSaveBtn ? 'rsz-border' : ''}`}
      >
        {/* ===================== ORG LOGO AND DOCTOR INFO =========================== */}
        <ResizablePanel
          defaultSize={props.panelSizes.headerPanel}
          onResize={(d) => handlePanelSize("headerPanel", d)}
        >
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
              className="relative"
              defaultSize={props.panelSizes.logoPanel}
              onResize={(d) => handlePanelSize("logoPanel", d)}
            >
              {props.prescriptionHeaderInfo?.showOrgLogo && (
                <div className={`mt-1 flex max-h-28 items-center gap-2`}>
                  <Image
                    src={props.prescriptionHeaderInfo.orgLogo}
                    width={500}
                    height={500}
                    alt="organization_logo"
                    className="max-h-full max-w-[120px]"
                  />
                  <div className="w-full lg:w-1/3">
                    <h2 className="text-base font-semibold">
                      {props.prescriptionHeaderInfo.orgName}
                    </h2>
                  </div>
                </div>
              )}

              <button
                onClick={() =>
                  props.prescriptionHeaderInfo.setShowOrgLogo(
                    !props.prescriptionHeaderInfo?.showOrgLogo,
                  )
                }
                className={`rsz-icon absolute right-3 top-2 rounded-md border px-3 py-2 text-sm ${!props.showSaveBtn && 'hidden'}`}
              >
                {props.prescriptionHeaderInfo?.showOrgLogo ? (
                  <HiEye />
                ) : (
                  <RiEyeCloseLine />
                )}
              </button>
            </ResizablePanel>
            <ResizableHandle className={`${!props.showSaveBtn ? 'rsz-handle-border' : ''}`} />
            <ResizablePanel
              className="relative"
              defaultSize={props.panelSizes.drInfoPanel}
              onResize={(d) => handlePanelSize("drInfoPanel", d)}
            >
              {props.prescriptionHeaderInfo?.showDrInfo && (
                <div className={`mt-3 text-end`}>
                  <h2 className="text-lg font-bold lg:text-xl">
                    {props.prescriptionHeaderInfo.drId !== 26 ? "Dr." : ""}{" "}
                    {props.prescriptionHeaderInfo.doctorName ?? "N/A"}
                  </h2>
                  <h2>
                    {props.prescriptionHeaderInfo.qualificationsStr ?? "N/A"}
                  </h2>
                  <h2 className="font-semibold">
                    {props.prescriptionHeaderInfo.specialtyStr}
                  </h2>
                  <h2 className="font-semibold">
                    {props.prescriptionHeaderInfo.designation}
                  </h2>
                </div>
              )}

              <button
                onClick={() =>
                  props.prescriptionHeaderInfo.setShowDrInfo(
                    !props.prescriptionHeaderInfo?.showDrInfo,
                  )
                }
                className={`rsz-icon absolute left-3 top-2 rounded-md border px-3 py-2 text-sm ${!props.showSaveBtn && 'hidden'}`}
              >
                {props.prescriptionHeaderInfo?.showDrInfo ? (
                  <HiEye />
                ) : (
                  <RiEyeCloseLine />
                )}
              </button>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle className={`${!props.showSaveBtn ? 'rsz-handle-border' : ''}`} />

        {/* ======================= PATIENT INFO ========================== */}
        <ResizablePanel
          defaultSize={props.panelSizes.patientInfoPanel}
          onResize={(d) => handlePanelSize("patientInfoPanel", d)}
        >
          <ResizablePanelGroup
            direction="horizontal"
            className={`w-1/2 rounded-lg border ${!props.showSaveBtn ? 'rsz-border' : ''}`}
          >
            <ResizablePanel
              defaultSize={props.panelSizes.patientInfoLeftPanel}
              onResize={(d) => handlePanelSize("patientInfoLeftPanel", d)}
            >
              {/* Space before the patient name */}
            </ResizablePanel>
            <ResizableHandle className={`${!props.showSaveBtn ? 'rsz-handle-border' : ''}`} />
            <ResizablePanel
              defaultSize={props.panelSizes.patientNamePanel}
              onResize={(d) => handlePanelSize("patientNamePanel", d)}
            >
              <span>{props.prescriptionHeaderInfo.patientName ?? "N/A"}</span>
            </ResizablePanel>
            <ResizableHandle className={`${!props.showSaveBtn ? 'rsz-handle-border' : ''}`} />
            <ResizablePanel
              defaultSize={props.panelSizes.patientInfoRightPanel}
              onResize={(d) => handlePanelSize("patientInfoRightPanel", d)}
            >
              <div className="flex justify-between">
                <h2
                  className={`flex flex-col ${props.altPrint ? "alt-gender" : ""
                    }`}
                >
                  <span>{props.prescriptionHeaderInfo.patientGender}</span>
                </h2>

                <h2
                  className={`flex flex-col ${props.altPrint ? "alt-age" : ""}`}
                >
                  <span
                    className={`${props.altPrint ? "alt-patient-age" : ""}`}
                  >
                    {props.prescriptionHeaderInfo.patientAge}
                  </span>
                </h2>

                <h2
                  className={`flex flex-col ${props.altPrint ? "alt-date" : ""
                    }`}
                >
                  <span>{dayjs().format("DD MMM YYYY")}</span>
                </h2>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle className={`${!props.showSaveBtn ? 'rsz-handle-border' : ''}`} />

        {/* ======================= MAIN BODY ========================== */}
        <ResizablePanel
          defaultSize={props.panelSizes.mainBodyPanel}
          onResize={(d) => handlePanelSize("mainBodyPanel", d)}
        >
          <ResizablePanelGroup
            direction="horizontal"
            className={`rounded-lg border ${!props.showSaveBtn ? 'rsz-border' : ''}`}
          >
            <ResizablePanel
              defaultSize={props.panelSizes.mainBodyLeftPanel}
              onResize={(d) => handlePanelSize("mainBodyLeftPanel", d)}
            >
              {/* ======================= MAIN BODY LEFT PANEL ========================== */}
              <ResizablePanelGroup
                direction="vertical"
                className={`rounded-lg border ${!props.showSaveBtn ? 'rsz-border' : ''}`}
              >
                <ResizablePanel
                  defaultSize={props.panelSizes.mainBodyLeftUpperPanel}
                  onResize={(d) => handlePanelSize("mainBodyLeftUpperPanel", d)}
                >
                  {/* Space over the left content of the prescription */}
                </ResizablePanel>
                <ResizableHandle className={`${!props.showSaveBtn ? 'rsz-handle-border' : ''}`} />
                <ResizablePanel
                  defaultSize={props.panelSizes.mainBodyLeftLowerPanel}
                  onResize={(d) => handlePanelSize("mainBodyLeftLowerPanel", d)}
                >
                  <div>
                    <div className="flex flex-col gap-5 text-xs lg:text-base">
                      <div>
                        <h2 className={`font-semibold text-black`}>
                          Chief Complaints
                        </h2>
                        <h2>{props.data?.complaints}</h2>
                      </div>

                      <div>
                        <h2
                          className={`font-semibold text-black ${props.altPrint ? "alt-pres-left-content" : ""
                            }`}
                        >
                          On Examination / Findings
                        </h2>
                        <h2 className="hidden">{props.data?.findings}</h2>
                        <h2 className="mt-1.5 font-semibold">
                          {props.findingValues?.findingsName}
                        </h2>

                        {
                          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                          (props.data?.findings?.includes("Upper Right -") ||
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                            props.data?.findings?.includes("Lower Right -") ||
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                            props.data?.findings?.includes("Upper Left -") ||
                            props.data?.findings?.includes("Lower Left -")) && (
                            <div className="quadrant-div mt-2 grid w-11/12 grid-cols-2 lg:w-1/3">
                              <div className="border-b border-r border-black p-1.5 text-center text-xs lg:text-sm">
                                {props.findingValues?.rightUpper
                                  ?.map((numbering) => numbering.letter)
                                  .join(",") ?? ""}
                              </div>
                              <div className="border-b border-l border-black p-1.5 text-center text-xs lg:text-sm">
                                {props.findingValues?.leftUpper
                                  ?.map((numbering) => numbering.letter)
                                  .join(",") ?? ""}
                              </div>
                              <div className="border-r border-t border-black p-1.5 text-center text-xs lg:text-sm">
                                {props.findingValues?.rightLower
                                  ?.map((numbering) => numbering.letter)
                                  .join(",") ?? ""}
                              </div>
                              <div className="border-l border-t border-black p-1.5 text-center text-xs lg:text-sm">
                                {props.findingValues?.leftLower
                                  ?.map((numbering) => numbering.letter)
                                  .join(",") ?? ""}
                              </div>
                            </div>
                          )
                        }
                      </div>

                      <div>
                        <h2
                          className={`font-semibold text-black ${props.altPrint ? "alt-pres-left-content" : ""
                            }`}
                        >
                          Investigation
                        </h2>
                        <h2>{props.data?.diagnosis}</h2>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={`mt-5 text-xs lg:text-base`}>
                      <h2
                        className={`font-semibold text-black ${props.altPrint ? "alt-pres-left-content" : ""
                          }`}
                      >
                        Next Follow-up
                      </h2>
                      <h2>
                        {props.data?.followup
                          ? dayjs(props.data?.followup).format("DD MMM YYYY")
                          : "No follow-up needed"}
                      </h2>
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle className={`${!props.showSaveBtn ? 'rsz-handle-border' : ''}`} />

            {/* ======================= MAIN BODY RIGHT PANEL ========================== */}
            <ResizablePanel
              defaultSize={props.panelSizes.rxPanel}
              onResize={(d) => handlePanelSize("rxPanel", d)}
            >
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel>
                  <div className="mt-5">
                    <h2
                      className={`text-lg font-semibold italic text-black lg:text-xl`}
                    >
                      RX :
                    </h2>
                    <div className="pl-4 lg:pl-6">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-none text-xs lg:text-base">
                            <TableHead className="pl-0 text-black">
                              Name
                            </TableHead>
                            <TableHead className="pl-0 text-black">
                              Dosage
                            </TableHead>
                            <TableHead className="pl-0 text-black">
                              Days
                            </TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {props.data?.medicine?.map((med, index) => {
                            return (
                              <TableRow
                                key={index}
                                className="border-none text-xs lg:text-base"
                              >
                                <TableCell className="pb-2.5 pl-0 pt-2.5">
                                  {med?.name}
                                </TableCell>
                                <TableCell className="pb-2.5 pl-0 pt-2.5">
                                  {med?.dosage}
                                </TableCell>
                                <TableCell className="pb-2.5 pl-0 pt-2.5">
                                  {med?.remarks}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </ResizablePanel>

                <ResizableHandle className={`${!props.showSaveBtn ? 'rsz-handle-border' : ''}`} />

                <ResizablePanel
                  defaultSize={props.panelSizes.advicePanel}
                  onResize={(d) => handlePanelSize("advicePanel", d)}
                >
                  <div className={`text-xs lg:text-base`}>
                    <h2 className={`font-semibold text-black`}>Advice</h2>
                    <h2>{props.data?.advice}</h2>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle className={`${!props.showSaveBtn ? 'rsz-handle-border' : ''}`} />

        {/* ======================= EXTRA PANEL AT THE BOTTOM ========================== */}
        <ResizablePanel
          defaultSize={props.panelSizes.extraPanel}
          onResize={(d) => handlePanelSize("extraPanel", d)}
        >
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
              className="relative"
              defaultSize={props.panelSizes.extraLeftPanel}
              onResize={(d) => handlePanelSize("extraLeftPanel", d)}
            >
              {/* Space before the doctor info extra panel */}
            </ResizablePanel>

            <ResizableHandle className={`${!props.showSaveBtn ? 'rsz-handle-border' : ''}`} />

            <ResizablePanel
              className="relative"
              defaultSize={props.panelSizes.extraDrInfoPanel}
              onResize={(d) => handlePanelSize("extraDrInfoPanel", d)}
            >
              {props.prescriptionHeaderInfo?.showDrInfoExtraPanel && (
                <div className={`mt-3`}>
                  <h2 className="text-lg font-bold lg:text-xl">
                    {props.prescriptionHeaderInfo.drId !== 26 ? "Dr." : ""}{" "}
                    {props.prescriptionHeaderInfo.doctorName ?? "N/A"}
                  </h2>
                  <h2>
                    {props.prescriptionHeaderInfo.qualificationsStr ?? "N/A"}
                  </h2>
                  <h2 className="font-semibold">
                    {props.prescriptionHeaderInfo.specialtyStr}
                  </h2>
                  <h2 className="font-semibold">
                    {props.prescriptionHeaderInfo.designation}
                  </h2>
                </div>
              )}

              <button
                onClick={() =>
                  props.prescriptionHeaderInfo.setShowDrInfoExtraPanel(
                    !props.prescriptionHeaderInfo?.showDrInfoExtraPanel,
                  )
                }
                className={`rsz-icon absolute right-3 top-2 rounded-md border px-3 py-2 text-sm ${!props.showSaveBtn && 'hidden'}`}
              >
                {props.prescriptionHeaderInfo?.showDrInfoExtraPanel ? (
                  <HiEye />
                ) : (
                  <RiEyeCloseLine />
                )}
              </button>
            </ResizablePanel>

          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
};

export default ResizableLayout;
