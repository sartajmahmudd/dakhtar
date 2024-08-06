import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  render,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

const baseUrl =
  "https://www.dakthar.com/_next/image?url=%2Fassets%2Fimages%2Flogo-long.png&w=256&q=75";

interface Props {
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  location: string;
  serialNo: string;
}

export const PostAppointmentCreation = (props: Props) => {
  const { patientName, date, time, location, serialNo } = props;
  return (
    <Html>
      <Head>
        <title>Appointment Booking Notification</title>
      </Head>
      <Preview>
        Your have a new appointment.
      </Preview>
      <Body>
        <Tailwind
          config={{
            theme: {
              colors: {
                primary: "#1877F2",
              },
              extend: {
                fontFamily: {
                  mon: ["Montserrat", "sans-serif"],
                },
              },
            },
          }}
        >
          <Container className="font-mon">
            <Section className="bg-primary text-center">
              <Img
                src={baseUrl}
                alt="dakthar.com"
                height={50}
                className="mx-auto py-2"
              />
            </Section>

            <Section>
              <Heading className="text-center text-2xl font-bold" as="h2">
                Appointment Booking Notification
              </Heading>
              <Text className="pt-8">Hello,</Text>
              <Text>
                There is a new appointment booking.
              </Text>
            </Section>
            <Section className="mt-4 font-bold">
              <Text>Patient: {patientName ?? "N/A"} </Text>
              <Text>Date: {date ?? "N/A"}</Text>
              <Text>Time: {time ?? "N/A"}</Text>
              <Text>Location: {location ?? "N/A"}</Text>
              <Text>Serial: {serialNo ?? "N/A"}</Text>
            </Section>
            <Section className="mt-4">
              <Text>Thank you</Text>
              <Text>Team Dakthar.com</Text>
            </Section>

            <Section
              className="mt-2 flex flex-col items-center justify-center
             rounded-lg bg-gray-100 p-4"
            >
              <Text>
                <Link href="ask@dakthar.com">ask@dakthar.com</Link> | Copyright
                &#169; {new Date().getFullYear()} All Rights Reserved
              </Text>
            </Section>
          </Container>
        </Tailwind>
      </Body>
    </Html>
  );
};

export const renderPostAppointmentCreation = (props: Props) => {
  return render(<PostAppointmentCreation {...props} />, { pretty: true });
};
