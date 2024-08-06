import axios from 'axios';
import { env } from "~/env.mjs";
import { URL, URLSearchParams } from 'url';


interface AppointmentDetails {
    drName: string;
    date: string;
    time: string;
    fees: number;
    address: string;
}

export const processMsg = (details: AppointmentDetails) => {
    const msgTemplate = `Greetings from Dakthar.com!
Appointment Reminder:
Dr. ${details.drName}
${details.date}, ${details.time},
Fee: ${details.fees.toFixed(2)} Taka

${details.address}`;

    return msgTemplate;
}

export async function sendMsg(appintmentId: number, phoneNo: string, message: string) {
    const rawUrlStr = "http://api.boom-cast.com/boomcast/WebFramework/boomCastWebService/externalApiSendTextMessage.php";
    const baseUrl = new URL(rawUrlStr);

    const username = env.BOOMCAST_USERNAME;
    const password = env.BOOMCAST_PASSWORD;

    const params = new URLSearchParams();
    params.append("masking", "NOMASK");
    params.append("MsgType", "TEXT");
    params.append("userName", username);
    params.append("password", password);
    params.append("receiver", phoneNo);
    params.append("message", message);

    baseUrl.search = params.toString();
    const finalUrl = baseUrl.toString();

    try {
        const response = await axios.get(finalUrl);
        return { success: true, appintmentId, response: response.data as object };
    } catch (error) {
        console.error("Failed to fetch data", error);
        return { success: false, appintmentId, error };
    }
}

export const isInTimeRangeWithBuffer = (range: string, bufferHours: number, timeZone: string) => {
    const [startTimeStr,] = range.split(' - ');
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: timeZone }));

    if (!startTimeStr) {
        return false;
    }

    // Parse start and end times
    const startTime = parseTimeToTodayDate(startTimeStr, timeZone);

    if (!startTime) {
        return false;
    }

    // Adjust for buffer
    const startTimeWithBuffer = new Date(startTime.getTime() - bufferHours * 60 * 60 * 1000);
    return now >= startTimeWithBuffer;
}

export const parseTimeToTodayDate = (timeStr: string, timeZone: string) => {
    const [time, modifier] = timeStr.split(' ');

    if (!time) { return null; }

    const [hoursStr, minutes] = time.split(':');

    if (!hoursStr || !minutes) { return null; }

    let hours = parseInt(hoursStr, 10) + (modifier === 'PM' && hoursStr !== '12' ? 12 : 0);
    hours = hours % 24; // Convert 24 to 0 for midnight

    const date = new Date(new Date().toLocaleString('en-US', { timeZone: timeZone }));
    date.setHours(hours, parseInt(minutes, 10), 0, 0);

    return date;
}


