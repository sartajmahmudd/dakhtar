import type { AppointmentPurpose, AppointmentType, Gender } from "@dakthar/db";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { Loader } from "~/components/loader/Loader";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { api } from "~/utils/api";
import { useUser } from "~/utils/auth";

interface AppointmentInfo {
    id: number;
    date: Date;
    type: AppointmentType;
    purpose: AppointmentPurpose;
    time: string;
    prescription: {
        id: number
    } | null;
    doctor: {
        user: {
            name: string | null;
        };
    };
    patient: {
        id: number;
        user: {
            name: string | null;
            gender: Gender;
        };
    }
}

type Sections = "prescription" | "doctorInfo"

interface Value {
    position: string;
    letter: string;
}

const parseValues = (values: string[]): Value[] => {
    return values.map((value) => {
        const [position, letter] = value.split(' - ');
        return { position: position!, letter: letter! };
    });
};

const PatientAppointmentList = (props: { id: number }) => {
    const patientAppointmentList = api.appointment.getAppointmentsByPatientId.useQuery({ id: props.id })
    const [selectedApointmentId, setSelectedApointmentId] = useState<number | null>(null);
    const [appointmentInfo, setAppointmentInfo] = useState<AppointmentInfo | null>(null);

    const handleSelectedAppointment = (id: number) => {
        setSelectedApointmentId(id)
    }

    if (patientAppointmentList.isLoading) {
        return <div className="w-full h-3">
            <Loader />
        </div>
    }

    if (patientAppointmentList.isError) {
        return <h2>Error</h2>
    }

    if (patientAppointmentList.data.appointments.length === 0) {
        return (
            <div className="text-center mt-16">
                No Completed Appointment
            </div>
        )
    }

    return (
        <div>
            {
                selectedApointmentId && appointmentInfo
                &&
                <PatientAppointmentInfo appointmentInfo={appointmentInfo} />
            }

            {
                selectedApointmentId
                &&
                <ViewPrescription id={selectedApointmentId} />
            }

            <h2 className="font-semibold my-3">Visit History</h2>

            {
                patientAppointmentList.data.appointments.map(appointment =>
                    <Button
                        key={appointment.id}
                        className={`w-full flex items-center mb-1.5 hover:bg-[#0099FF] hover:text-white 
                        ${selectedApointmentId !== appointment.id
                                ? 'bg-muted text-black'
                                : 'bg-[#0099FF] text-white'}
                    `}
                        onClick={() => {
                            setAppointmentInfo(appointment)
                            handleSelectedAppointment(appointment.id)
                        }}
                    >
                        <div className="flex justify-between w-full">
                            <span className="">
                                {appointment.date.toLocaleDateString(
                                    undefined,
                                    { day: 'numeric', month: 'short', year: 'numeric' }
                                )}
                            </span>
                            <span>Dr. {appointment.doctor.user.name}</span>
                        </div>
                    </Button>
                )
            }
        </div>
    )
}

const PatientAppointmentInfo = (props: { appointmentInfo: AppointmentInfo }) => {
    return (
        <div className="mt-5 lg:mt-0">
            <div>
                <b className="text-xl flex justify-center mb-2">{props?.appointmentInfo.patient.user.name}</b>
                <h2 className="text-sm mb-1">
                    <span className="font-semibold">Gender: </span>
                    {props?.appointmentInfo.patient.user.gender}
                </h2>
                <h2 className="text-sm mb-1">
                    <span className="font-semibold">Appointment Type: </span>
                    {props?.appointmentInfo.type}
                </h2>
                <h2 className="text-sm mb-1">
                    <span className="font-semibold">Purpose: </span>
                    {props?.appointmentInfo.purpose}
                </h2>
                <h2 className="text-sm mb-1">
                    <span className="font-semibold">Time: </span>
                    {props?.appointmentInfo.time}
                </h2>
            </div>
        </div>
    )
}

