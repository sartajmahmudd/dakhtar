import sendgrid from "@sendgrid/mail";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { z } from "zod";

import type { Role } from "@dakthar/db";
import { AppointmentPurpose, AppointmentStatus } from "@dakthar/db";
import { renderPostAppointmentCreation } from "@dakthar/emails/src/custom";
import { appointmentDetailsSchema, userDetailsSchema } from "@dakthar/shared";

import { env } from "../../env.mjs";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc";
import { admin } from "@dakthar/firekit-server";

dayjs.extend(utc);

sendgrid.setApiKey(env.SENDGRID_API_KEY);

export const appointmentRouter = createTRPCRouter({
  createAppointment: publicProcedure
    .input(
      z.object({
        appointmentDetails: appointmentDetailsSchema,
        userDetails: userDetailsSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, email, phone, dateOfBirth, gender } = input.userDetails;

      let user = await ctx.prisma.user.findFirst({
        where: {
          phone: phone,
        },
        select: {
          patient: true,
        },
      });

      if (!user) {
        user = await ctx.prisma.user.create({
          data: {
            name,
            phone,
            gender,
            email: email ?? null,
            dateOfBirth: dateOfBirth ?? null,
            role: "PATIENT",
            patient: {
              create: {},
            },
          },
          select: {
            patient: true,
          },
        });
      }

      const patientId = user?.patient?.id;

      if (!patientId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Something went wrong. Missing patient id. Please try again later.",
        });
      }

      const doctor = await ctx.prisma.doctor.findUnique({
        where: {
          slug: input.appointmentDetails.doctorSlug,
        },
        select: {
          id: true,
          organizations: {
            select: {
              organizationId: true
            },
          },
          user: {
            select: {
              name: true,
              email: true
            },
          }
        },
      });

      if (!doctor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found.",
        });
      }

      const appointmentDate = input.appointmentDetails.date;
      const appointmentDateWithMidnightTime = dayjs.utc(appointmentDate).startOf('day');

      const formattedAppointmentDate =
        `${appointmentDateWithMidnightTime
          .year()}-${String(appointmentDateWithMidnightTime
            .month() + 1)
            .padStart(2, '0')}-${String(appointmentDateWithMidnightTime
              .date())
              .padStart(2, '0')}T00:00:00Z`;

      const location =
        input.appointmentDetails.type === "IN_PERSON"
          ? input.appointmentDetails.location
          : null;

      const inputDate = dayjs.utc(formattedAppointmentDate);
      const startDate = inputDate.startOf("day").toISOString();
      const endDate = inputDate.endOf("day").toISOString();

      const lastAppointment = await ctx.prisma.appointment.findFirst({
        where: {
          doctorId: doctor.id,
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
        orderBy: {
          serialNo: "desc",
        },
        select: {
          serialNo: true,
        }
      });

      let newSerialNo = 1;
      if (lastAppointment) {
        newSerialNo = lastAppointment.serialNo + 1;
      }

      const organizationId = doctor?.organizations[0]?.organizationId ?? null;

      const commonData = {
        location,
        serialNo: newSerialNo,
        fee: input.appointmentDetails.fee,
        date: formattedAppointmentDate,
        time: input.appointmentDetails.time,
        type: input.appointmentDetails.type,
        doctor: { connect: { id: doctor.id } },
        patient: { connect: { id: patientId } },
      }

      const data =
        organizationId ?
          {
            ...commonData,
            organization: { connect: { id: organizationId } }
          } :
          { ...commonData }

      const appointment = await ctx.prisma.appointment.create({
        data: data,
      });

      const emailTemplate = renderPostAppointmentCreation({
        doctorName: `${doctor.user.name ?? "N/A"}`,
        patientName: `${name ?? "N/A"}`,
        date: dayjs(input.appointmentDetails.date).format("DD/MM/YYYY"),
        time: input.appointmentDetails.time,
        location: input.appointmentDetails.location ?? "N/A",
        serialNo: appointment.serialNo.toString(),
      });

      const baseEmailConfigs = {
        from: "Dakthar.com <info@dakthar.com>",
        bcc: ["ask@dakthar.com"],
        reply_to: "ask@dakthar.com",
        subject: "Appointment Booking Notification",
        html: emailTemplate,
      };

      const emailConfigs = email
        ? { ...baseEmailConfigs, to: `${doctor.user.email}` }
        : { ...baseEmailConfigs, to: "info@dakthar.com" };

      void sendgrid.send(emailConfigs);

      return { appointment };
    }),
  createAppointmentFromAdmin: protectedProcedure
    .input(
      z.object({
        appointmentDetails: appointmentDetailsSchema,
        userDetails: userDetailsSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, email, phone, dateOfBirth, gender } = input.userDetails;
      const role = ctx.user.role;

      const allowedRoles = ["ADMIN", "DOCTOR", "SUPER_ADMIN"].includes(role);

      if (!allowedRoles) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to perform this action.",
        });
      }

      let user = await ctx.prisma.user.findFirst({
        where: {
          phone: phone,
        },
        select: {
          patient: true,
        },
      });

      if (!user) {
        user = await ctx.prisma.user.create({
          data: {
            name,
            phone,
            gender,
            email: email ?? null,
            dateOfBirth: dateOfBirth ?? null,
            role: "PATIENT",
            patient: {
              create: {},
            },
          },
          select: {
            patient: true,
          },
        });
      }

      const patientId = user?.patient?.id;

      if (!patientId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Something went wrong. Missing patient id. Please try again later.",
        });
      }

      const doctor = await ctx.prisma.doctor.findUnique({
        where: {
          slug: input.appointmentDetails.doctorSlug,
        },
        select: {
          id: true,
          organizations: {
            select: {
              organizationId: true,
            },
            // user: {
            //   select: {
            //     name: true,
            //   },
            // }
          }
        },
      });

      if (!doctor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found.",
        });
      }

      const appointmentDate = input.appointmentDetails.date;
      const appointmentDateWithMidnightTime = dayjs.utc(appointmentDate).startOf('day');
      const formattedAppointmentDate =
        `${appointmentDateWithMidnightTime
          .year()}-${String(appointmentDateWithMidnightTime
            .month() + 1)
            .padStart(2, '0')}-${String(appointmentDateWithMidnightTime
              .date())
              .padStart(2, '0')}T00:00:00Z`;

      const location =
        input.appointmentDetails.type === "IN_PERSON"
          ? input.appointmentDetails.location
          : null;

      const inputDate = dayjs.utc(formattedAppointmentDate);
      const startDate = inputDate.startOf("day").toISOString();
      const endDate = inputDate.endOf("day").toISOString();

      const lastAppointment = await ctx.prisma.appointment.findFirst({
        where: {
          doctorId: doctor.id,
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
        orderBy: {
          serialNo: "desc",
        },
        select: {
          serialNo: true,
        }
      });

      let newSerialNo = 1;
      if (lastAppointment) {
        newSerialNo = lastAppointment.serialNo + 1;
      }

      const organizationId = doctor?.organizations[0]?.organizationId ?? null;

      const commonData = {
        location,
        serialNo: newSerialNo,
        fee: input.appointmentDetails.fee,
        date: formattedAppointmentDate,
        time: input.appointmentDetails.time,
        type: input.appointmentDetails.type,
        bookedBy: role,
        doctor: { connect: { id: doctor.id } },
        patient: { connect: { id: patientId } },
      }

      const data =
        organizationId ?
          {
            ...commonData,
            organization: { connect: { id: organizationId } }
          } :
          { ...commonData }

      const appointment = await ctx.prisma.appointment.create({
        data: data,
      });

      // const emailTemplate = renderPostAppointmentCreation({
      //   doctorName: `${doctor.user.name ?? "N/A"}`,
      //   patientName: `${name ?? "N/A"}`,
      //   date: dayjs(input.appointmentDetails.date).format("DD/MM/YYYY"),
      //   time: input.appointmentDetails.time,
      //   location: input.appointmentDetails.location ?? "N/A",
      //   serialNo: appointment.serialNo.toString(),
      // });

      // const baseEmailConfigs = {
      //   from: "Dakthar.com <info@dakthar.com>",
      //   bcc: ["ask@dakthar.com"],
      //   reply_to: "ask@dakthar.com",
      //   subject: "Appointment Booking Confirmation",
      //   html: emailTemplate,
      // };

      // const emailConfigs = email
      //   ? { ...baseEmailConfigs, to: email }
      //   : { ...baseEmailConfigs, to: "info@dakthar.com" };

      // void sendgrid.send(emailConfigs);

      return { appointment };
    }),
  getAllAppointments: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "SUPER_ADMIN") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource.",
      });
    }

    const resp = await ctx.prisma.appointment.findMany({
      include: {
        doctor: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        patient: {
          select: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const appointments = resp.map((appointment) => {
      return {
        id: appointment.id,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctor.user.name ?? "N/A",
        patientId: appointment.patientId,
        patientName: appointment.patient.user.name ?? "N/A",
        patientPhone: appointment.patient.user.phone ?? "N/A",
        serialNo: appointment.serialNo,
        type: appointment.type,
        status: appointment.status,
        purpose: appointment.purpose,
        fee: appointment.fee,
        date: appointment.date.toDateString(),
        time: appointment.time,
        location: appointment.location ?? "N/A",
      };
    });

    return { appointments };
  }),

  getAppointments: protectedProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        limit: z.number().int().nonnegative().min(1).default(10),
        skip: z.number().int().nonnegative().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const id = Number(ctx.user.id);

      const user = await ctx.prisma.user.findFirst({
        where: {
          OR: [
            {
              id: id,
              role: "SUPER_ADMIN",
            },
            {
              id: id,
              role: "DOCTOR",
              doctor: {
                slug: input.slug,
              },
            },
            {
              id: id,
              role: "ADMIN",
              admin: {
                doctors: {
                  some: {
                    doctor: {
                      slug: input.slug,
                    },
                  },
                },
              },
            },
            {
              id: id,
              role: "ADMIN",
              admin: {
                organizations: {
                  some: {
                    organization: {
                      doctors: {
                        some: {
                          doctor: {
                            slug: input.slug,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          // admin: {
          //   select: {
          //     id: true,
          //     organizations: {
          //       select: {
          //         id: true,
          //       },
          //     }
          //   },
          // },
          // doctor: {
          //   select: {
          //     id: true,
          //     organizations: {
          //       select: {
          //         id: true,
          //       },
          //     }
          //   },
          // },
        }
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to access this resource.",
        });
      }

      const resp = await ctx.prisma.appointment.findMany({
        where: {
          OR: [
            {
              doctor: {
                slug: input.slug,
              },
            },
            {
              organization: {
                doctors: {
                  some: {
                    doctor: {
                      slug: input.slug,
                    },
                  },
                },
              }
            }
          ]
        },
        include: {
          doctor: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          patient: {
            select: {
              user: {
                select: {
                  name: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        take: input.limit,
        skip: input.skip,
      });

      const appointments = resp.map((appointment) => {
        return {
          id: appointment.id,
          doctorId: appointment.doctorId,
          doctorName: `${appointment.doctor.user.name}`,
          patientId: appointment.patientId,
          patientName: `${appointment.patient.user.name}`,
          patientPhone: appointment.patient.user.phone ?? "N/A",
          serialNo: appointment.serialNo,
          type: appointment.type,
          status: appointment.status,
          purpose: appointment.purpose,
          fee: appointment.fee,
          date: appointment.date.toUTCString(),
          time: appointment.time,
          location: appointment.location ?? "N/A",
        };
      });

      return { appointments };
    }),
  getMyAppointmentsForPatient: protectedProcedure.query(async ({ ctx }) => {
    const id = Number(ctx.user.id);
    const userRole = ctx.user.role;

    const userSelectedFields = {
      name: true,
      image: true,
      gender: true,
    };

    if (userRole !== "PATIENT") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource.",
      });
    }

    const appointments = await ctx.prisma.appointment.findMany({
      where: {
        patient: {
          userId: id,
        },
      },
      include: {
        doctor: {
          select: {
            user: {
              select: userSelectedFields,
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
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const finalAppointments = appointments?.map((appointment) => {
      return {
        id: appointment.id,
        doctorId: appointment.doctorId,
        doctorName: `${appointment.doctor.user.name ?? "N/A"}`,
        doctorGender: appointment.doctor.user.gender,
        doctorImage: appointment.doctor.user.image,
        serialNo: appointment.serialNo,
        type: appointment.type,
        status: appointment.status,
        purpose: appointment.purpose,
        speciality: appointment.doctor.specialities[0]?.speciality.name,
        // fee: appointment.fee,
        date: appointment.date.toUTCString(),
        time: appointment.time,
        location: appointment.location ?? "N/A",
      };
    });

    return { appointments: finalAppointments ?? [] };
  }),
  getMyAppointmentsForDoctor: protectedProcedure.query(async ({ ctx }) => {
    const id = Number(ctx.user.id);
    const userRole = ctx.user.role;

    const userSelectedFields = {
      name: true,
      image: true,
      gender: true,
    };

    if (userRole !== "DOCTOR") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource.",
      });
    }

    const appointments = await ctx.prisma.appointment.findMany({
      where: {
        doctor: {
          userId: id,
        },
      },
      include: {
        patient: {
          select: {
            user: {
              select: userSelectedFields,
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const finalAppointments = appointments?.map((appointment) => {
      return {
        id: appointment.id,
        patientId: appointment.patientId,
        patientName: `${appointment.patient.user.name ?? "N/A"}`,
        patientGender: appointment.patient.user.gender,
        patientImage: appointment.patient.user.image,
        serialNo: appointment.serialNo,
        type: appointment.type,
        status: appointment.status,
        purpose: appointment.purpose,
        // fee: appointment.fee,
        date: appointment.date.toUTCString(),
        time: appointment.time,
        location: appointment.location ?? "N/A",
      };
    });

    return { appointments: finalAppointments ?? [] };
  }),
  getMyAppointmentsForDoctorById: protectedProcedure
    .input(
      z.object({
        doctorId: z
          .number()
          .int()
          .nonnegative()
          .nullable()
          .refine((val) => val !== null, {
            message: "doctorId is must be a number",
          }),
      }),
    )
    .query(async ({ ctx, input }) => {
      // const userId = Number(ctx.user.id);
      const doctorId = input.doctorId;
      const userRole = ctx.user.role;

      const userSelectedFields = {
        name: true,
        image: true,
        gender: true,
      };

      if (userRole !== "ADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to access this resource.",
        });
      }

      if (!doctorId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "doctorId is required",
        });
      }

      const appointments = await ctx.prisma.appointment.findMany({
        where: {
          doctor: {
            id: doctorId,
          },
        },
        include: {
          patient: {
            select: {
              user: {
                select: userSelectedFields,
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      const finalAppointments = appointments?.map((appointment) => {
        return {
          id: appointment.id,
          patientId: appointment.patientId,
          patientName: `${appointment.patient.user.name ?? "N/A"}`,
          patientGender: appointment.patient.user.gender,
          patientImage: appointment.patient.user.image,
          serialNo: appointment.serialNo,
          type: appointment.type,
          status: appointment.status,
          purpose: appointment.purpose,
          // fee: appointment.fee,
          date: appointment.date.toUTCString(),
          time: appointment.time,
          location: appointment.location ?? "N/A",
        };
      });

      return { appointments: finalAppointments ?? [] };
    }),
  getAdminDoctorList: protectedProcedure.query(async ({ ctx }) => {
    const id = Number(ctx.user.id);
    const userRole = ctx.user.role;

    if (userRole !== "ADMIN") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource.",
      });
    }

    const adminOfDoctors = await ctx.prisma.admin.findMany({
      where: {
        userId: id,
      },
      include: {
        doctors: {
          include: {
            doctor: {
              select: {
                slug: true,
                user: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        organizations: {
          select: {
            organization: {
              select: {
                doctors: {
                  include: {
                    doctor: {
                      select: {
                        slug: true,
                        user: {
                          select: {
                            name: true,
                            image: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!adminOfDoctors) {
      return { list: [] };
    }

    interface SelectedDoctorInfo {
      id: number;
      name: string | null;
      image: string | null;
      slug: string;
    }

    const allDoctorsIdsOfAdminSet = new Map<number, SelectedDoctorInfo>();

    adminOfDoctors.forEach((admin) => {
      admin.doctors.forEach((doctor) => {
        const selectedDoctorInfo: SelectedDoctorInfo = {
          id: doctor.doctorId,
          name: doctor.doctor.user.name,
          image: doctor.doctor.user.image,
          slug: doctor.doctor.slug,
        };

        allDoctorsIdsOfAdminSet.set(doctor.doctorId, selectedDoctorInfo);
      });

      admin.organizations.forEach((org) => {
        org.organization.doctors.forEach((doctor) => {
          const selectedDoctorInfo: SelectedDoctorInfo = {
            id: doctor.doctorId,
            name: doctor.doctor.user.name,
            image: doctor.doctor.user.image,
            slug: doctor.doctor.slug,
          };

          allDoctorsIdsOfAdminSet.set(doctor.doctorId, selectedDoctorInfo);
        });
      });
    });

    const uniqueDoctorIds = [...allDoctorsIdsOfAdminSet.values()];

    return { list: uniqueDoctorIds };
  }),
  // getMyAppointmentsForAdmin: protectedProcedure.query(async ({ ctx }) => {
  //   const id = Number(ctx.user.id);
  //   const userRole = ctx.user.role;

  //   const userSelectedFields = {
  //     name: true,
  //     image: true,
  //     gender: true,
  //   };

  //   if (userRole === "DOCTOR") {
  //     throw new TRPCError({
  //       code: "UNAUTHORIZED",
  //       message: "You are not authorized to access this resource.",
  //     });
  //   }

  //   let appointments = null;

  //   if (userRole === "PATIENT") {
  //     appointments = await ctx.prisma.appointment.findMany({
  //       where: {
  //         patient: {
  //           userId: id,
  //         },
  //       },
  //       include: {
  //         doctor: {
  //           select: {
  //             user: {
  //               select: userSelectedFields,
  //             },
  //           },
  //         },
  //       },
  //       orderBy: {
  //         updatedAt: "desc",
  //       },
  //     });
  //   }

  //   if (userRole === "ADMIN") {
  //     const adminOfDoctors = await ctx.prisma.admin.findMany({
  //       where: {
  //         userId: id,
  //       },
  //       include: {
  //         doctors: true,
  //         organizations: {
  //           select: {
  //             organization: {
  //               select: {
  //                 doctors: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //       orderBy: {
  //         updatedAt: "desc",
  //       },
  //     });

  //     if (!adminOfDoctors) {
  //       return { appointments: [] };
  //     }

  //     const allDoctorsIdsOfAdminSet = new Set<number>();

  //     adminOfDoctors.forEach((admin) => {
  //       admin.doctors.forEach((doctor) => {
  //         allDoctorsIdsOfAdminSet.add(doctor.doctorId);
  //       });

  //       admin.organizations.forEach((org) => {
  //         org.organization.doctors.forEach((doctor) => {
  //           allDoctorsIdsOfAdminSet.add(doctor.doctorId);
  //         });
  //       });
  //     });

  //     const uniqueDoctorIds = [...allDoctorsIdsOfAdminSet];

  //     appointments = await ctx.prisma.appointment.findMany({
  //       where: {
  //         doctorId: {
  //           in: uniqueDoctorIds,
  //         },
  //       },
  //       include: {
  //         doctor: {
  //           select: {
  //             user: {
  //               select: userSelectedFields,
  //             },
  //           },
  //         },
  //       },
  //       orderBy: {
  //         updatedAt: "desc",
  //       },
  //     });
  //   }

  //   const finalAppointments = appointments?.map((appointment) => {
  //     return {
  //       id: appointment.id,
  //       doctorId: appointment.doctorId,
  //       doctorName: `${appointment.doctor.user.name ?? "N/A"}`,
  //       doctorGender: appointment.doctor.user.gender,
  //       doctorImage: appointment.doctor.user.image,
  //       serialNo: appointment.serialNo,
  //       type: appointment.type,
  //       status: appointment.status,
  //       purpose: appointment.purpose,
  //       // fee: appointment.fee,
  //       date: appointment.date.toDateString(),
  //       time: appointment.time,
  //       location: appointment.location ?? "N/A",
  //     };
  //   });

  //   return { appointments: finalAppointments ?? [] };
  // }),

  getAppointment: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.password !== "MyAdminPassword") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to access this resource.",
        });
      }

      const resp = await ctx.prisma.appointment.findMany({
        where: {
          doctor: {
            slug: input.slug,
          },
        },
        include: {
          doctor: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          patient: {
            select: {
              user: {
                select: {
                  name: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      const appointments = resp.map((appointment) => {
        return {
          id: appointment.id,
          doctorId: appointment.doctorId,
          doctorName: `${appointment.doctor.user.name}`,
          patientId: appointment.patientId,
          patientName: `${appointment.patient.user.name}`,
          patientPhone: appointment.patient.user.phone,
          serialNo: appointment.serialNo,
          type: appointment.type,
          status: appointment.status,
          purpose: appointment.purpose,
          fee: appointment.fee,
          date: appointment.date.toDateString(),
          time: appointment.time,
          location: appointment.location ?? "N/A",
        };
      });

      return { appointments };
    }),
  getAppointmentStatistics: protectedProcedure.query(async ({ ctx }) => {
    if (ctx?.user?.role !== "SUPER_ADMIN") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource.",
      });
    }

    const oneYearAgo = dayjs().subtract(1, "year").toDate();

    const appointments = await ctx.prisma.appointment.findMany({
      where: {
        createdAt: {
          gte: oneYearAgo,
        },
      },
      select: {
        bookedBy: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    type RoleCount = Record<Role, number>;

    const roleMapByMonth = new Map<string, RoleCount>();
    const defaultValue: Record<Role, 0> = {
      ANONYMOUS: 0,
      PATIENT: 0,
      DOCTOR: 0,
      ADMIN: 0,
      SUPER_ADMIN: 0,
    };

    appointments.forEach((appointment) => {
      const role = appointment.bookedBy;
      const date = appointment.createdAt;
      const month = dayjs(date).format("MMM");

      const roleMapByMonthValue = roleMapByMonth.get(month);
      const count = roleMapByMonthValue?.[role] ?? 0;

      if (roleMapByMonthValue) {
        roleMapByMonth.set(month, {
          ...roleMapByMonthValue,
          [role]: count + 1,
        });
      } else {
        roleMapByMonth.set(month, {
          ...defaultValue,
          [role]: count + 1,
        });
      }
    });

    const data = Array.from(roleMapByMonth.entries()).map(
      ([month, roleToCountMap]) => {
        return {
          month,
          ...roleToCountMap,
        };
      },
    );

    const allMonths = data.map((item) => {
      return item.month;
    });

    const patientBookingCounts = data.map((item) => {
      return item.PATIENT;
    });

    const adminBookingCounts = data.map((item) => {
      return item.ADMIN + item.SUPER_ADMIN + item.DOCTOR;
    });

    return { allMonths, patientBookingCounts, adminBookingCounts };
  }),
  getDailyAppointmentStatistics: protectedProcedure.query(async ({ ctx }) => {
    if (ctx?.user?.role !== "SUPER_ADMIN") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource.",
      });
    }

    const oneMonthAgo = dayjs().subtract(1, "month").toDate();
    const today = dayjs().endOf('day').toDate();

    const appointments = await ctx.prisma.appointment.findMany({
      where: {
        createdAt: {
          gte: oneMonthAgo,
          lte: today,
        },
      },
      select: {
        bookedBy: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    type RoleCount = Record<Role, number>;

    const roleMapByDay = new Map<string, RoleCount>();
    const defaultValue: Record<Role, 0> = {
      ANONYMOUS: 0,
      PATIENT: 0,
      DOCTOR: 0,
      ADMIN: 0,
      SUPER_ADMIN: 0,
    };

    appointments.forEach((appointment) => {
      const role = appointment.bookedBy;
      const date = appointment.createdAt;
      const day = dayjs(date).format("MMM DD");

      const roleMapByDayValue = roleMapByDay.get(day);
      const count = roleMapByDayValue?.[role] ?? 0;

      if (roleMapByDayValue) {
        roleMapByDay.set(day, {
          ...roleMapByDayValue,
          [role]: count + 1,
        });
      } else {
        roleMapByDay.set(day, {
          ...defaultValue,
          [role]: count + 1,
        });
      }
    });
    const data = Array.from(roleMapByDay.entries()).map(
      ([day, roleToCountMap]) => {
        return {
          day,
          ...roleToCountMap,
        };
      },
    );

    const allDays = data.map((item) => {
      return item.day;
    });

    const patientBookingCounts = data.map((item) => {
      return item.PATIENT;
    });

    const adminBookingCounts = data.map((item) => {
      return item.ADMIN + item.SUPER_ADMIN + item.DOCTOR;
    });

    return { allDays, patientBookingCounts, adminBookingCounts };
  }),
  updateAppointment: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.nativeEnum(AppointmentStatus),
        purpose: z.nativeEnum(AppointmentPurpose),
        serialNo: z.number(),
        fee: z.number(),
        date: z
          .string()
          .min(1)
          .refine((val) => dayjs(val).isValid(), {
            message: "Invalid date",
          }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx?.user?.role === "PATIENT") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to access this resource.",
        });
      }

      console.log(input);

      const appointment = await ctx.prisma.appointment.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
          purpose: input.purpose,
          serialNo: input.serialNo,
          fee: input.fee,
          date: input.date,
        },
      });

      return { message: "Appointment updated successfully.", appointment };
    }),
  getAppointmentById: protectedProcedure
    .input(
      z.object({
        id: z.number().int().nonnegative(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role === "PATIENT") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized.",
        });
      }

      const resp = await ctx.prisma.appointment.findUnique({
        where: {
          id: input.id,
        },
        include: {
          doctor: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          patient: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      return resp;
    }),
  createPrescription: protectedProcedure
    .input(
      z.object({
        appointmentId: z.number(),
        patientId: z.number(),
        doctorId: z.number(),
        complaint: z.string().min(1),
        diagnosis: z.string().min(1).optional(),
        advice: z.string().min(1).optional(),
        followUp: z.string().min(1).optional(),
        medicine: z
          .array(
            z.object({
              name: z.string().min(1),
              dosage: z.string().min(1),
              remarks: z.string().min(1),
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

      const commonDataPoints = {
        appointmentId: input.appointmentId,
        patientId: input.patientId,
        doctorId: input.doctorId,
        complaint: input.complaint,
        diagnosis: input.diagnosis,
        advice: input.advice,
        followUp: input.followUp ? new Date(input.followUp) : null,
      };

      if (input.medicine && input.medicine.length > 0) {
        await ctx.prisma.prescription.create({
          data: {
            ...commonDataPoints,
            medicine: {
              createMany: {
                data: input.medicine,
              },
            },
          },
        });
      } else {
        await ctx.prisma.prescription.create({
          data: {
            ...commonDataPoints,
          },
        });
      }

      return { message: "Prescription created successfully.", success: true };
    }),
  getAppointmentsByPatientId: protectedProcedure.input(z.object({
    id: z.number()
  })).query(async ({ ctx, input }) => {
    const res = await ctx.prisma.appointment.findMany({
      where: {
        patientId: input.id,
        // status: "COMPLETED",
        prescription: {
          isNot: null,
        }
      },
      take: 10,
      orderBy: {
        date: "desc"
      },
      select: {
        id: true,
        date: true,
        purpose: true,
        type: true,
        time: true,
        prescription: {
          select: {
            id: true
          }
        },
        patient: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                gender: true
              }
            }
          }
        },
        doctor: {
          select: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })
    return { appointments: res }
  }),
  getPrescriptionByAppointmentId: protectedProcedure.input(z.object({
    id: z.number()
  })).query(async ({ ctx, input }) => {
    const res = await ctx.prisma.appointment.findMany({
      where: {
        id: input.id
      },
      select: {
        doctor: {
          select: {
            qualifications: {
              select: {
                id: true,
                name: true,
                institute: true,
                year: true
              }
            },
            metadata: {
              select: {
                location: true
              }
            },
            specialities: {
              select: {
                speciality: {
                  select: {
                    name: true
                  }
                }
              }
            },
            user: {
              select: {
                name: true,
                gender: true,
                email: true,
                image: true
              }
            }
          }
        },
        prescription: {
          select: {
            id: true,
            advice: true,
            complaint: true,
            findings: true,
            diagnosis: true,
            followUp: true,
            medicine: true,
            visitSummary: true
          }
        }
      }
    })
    return { prescription: res }
  }),
  incrementSerialNo: protectedProcedure.input(
    z.object({
      slug: z.string().min(1)
    })).mutation(async ({ input }) => {

      const dbRef = admin().firestore().doc(`serials/${input.slug}`)
      await dbRef.set({
        position: admin().firestore.FieldValue.increment(1),
        timestamp: admin().firestore.FieldValue.serverTimestamp(), // Uses server's timestamp
        live: true,
      }, { merge: true })

      return {
        success: true
      }
    }),
  decrementSerialNo: protectedProcedure.input(
    z.object({
      currentSerial: z.number().int().positive().default(0),
      slug: z.string().min(1)
    })).mutation(async ({ input }) => {

      if (input.currentSerial === 0) {
        return {
          success: true
        }
      }

      const dbRef = admin().firestore().doc(`serials/${input.slug}`)
      await dbRef.set({
        position: admin().firestore.FieldValue.increment(-1),
        timestamp: admin().firestore.FieldValue.serverTimestamp(), // Uses server's timestamp
        live: true,
      }, { merge: true })

      return {
        success: true
      }
    }),
  resetSerialNo: protectedProcedure.input(
    z.object({
      slug: z.string().min(1)
    })).mutation(async ({ input }) => {

      const dbRef = admin().firestore().doc(`serials/${input.slug}`)
      await dbRef.set({
        position: 0,
        timestamp: admin().firestore.FieldValue.serverTimestamp(), // Uses server's timestamp
        live: false,
      }, { merge: true })

      return {
        success: true
      }
    })
});
