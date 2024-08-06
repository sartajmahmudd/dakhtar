import dayjs from "dayjs";

export const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  );
};

export const formatTime = (startHour: string, endHour: string) => {
  const startTime = dayjs(startHour, "HH:mm:ss").format("h:mm A");
  const endTime = dayjs(endHour, "HH:mm:ss").format("h:mm A");
  return `${startTime} - ${endTime}`;
};
