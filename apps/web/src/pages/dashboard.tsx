import React from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  scales,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/utils/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  scales,
  Title,
  Tooltip,
  Legend,
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Monthly Appointment Statistics",
    },
  },
};

export const optionsDaily = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Daily Appointment Statistics",
    },
  },
  scales: {
    y: {
      min: 0,
      max: 50,
      ticks: {
        count: 10,
        stepSize: 5,
      },
    },
  }
};

export function AppointmentStatistics() {
  const stats = api.appointment.getAppointmentStatistics.useQuery(undefined, {
    onSuccess(data) {
      console.log(data);
    },
  });

  if (stats.isLoading) {
    return <div>Loading...</div>;
  }

  if (stats.isError) {
    return <div>Error</div>;
  }

  const labels = stats.data.allMonths;

  const data = {
    labels,
    datasets: [
      {
        label: "Booked By Patient",
        data: stats.data.patientBookingCounts,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Booked By Admin",
        data: stats.data.adminBookingCounts,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <div>
      <Line options={options} data={data} />

      {/* // ! THIS CODE IS BUGGY. GETTING HYDRATION ERROR HERE */}
      <div className="mt-8 w-3/4 overflow-x-auto lg:w-2/3">
        <Table className="leading-[2px]">
          <TableHeader>
            <TableRow className="border-none">
              <TableHead className="text-black">Month</TableHead>
              <TableHead className="text-black">Patient</TableHead>
              <TableHead className="text-black">Admin</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {labels.map((label, idx) => {
              return (
                <TableRow key={`${label}-${idx}`} className="border-none">
                  <TableCell>
                    {label}
                  </TableCell>
                  <TableCell>
                    {stats.data.patientBookingCounts[idx]}
                  </TableCell>
                  <TableCell>
                    {stats.data.adminBookingCounts[idx]}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function DailyAppointmentStatistics() {
  const stats = api.appointment.getDailyAppointmentStatistics.useQuery(undefined, {
    onSuccess(data) {
      console.log("DailyAppointmentStatistics", data);
    },
  });

  if (stats.isLoading) {
    return <div>Loading...</div>;
  }

  if (stats.isError) {
    return <div>Error</div>;
  }

  const labels = stats.data.allDays;

  const data = {
    labels,
    datasets: [
      {
        label: "Booked By Patient",
        data: stats.data.patientBookingCounts,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Booked By Admin",
        data: stats.data.adminBookingCounts,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <div>
      <Line options={optionsDaily} data={data} />

      {/* // ! THIS CODE IS BUGGY. GETTING HYDRATION ERROR HERE */}
      <div className="mt-8 w-3/4 overflow-x-auto lg:w-2/3">
        <Table className="leading-[2px]">
          <TableHeader>
            <TableRow className="border-none">
              <TableHead className="text-black">Day</TableHead>
              <TableHead className="text-black">Patient</TableHead>
              <TableHead className="text-black">Admin</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {labels.map((label, idx) => {
              return (
                <TableRow key={`${label}-${idx}`} className="border-none">
                  <TableCell>
                    {label}
                  </TableCell>
                  <TableCell>
                    {stats.data.patientBookingCounts[idx]}
                  </TableCell>
                  <TableCell>
                    {stats.data.adminBookingCounts[idx]}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

const Dashboard = () => {
  return (
    <div>
      <title>Dashboard</title>
      <div className="mx-[20px] mb-10 mt-5 lg:mx-48 lg:mt-10">
        <AppointmentStatistics />
      </div>
      <div className="mx-[20px] mb-10 mt-5 lg:mx-48 lg:mt-10">
        <DailyAppointmentStatistics />
      </div>
    </div>
  );
};

export default Dashboard;
