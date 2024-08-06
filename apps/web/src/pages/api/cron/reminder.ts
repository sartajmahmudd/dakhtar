import { prisma } from "@dakthar/db";
import type { NextApiRequest, NextApiResponse } from 'next';
import pLimit from 'p-limit';
import dayjs from 'dayjs';
import { isInTimeRangeWithBuffer, processMsg, sendMsg } from "~/utils/cron";
const limit = pLimit(2);



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  const appintments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: start,
        lte: end
      },
      notified: false
    },
    include: {
      patient: {
        include: {
          user: true
        }
      },
      doctor: {
        include: {
          user: true
        }
      },
    }
  })


  const p = []

  for (const appointment of appintments) {
    const patientPhoneNo = appointment.patient.user.phone
    const drName = appointment.doctor.user.name
    const location = appointment.location
    const startTime = appointment.time.split(' - ')[0]
    if (!drName || !location || !patientPhoneNo || !startTime) {
      continue
    }


    isInTimeRangeWithBuffer(appointment.time, 2, 'Asia/Dhaka')


    const details = {
      drName,
      time: startTime,
      fees: appointment.fee,
      address: location,
      date: dayjs(appointment.date).format('DD MMM YYYY'),
    }

    const message = processMsg(details)

    p.push(
      limit(() => sendMsg(appointment.id, patientPhoneNo, message))
    )
  }

  const result = await Promise.allSettled(p)

  const ids = []

  for (const r of result) {
    if (r.status === "rejected") {
      console.error("Failed to send msg", r.reason);
    }
    if (r.status === "fulfilled") {
      const { success, appintmentId } = r.value;
      if (success) {
        ids.push(appintmentId)
      }
    }

  }

  let final = null

  if (ids.length > 0) {
    final = await prisma.appointment.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        notified: true
      }
    })
  }

  res.status(200).json({ resp: final })
}