const ViewPrescription = (props: { id: number }) => {
    const prescription = api.appointment.getPrescriptionByAppointmentId.useQuery({ id: props.id });
    const [selectedSection, setSelectedSection] = useState<Sections>("prescription");

    const quadrantValues = prescription?.data?.prescription?.map(singlePresc =>
        singlePresc.prescription?.findings?.split(', ').filter(value => value.includes('Left') || value.includes('Right'))
    ) ?? [];

    // Flatten the array of arrays and filter out undefined values
    const flattenedValues: string[] = quadrantValues.flat().filter((value: string | undefined): value is string => typeof value === 'string');

    const parsedValues = parseValues(flattenedValues);

    const leftUpper = parsedValues.filter((value) => value.position === 'Upper Left');
    const rightUpper = parsedValues.filter((value) => value.position === 'Upper Right');
    const leftLower = parsedValues.filter((value) => value.position === 'Lower Left');
    const rightLower = parsedValues.filter((value) => value.position === 'Lower Right');

    if (prescription.isLoading) {
        return <Loader />
    }

    if (prescription.isError) {
        return <h2>Error</h2>
    }

    return (
        <>
            <div className="my-3 flex gap-1">
                <Button
                    onClick={() => setSelectedSection('prescription')}
                    className={`${selectedSection === 'prescription' && 'border-b-2 border-b-[#0099FF]'} rounded-none text-black bg-transparent`}
                >
                    Prescription
                </Button>
                <Button
                    onClick={() => setSelectedSection('doctorInfo')}
                    className={`${selectedSection === 'doctorInfo' && 'border-b-2 border-b-[#0099FF]'} rounded-none text-black bg-transparent`}
                >
                    Doctor Info
                </Button>
            </div>

            {
                selectedSection === "prescription"
                    ?
                    prescription?.data?.prescription.map(info =>
                        <div key={info?.prescription?.id}>
                            <h2 className="text-sm flex flex-col mb-3">
                                <span className="font-semibold">Complaints:</span>
                                <span>{info?.prescription?.complaint ?? 'N/A'}</span>
                            </h2>
                            <h2 className="text-sm flex flex-col mb-3">
                                <span className="font-semibold">Findings:</span>
                                <span>{info?.prescription?.findings?.split(', ').find(value => !value.includes('Left') && !value.includes('Right')) ?? 'N/A'}</span>
                            </h2>

                            {
                                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                (info?.prescription?.findings?.includes('Upper Right -') ||
                                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                    info?.prescription?.findings?.includes('Lower Right -') ||
                                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                    info?.prescription?.findings?.includes('Upper Left -') ||
                                    info?.prescription?.findings?.includes('Lower Left -'))
                                &&
                                <div className="grid grid-cols-2 w-3/5 lg:w-1/4 mt-2 mb-3 quadrant-div">
                                    <div className="text-center text-xs lg:text-sm p-1.5 border-black border-r border-b">
                                        {rightUpper?.map(numbering => numbering.letter).join(',') ?? ''}
                                    </div>
                                    <div className="text-center text-xs lg:text-sm p-1.5 border-black border-b border-l">
                                        {leftUpper?.map(numbering => numbering.letter).join(',') ?? ''}
                                    </div>
                                    <div className="text-center text-xs lg:text-sm p-1.5 border-black border-t border-r">
                                        {rightLower?.map(numbering => numbering.letter).join(',') ?? ''}
                                    </div>
                                    <div className="text-center text-xs lg:text-sm p-1.5 border-black border-l border-t">
                                        {leftLower?.map(numbering => numbering.letter).join(',') ?? ''}
                                    </div>
                                </div>
                            }
                            <h2 className="text-sm flex flex-col mb-3">
                                <span className="font-semibold">Diagnosis:</span>
                                <span>{info?.prescription?.diagnosis ?? 'N/A'}</span>
                            </h2>
                            <h2 className="text-sm flex flex-col mb-3">
                                <span className="font-semibold">Medicine:</span>
                                <Table className="lg:w-1/2">
                                    <TableHeader>
                                        <TableRow className="border-none">
                                            <TableHead className="pl-0 text-black text-sm">Name</TableHead>
                                            <TableHead className="pl-0 text-black text-sm">Dosage</TableHead>
                                            <TableHead className="pl-0 text-black text-sm">Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {info?.prescription?.medicine.map((med) => {
                                            return (
                                                <TableRow
                                                    key={med?.name}
                                                    className="border-none text-xs lg:text-base"
                                                >
                                                    <TableCell className="pb-2.5 pl-0 pt-2.5 text-sm">
                                                        {med?.name ?? 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="pb-2.5 pl-0 pt-2.5 text-sm">
                                                        {med?.dosage ?? 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="pb-2.5 pl-0 pt-2.5 text-sm">
                                                        {med?.remarks ?? 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </h2>
                            <h2 className="text-sm flex flex-col mb-3">
                                <span className="font-semibold">Advice:</span>
                                <span>{info?.prescription?.advice ?? 'N/A'}</span>
                            </h2>
                            <h2 className="text-sm flex flex-col mb-3">
                                <span className="font-semibold">Followup:</span>
                                <span>{info?.prescription?.followUp?.toDateString()}</span>
                            </h2>
                            <h2 className="text-sm flex flex-col mb-3">
                                <span className="font-semibold">Remarks (Visit Summary):</span>
                                <span>{info?.prescription?.visitSummary ?? 'N/A'}</span>
                            </h2>
                        </div>
                    )
                    :
                    prescription?.data?.prescription.map(info =>
                        <div key={info.prescription?.id}>
                            <div className="flex items-center gap-5 my-5">
                                <div className="h-20 w-20 overflow-hidden rounded-full">
                                    {
                                        info.doctor.user.image ?
                                            <Image
                                                src={info.doctor.user.image}
                                                height={100}
                                                width={100}
                                                alt='Dr-Image'
                                            />
                                            :
                                            <Image
                                                src={`/assets/images/avatar-doctor-${info.doctor.user.gender.toLowerCase()}.png`}
                                                alt='Dr Image'
                                                height={100}
                                                width={100}
                                            />
                                    }
                                </div>
                                <div>
                                    <h2 className="font-semibold">{info.doctor.user.name}</h2>
                                    {info.doctor.qualifications.map(qlfc =>
                                        <div key={qlfc.id} className="text-sm">
                                            <h2>{qlfc.name} ({qlfc.institute} - {qlfc.year})</h2>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h2>
                                <span className="font-semibold">Speciality: </span>
                                {info.doctor.specialities[0]?.speciality?.name}
                            </h2>
                            <h2>
                                <span className="font-semibold">Location: </span>
                                {info.doctor.metadata?.map(meta => meta.location)}
                            </h2>
                            <h2>
                                <span className="font-semibold">Email: </span>
                                {info.doctor.user.email ? info.doctor.user.email : 'Not Available'}
                            </h2>
                        </div>
                    )
            }
        </>
    )
}

const MedRecords = () => {
    const [user] = useUser();
    const userId = user?.id;
    const router = useRouter();
    const patientId = Number(router.query.patientId);

    const singedInPatientData = api.user.getUserPatientId.useQuery({ userId: Number(userId) }, { enabled: !!userId });
    const singedInPatientId = singedInPatientData?.data?.patientId;

    const isAuthorizedPatient =
        patientId === singedInPatientId;

    const isPatient =
        user?.role === "PATIENT";

    const isDoctor =
        user?.role === "DOCTOR";

    if (isPatient && !isAuthorizedPatient) {
        return (
            <h2 className="mx-[20px] lg:mx-[90px] mt-5 lg:mt-10 text-center">
                You are not authorized to see other patient&#39;s Medical History
            </h2>
        )
    }

    return (
        <main className='mx-[20px] lg:mx-[90px] mt-5 lg:mt-10 mb-5'>
            <h2 className="text-[20px] font-semibold leading-[36px] tracking-[0.3px] lg:text-[30px] mb-5">
                History
            </h2>

            {
                (isPatient && isAuthorizedPatient || isDoctor)
                &&
                <PatientAppointmentList id={patientId} />
            }
        </main>
    );
};

export default MedRecords;