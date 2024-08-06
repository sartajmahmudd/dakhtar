import { TRPCError } from "@trpc/server";
import slugify from "slugify";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

// import dayjs from "dayjs";
// import { Role } from "@dakthar/db";

interface FormattedAvailability {
  days: string[];
  startHour: string;
  endHour: string;
}

const TIME_INPUT_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

export const doctorRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const resp = await ctx.prisma.doctor.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
        metadata: {
          select: {
            location: true,
            consultationFee: true,
            followUpFee: true,
            showReportFee: true,
            followUpFeeValidity: true,
            showReportFeeValidity: true,
          },
        },
      },
    });

    const doctors = resp.map((doctor) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, userId, secondId, createdAt, updatedAt, ...rest } = doctor;
      return rest;
    });

    return { doctors };
  }),
  getDoctorListInfo: publicProcedure.query(async ({ ctx }) => {
    const resp = await ctx.prisma.doctor.findMany({
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        specialities: {
          where: {
            isPrimary: true,
          },
          select: {
            speciality: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const doctorListDetails = resp.map((doctor) => {
      return {
        name: doctor.user.name,
        image: doctor.user.image,
        slug: doctor.slug,
        speciality: doctor.specialities[0]?.speciality.name,
      };
    });

    return { doctorListDetails };
  }),
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.doctor.findUnique({
        where: {
          slug: input.slug,
        },
        include: {
          user: {
            select: {
              name: true,
              gender: true,
              image: true,
            },
          },
          metadata: {
            select: {
              location: true,
              consultationFee: true,
              followUpFee: true,
              showReportFee: true,
              followUpFeeValidity: true,
              showReportFeeValidity: true,
              availabilities: {
                select: {
                  id: true,
                  dayOfWeek: true,
                  startHour: true,
                  endHour: true,
                },
              },
            },
          },
          specialities: {
            where: {
              isPrimary: true,
            },
            select: {
              speciality: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
    }),
  getSlug: protectedProcedure.query(async ({ ctx }) => {
    const doctorUserId = ctx.user.id;

    const resp = await ctx.prisma.user.findUnique({
      where: {
        id: doctorUserId,
      },
      select: {
        doctor: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!resp?.doctor?.slug) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Doctor not found.",
      });
    }

    return resp.doctor.slug;
  }),
  getAvailableSlots: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const resp = await ctx.prisma.doctor.findUnique({
        where: {
          slug: input.slug,
        },
        select: {
          metadata: {
            select: {
              consultationFee: true,
              location: true,
              availabilities: {
                select: {
                  id: true,
                  dayOfWeek: true,
                  startHour: true,
                  endHour: true,
                },
              },
            },
          },
        },
      });

      return resp?.metadata ?? [];
    }),
  getAllDoctors: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "SUPER_ADMIN") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource.",
      });
    }

    const resp = await ctx.prisma.user.findMany({
      where: {
        role: "DOCTOR",
      },
      include: {
        doctor: {
          select: {
            slug: true,
            verified: true,
          },
        },
      },
    });

    const doctors = resp.map((doctor) => {
      return {
        id: doctor.id,
        name: doctor.name,
        phone: doctor.phone,
        email: doctor.email ?? "N/A",
        gender: doctor.gender,
        onboarding: doctor.onboarding,
        slug: doctor.doctor?.slug ?? "",
        verified: doctor.doctor?.verified ? "Yes" : "No",
      };
    });

    return { doctors };
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.number().nonnegative().int() }))
    .query(async ({ ctx, input }) => {
      const rawData = await ctx.prisma.doctor.findUnique({
        where: {
          id: input.id,
        },
        include: {
          user: {
            select: {
              name: true,
              gender: true,
              email: true,
              phone: true,
              onboarding: true,
            },
          },
          metadata: {
            select: {
              location: true,
              consultationFee: true,
              followUpFee: true,
              showReportFee: true,
              followUpFeeValidity: true,
              showReportFeeValidity: true,
              availabilities: {
                select: {
                  id: true,
                  dayOfWeek: true,
                  startHour: true,
                  endHour: true,
                },
              },
            },
          },
          specialities: {
            select: {
              isPrimary: true,
              speciality: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      if (!rawData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found.",
        });
      }

      const basicInfo = {
        id: rawData.id,
        name: rawData.user.name ?? "",
        email: rawData.user.email ?? "",
        phone: rawData.user.phone ?? "",
        gender: rawData.user.gender,
        bio: rawData.bio,
        verified: rawData.verified,
        onboarding: rawData.user.onboarding,
        specialities: rawData.specialities.map((speciality) => {
          return {
            name: speciality.speciality.name,
            slug: speciality.speciality.slug,
            isPrimary: speciality.isPrimary,
          };
        }),
      };

      const metadata = rawData.metadata.map((metadata) => {
        return {
          location: metadata.location,
          consultationFee: metadata.consultationFee,
          followUpFee: metadata.followUpFee,
          showReportFee: metadata.showReportFee,
          followUpFeeValidity: metadata.followUpFeeValidity,
          showReportFeeValidity: metadata.showReportFeeValidity,
          availabilities: metadata.availabilities.reduce<
            FormattedAvailability[]
          >((acc, availability) => {
            const existingAvailability = acc.find(
              (a) =>
                a.startHour === availability.startHour &&
                a.endHour === availability.endHour,
            );

            if (existingAvailability) {
              existingAvailability.days.push(availability.dayOfWeek);
            } else {
              acc.push({
                days: [availability.dayOfWeek],
                startHour: availability.startHour,
                endHour: availability.endHour,
              });
            }

            return acc;
          }, []),
        };
      });

      const data = {
        basicInfo,
        metadata,
        rawData,
      };
      return data;
    }),
  getLoggedinDrInfo: protectedProcedure
    .input(
      z.object({
        id: z.number()
      }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "DOCTOR") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized.",
        });
      }

      const res = await ctx.prisma.doctor.findUnique({
        where: {
          userId: input.id
        },
        select: {
          user: {
            select: {
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
            }
          }
        }
      })
      return res
    }),
  getSpecialities: protectedProcedure.query(async ({ ctx }) => {
    const resp = await ctx.prisma.speciality.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return resp;
  }),
  updateBioAndSpecialities: protectedProcedure
    .input(
      z.object({
        bio: z.string().min(1),
        primarySpeciality: z.number().nonnegative().int().nullable(),
        specialities: z.array(z.number().nonnegative().int()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        bio,
        specialities,
        primarySpeciality: _primarySpeciality,
      } = input;

      if (_primarySpeciality && !specialities.includes(_primarySpeciality)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Primary speciality must be one of the specialities.",
        });
      }

      const primarySpeciality = _primarySpeciality ?? specialities[0];

      if (!primarySpeciality) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Primary speciality must be one of the specialities.",
        });
      }

      const userInfo = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.user.id,
        },
        select: {
          name: true,
        },
      });

      if (!userInfo?.name) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        });
      }

      const slug = slugify(userInfo.name, { lower: true });

      const doctor = await ctx.prisma.doctor.upsert({
        where: {
          userId: ctx.user.id,
        },
        update: {
          bio,
          slug,
        },
        create: {
          bio,
          slug,
          user: {
            connect: {
              id: ctx.user.id,
            },
          },
        },
      });

      if (!doctor) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        });
      }

      const updatedSpecialities = await ctx.prisma.doctorSpeciality.createMany({
        data: specialities.map((speciality) => ({
          doctorId: doctor.id,
          specialityId: speciality,
          isPrimary: speciality === primarySpeciality,
        })),
        skipDuplicates: true,
      });

      if (!updatedSpecialities) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        });
      }

      return {
        success: true,
      };
    }),
  updateMetadata: protectedProcedure
    .input(
      z.object({
        location: z.string().min(1),
        days: z
          .array(z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]))
          .min(1),
        startTime: z.string().refine((value) => TIME_INPUT_REGEX.test(value), {
          message:
            "Invalid time format. Please use HH:MM format (e.g., 14:30).",
        }),
        endTime: z.string().refine((value) => TIME_INPUT_REGEX.test(value), {
          message:
            "Invalid time format. Please use HH:MM format (e.g., 14:30).",
        }),
        consultationFee: z.number().nonnegative().int().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { location, days, startTime, endTime, consultationFee } = input;

      const doctor = await ctx.prisma.doctor.findUnique({
        where: {
          userId: ctx.user.id,
        },
        select: {
          id: true,
        },
      });

      if (!doctor) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        });
      }

      const metadata = await ctx.prisma.doctorMetadata.create({
        data: {
          location,
          consultationFee,
          doctor: {
            connect: {
              id: doctor.id,
            },
          },
        },
      });

      if (!metadata) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        });
      }

      const availabilities = await ctx.prisma.doctorAvailability.createMany({
        data: days.map((day) => ({
          metadataId: metadata.id,
          doctorId: doctor.id,
          dayOfWeek: day,
          startHour: `${startTime}:00`,
          endHour: `${endTime}:00`,
        })),
        skipDuplicates: true,
      });

      if (!availabilities) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        });
      }

      const updateUser = await ctx.prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          onboarding: "COMPLETED",
        },
      });

      if (!updateUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        });
      }

      return {
        success: true,
      };
    }),
  updateProfilePictureById: protectedProcedure
    .input(
      z.object({
        id: z.number().nonnegative().int(),
        url: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, url } = input;

      const doctor = await ctx.prisma.doctor.findUnique({
        where: {
          id,
        },
      });

      if (!doctor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found.",
        });
      }

      const user = await ctx.prisma.user.update({
        where: {
          id,
        },
        data: {
          image: url,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        });
      }

      return {
        success: true,
      };
    }),
});
