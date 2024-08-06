import { medList } from './../../../../apps/web/public/medList';
import { diagnosisList } from './../../../../apps/web/public/diagnosisList';
// import sendgrid from "@sendgrid/mail";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

dayjs.extend(utc);

interface MedicineSuggestionOutput {
  id: number;
  name: string;
  generic: string;
  dosageForm: string;
  strength: string;
}[]
interface DiagnosisSuggestionOutput {
  id: number;
  name: string;
}[]

// sendgrid.setApiKey(env.SENDGRID_API_KEY);

export const prescriptionRouter = createTRPCRouter({
  getPrescriptionPreviewInfo: protectedProcedure
    .input(
      z.object({
        appointmentId: z.number().int().positive(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "DOCTOR") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized.",
        });
      }

      const appointment = await ctx.prisma.appointment.findUnique({
        where: {
          id: input.appointmentId,
        },
        include: {
          patient: {
            include: {
              user: true,
            },
          },
          doctor: {
            include: {
              user: true,
              metadata: true,
              specialities: {
                include: {
                  speciality: true,
                },
              },
              qualifications: true,
              organizations: {
                select: {
                  organization: true
                }
              },
              availabilities: {
                select: {
                  dayOfWeek: true,
                  startHour: true,
                  endHour: true,
                }
              }
            },
          },
        },
      });

      if (!appointment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Appointment not found.",
        });
      }

      const orgName = appointment.doctor.organizations[0]?.organization.name
      const orgImage = appointment.doctor.organizations[0]?.organization.image

      console.log({
        orgName, orgImage
      })

      const { patient, doctor, ...rest } = appointment;
      const organization = { name: orgName, image: orgImage }

      return { organization, patient, doctor, appointment: rest };
    }),
  createPrescription: protectedProcedure
    .input(
      z.object({
        appointmentId: z.number(),
        complaint: z.string().default("N/A"),
        findings: z.string().optional(),
        diagnosis: z.string().optional(),
        advice: z.string().optional(),
        followUp: z.string().optional(),
        visitSummary: z.string().optional(),
        medicine: z
          .array(
            z.object({
              name: z.string(),
              dosage: z.string(),
              remarks: z.string().optional(),
            }),
          )
          .optional(),
        priyoPrescription: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "DOCTOR") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized.",
        });
      }

      const appointment = await ctx.prisma.appointment.findUnique({
        where: {
          id: input.appointmentId,
        },
        include: {
          patient: {
            select: {
              id: true,
            },
          },
          doctor: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!appointment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Appointment not found.",
        });
      }

      const prescription = await ctx.prisma.prescription.upsert({
        where: {
          appointmentId: input.appointmentId,
        },
        update: {
          // appointmentId: input.appointmentId,
          patientId: appointment.patient.id,
          doctorId: appointment.doctor.id,
          complaint: input.complaint,
          findings: input.findings,
          diagnosis: input.diagnosis,
          advice: input.advice,
          followUp: input.followUp ? new Date(input.followUp) : null,
          visitSummary: input.visitSummary
        },
        create: {
          appointmentId: input.appointmentId,
          patientId: appointment.patient.id,
          doctorId: appointment.doctor.id,
          complaint: input.complaint,
          findings: input.findings,
          diagnosis: input.diagnosis,
          advice: input.advice,
          followUp: input.followUp ? new Date(input.followUp) : null,
          visitSummary: input.visitSummary
        },
      });

      if (input.medicine && input.medicine.length > 0 && appointment) {
        await ctx.prisma.medicine.createMany({
          data: input.medicine.map((medicine) => ({
            prescriptionId: prescription.id,
            name: medicine.name,
            dosage: medicine.dosage,
            remarks: medicine.remarks,
          })),
        });
      }

      return { message: "Prescription created successfully.", success: true };
    }),
  getDoctorIdByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.number()
      })
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.prisma.doctor.findUnique({
        where: {
          userId: input.userId
        },
        select: {
          id: true
        }
      })
      return res
    }),
  createAlternatePrescriptionLayout: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        showLogo: z.boolean(),
        showDrInfo: z.boolean(),
        headerPanel: z.number(),
        logoPanel: z.number(),
        drInfoPanel: z.number(),
        patientInfoPanel: z.number(),
        patientInfoLeftPanel: z.number(),
        patientNamePanel: z.number(),
        patientInfoRightPanel: z.number(),
        mainBodyPanel: z.number(),
        mainBodyLeftPanel: z.number(),
        mainBodyLeftUpperPanel: z.number(),
        mainBodyLeftLowerPanel: z.number(),
        rxPanel: z.number(),
        advicePanel: z.number(),
        extraPanel: z.number(),
        extraLeftPanel: z.number(),
        extraDrInfoPanel: z.number(),
        showDrInfoExtraPanel: z.boolean()
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "DOCTOR") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized.",
        });
      }

      const createPrescriptionLayout = await ctx.prisma.prescriptionLayout.upsert({
        where: {
          organizationId: input.organizationId
        },
        update: {
          showLogo: input.showLogo,
          showDrInfo: input.showDrInfo,
          headerPanel: input.headerPanel,
          logoPanel: input.logoPanel,
          drInfoPanel: input.drInfoPanel,
          patientInfoPanel: input.patientInfoPanel,
          patientInfoLeftPanel: input.patientInfoLeftPanel,
          patientNamePanel: input.patientNamePanel,
          patientInfoRightPanel: input.patientInfoRightPanel,
          mainBodyPanel: input.mainBodyPanel,
          mainBodyLeftPanel: input.mainBodyLeftPanel,
          mainBodyLeftUpperPanel: input.mainBodyLeftUpperPanel,
          mainBodyLeftLowerPanel: input.mainBodyLeftLowerPanel,
          rxPanel: input.rxPanel,
          advicePanel: input.advicePanel,
          extraPanel: input.extraPanel,
          extraLeftPanel: input.extraLeftPanel,
          extraDrInfoPanel: input.extraDrInfoPanel,
          showDrInfoExtraPanel: input.showDrInfoExtraPanel
        },
        create: {
          organizationId: input.organizationId,
          showLogo: input.showLogo,
          showDrInfo: input.showDrInfo,
          headerPanel: input.headerPanel,
          logoPanel: input.logoPanel,
          drInfoPanel: input.drInfoPanel,
          patientInfoPanel: input.patientInfoPanel,
          patientInfoLeftPanel: input.patientInfoLeftPanel,
          patientNamePanel: input.patientNamePanel,
          patientInfoRightPanel: input.patientInfoRightPanel,
          mainBodyPanel: input.mainBodyPanel,
          mainBodyLeftPanel: input.mainBodyLeftPanel,
          mainBodyLeftUpperPanel: input.mainBodyLeftUpperPanel,
          mainBodyLeftLowerPanel: input.mainBodyLeftLowerPanel,
          rxPanel: input.rxPanel,
          advicePanel: input.advicePanel,
          extraPanel: input.extraPanel,
          extraLeftPanel: input.extraLeftPanel,
          extraDrInfoPanel: input.extraDrInfoPanel,
          showDrInfoExtraPanel: input.showDrInfoExtraPanel
        }
      })
      console.log(createPrescriptionLayout);

      return { message: "Prescription Layout created successfully.", success: true };
    }),
  getPrescriptionLayoutByOrgId: protectedProcedure
    .input(z.object({
      organizationId: z.number()
    }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.prisma.prescriptionLayout.findUnique({
        where: {
          organizationId: input.organizationId
        },
        select: {
          advicePanel: true,
          drInfoPanel: true,
          headerPanel: true,
          logoPanel: true,
          mainBodyLeftLowerPanel: true,
          mainBodyLeftPanel: true,
          mainBodyLeftUpperPanel: true,
          mainBodyPanel: true,
          patientInfoLeftPanel: true,
          patientInfoPanel: true,
          patientInfoRightPanel: true,
          patientNamePanel: true,
          rxPanel: true,
          showDrInfo: true,
          showLogo: true,
          extraPanel: true,
          extraLeftPanel: true,
          extraDrInfoPanel: true,
          showDrInfoExtraPanel: true,
        }
      })

      if (!res) {
        return {
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
          showDrInfo: false,
          showLogo: false,
          extraPanel: 15,
          extraLeftPanel: 20,
          extraDrInfoPanel: 80,
          showDrInfoExtraPanel: false,
        }
      }

      return res;
    }),
  createPrescriptionTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        doctorId: z.number(),
        complaint: z.string().default("N/A"),
        findings: z.string().optional(),
        diagnosis: z.string().optional(),
        advice: z.string().optional(),
        followUp: z.string().optional(),
        medicine: z
          .array(
            z.object({
              name: z.string(),
              dosage: z.string(),
              remarks: z.string().optional(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "DOCTOR") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized.",
        });
      }

      const { name, doctorId, complaint, findings, diagnosis, advice, followUp } = input;

      const prescriptionTemplateData = {
        name,
        doctorId,
        complaint,
        findings,
        diagnosis,
        advice,
        followUp: followUp ? new Date(followUp) : null,
      };

      const prescriptionTemplate = await ctx.prisma.prescriptionTemplate.create({
        data: prescriptionTemplateData,
      });

      if (input.medicine && input.medicine.length > 0) {
        await ctx.prisma.medicine.createMany({
          data: input.medicine.map((medicine) => ({
            prescriptionId: 0,
            prescriptionTemplateId: prescriptionTemplate.id,
            name: medicine.name,
            dosage: medicine.dosage,
            remarks: medicine.remarks
          })),
        });
      }
      return { message: "Prescription Template created successfully.", success: true };
    }),
  getPrescriptionTemplateByDrId: protectedProcedure
    .input(
      z.object({
        doctorId: z.number()
      })
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.prisma.prescriptionTemplate.findMany({
        where: {
          doctorId: input.doctorId
        },
        select: {
          id: true,
          name: true,
          advice: true,
          complaint: true,
          findings: true,
          diagnosis: true,
          medicine: {
            select: {
              name: true,
              dosage: true,
              remarks: true
            }
          }
        }
      })
      return res;
    }),
  deletePrescriptionTemplate: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "DOCTOR") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized.",
        });
      }

      await ctx.prisma.prescriptionTemplate.delete({
        where: {
          id: input.id,
        },
      });

      return { message: "Prescription Template deleted successfully.", success: true };
    }),
  createMedicineSuggestion: publicProcedure
    .mutation(async ({ ctx }) => {
      const batchSize = 100;
      const totalData = medList.length;

      for (let i = 0; i < totalData; i += batchSize) {
        const data = medList.slice(i, i + batchSize).map((medicine) => ({
          name: medicine.name,
          dosageForm: medicine.dosageForm,
          generic: medicine.generic ?? '',
          strength: medicine.strength ?? ''
        }))

        try {
          const suggs = await ctx.prisma.medicineSuggestion.createMany({
            data: data,
            skipDuplicates: true
          });

          if (!suggs) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong with createMany.",
            });
          }
        } catch (error) {
          console.error("Error in createMany:", error);

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `An error occurred during data insertion`,
          });
        }
      }
      return { success: true };
    }),
  getMedicineSuggestion: protectedProcedure
    .input(z.object({
      inputValue: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const lowercasedInput = input.inputValue.toLowerCase();

      // Retrieve data from the database
      const medicineList = await ctx.prisma.medicineSuggestion.findMany({
        where: {
          OR: [
            { name: { contains: lowercasedInput } },
            { generic: { contains: lowercasedInput } }
          ]
        },
        select: {
          id: true,
          name: true,
          generic: true,
          dosageForm: true,
          strength: true,
        }
      });

      if (medicineList.length === 0) return []

      // Filter and sort the suggestions
      const filteredSuggestions: MedicineSuggestionOutput[] = medicineList.map(item => ({
        id: item.id,
        name: item.name,
        generic: item.generic ?? '',
        dosageForm: item.dosageForm,
        strength: item.strength ?? ''
      })).filter(item =>
        item?.name?.toLowerCase().includes(lowercasedInput) || item?.generic?.toLowerCase().includes(lowercasedInput)
      ).sort((a, b) => {
        const aIndex = a.name.toLowerCase().indexOf(lowercasedInput);
        const bIndex = b.name.toLowerCase().indexOf(lowercasedInput);

        // Prioritize suggestions with the input at the beginning
        if (aIndex === 0 && bIndex !== 0) return -1;
        if (bIndex === 0 && aIndex !== 0) return 1;

        // If both have the input at the beginning or neither, use normal sorting
        return a.name.localeCompare(b.name);
      });

      return filteredSuggestions;
    }),
  createDiagnosisSuggs: publicProcedure
    .mutation(async ({ ctx }) => {
      const batchSize = 100;
      const totalData = diagnosisList.length;

      for (let i = 0; i < totalData; i += batchSize) {
        const data = diagnosisList.slice(i, i + batchSize).map((diagnosis) => ({
          name: diagnosis.name
        }))

        try {
          const suggs = await ctx.prisma.diagnosisSuggestion.createMany({
            data: data,
            skipDuplicates: true
          });

          if (!suggs) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong with createMany.",
            });
          }
        } catch (error) {
          console.error("Error in createMany:", error);

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `An error occurred during data insertion`,
          });
        }
      }
      return { success: true };
    }),
  getDiagnosisSuggestion: protectedProcedure
    .input(z.object({
      inputValue: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const lowercasedInput = input.inputValue.toLowerCase();

      // Retrieve data from the database
      const diagnosisList = await ctx.prisma.diagnosisSuggestion.findMany({
        where: {
          name: {
            contains: lowercasedInput // Modify to check if the name contains the input
          }
        },
        select: {
          id: true,
          name: true
        }
      });

      if (diagnosisList.length === 0) return []

      // Filter and sort the suggestions
      const filteredSuggestions: DiagnosisSuggestionOutput[] = diagnosisList.map(item => ({
        id: item.id,
        name: item.name
      })).filter(item =>
        item?.name?.toLowerCase().includes(lowercasedInput)
      ).sort((a, b) => {
        const aIndex = a.name.toLowerCase().indexOf(lowercasedInput);
        const bIndex = b.name.toLowerCase().indexOf(lowercasedInput);

        // Prioritize suggestions with the input at the beginning
        if (aIndex === 0 && bIndex !== 0) return -1;
        if (bIndex === 0 && aIndex !== 0) return 1;

        // If both have the input at the beginning or neither, use normal sorting
        return a.name.localeCompare(b.name);
      });

      return filteredSuggestions;
    }),
});
