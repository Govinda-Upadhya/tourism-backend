// workers/emailWorker.ts
import { Worker } from "bullmq";
import { redisConnection } from "../lib";
import { prismaClient, transporterMain } from "../lib";

new Worker(
  "email-queue",
  async (job) => {
    const { bookingId } = job.data;

    const booking = await prismaClient.bookings.findUnique({
      where: { id: bookingId },
    });

    if (!booking) return;

    await transporterMain.sendMail({
      from: process.env.APP_EMAIL,
      to: booking?.email,
      subject: "successfully booked the package",
      text: `Hello ${booking?.fullName} your booking for our ${booking?.packagename} has been successful. Here are the booking details.
          BookingId:${booking?.id}
          Booking Date:${booking?.booking_date}
          Arrival Date:${booking?.arrival_date}
          Departure Date:${booking?.departure_date}
          vehicle: ${booking?.vehicle}
          payment: ${booking?.total_amount}
          For further questions please contact the owner ${process.env.OWNER_EMAIL}
          We graciously welcome you to the kingdom of Bhutan.`,
    });
    await transporterMain.sendMail({
      from: process.env.APP_EMAIL,
      to: process.env.OWNER_EMAIL,
      subject: "Booking notification",
      text: `Hello there is another successful booking for ${booking?.packagename}. Here are the booking details.
          BookingId:${booking?.id}
          Booking Date:${booking?.booking_date}
          Arrival Date:${booking?.arrival_date}
          Departure Date:${booking?.departure_date}
          vehicle: ${booking?.vehicle}
          payment: ${booking?.total_amount}
          client_email: ${booking?.email}
          full Name:${booking?.fullName}
          Please contact the client personally.`,
    });
  },
  {
    connection: redisConnection,
  }
);

console.log("📨 Email worker started");
