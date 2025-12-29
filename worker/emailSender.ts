import { Worker } from "bullmq";
import { redisConnection } from "../lib";
import { prismaClient, transporterMain } from "../lib";
import { bookingConfirmationHTML } from "../utils/emailTemplate";

const formatDate = (date: Date | null) =>
  date
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(date))
    : "N/A";

new Worker(
  "email-queue",
  async (job) => {
    const { bookingId } = job.data;

    const booking = await prismaClient.bookings.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    /* ---------------- CUSTOMER EMAIL ---------------- */

    await transporterMain.sendMail({
      from: `"Bhutan Travel" <${process.env.APP_EMAIL}>`,
      to: booking.email,
      subject: "🎉 Your Booking Is Confirmed!",
      text: `
Hello ${booking.fullName},

Your booking has been successfully confirmed.

Booking ID      : ${booking.id}
Package Name   : ${booking.packagename}
Booking Date   : ${formatDate(booking.booking_date)}
Arrival Date   : ${formatDate(booking.arrival_date)}
Departure Date : ${formatDate(booking.departure_date)}
Vehicle        : ${booking.vehicle}
Total Payment  : ₹${booking.total_amount}

For any assistance, contact:
${process.env.OWNER_EMAIL}

Welcome to the Kingdom of Bhutan 🇧🇹
`,
      html: bookingConfirmationHTML({
        fullName: booking.fullName,
        bookingId: booking.id,
        packageName: booking.packagename,
        bookingDate: formatDate(booking.booking_date),
        arrivalDate: formatDate(booking.arrival_date),
        departureDate: formatDate(booking.departure_date),
        vehicle: booking.vehicle,
        totalAmount: booking.total_amount,
        ownerEmail: process.env.OWNER_EMAIL!,
      }),
    });

    /* ---------------- OWNER EMAIL ---------------- */

    await transporterMain.sendMail({
      from: `"Booking System" <${process.env.APP_EMAIL}>`,
      to: process.env.OWNER_EMAIL,
      subject: "📢 New Booking Received",
      text: `
New booking confirmed.

Booking ID : ${booking.id}
Package    : ${booking.packagename}
Customer   : ${booking.fullName}
Email      : ${booking.email}
Payment    : ₹${booking.total_amount}
`,
    });
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

console.log("📨 Email worker started");
