import { Router, type Request, type Response } from "express";
import { prismaClient, transporterMain } from "../lib";
import { sleep } from "bun";
import Stripe from "stripe";
import { base_url } from "..";
import "dotenv/config";

import { emailQueue } from "../worker/queue";
export const routesUser = Router();

const stripe = new Stripe(process.env.STRIPE_API!);

routesUser.get("/getPackages", async (req, res) => {
  const packages = await prismaClient.tourPackages.findMany({
    include: {
      vehicleAssignments: {
        include: {
          vehicle: {
            select: {
              name: true,
              vehicle_type: true,
            },
          },
        },
      },
    },
  });
  console.log(packages);
  return res.json({ packages });
});
routesUser.get("/getEvents", async (req, res) => {
  const events = await prismaClient.events.findMany({});
  console.log(events);
  return res.json({ events });
});

const webhookEndpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const webHook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).send("Missing Stripe signature");
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      req.body, // MUST be raw Buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook verification failed", err);
    return res.status(400).send("Invalid signature");
  }

  try {
    switch (event.type) {
      /**
       * ✅ PAYMENT SUCCESS
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;

        if (!bookingId) break;

        await prismaClient.bookings.update({
          where: { id: bookingId },
          data: { payment_status: "CONFIRMED" },
        });
        const booking = await prismaClient.bookings.findFirst({
          where: { id: bookingId },
        });
        await emailQueue.add(
          "booking-success",
          { bookingId },
          {
            attempts: 1,
            backoff: { type: "exponential", delay: 5000 },
            removeOnComplete: true,
            removeOnFail: false,
          }
        );

        break;
      }

      /**
       * ❌ PAYMENT FAILED
       */
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const bookingId = intent.metadata?.bookingId;

        if (!bookingId) break;

        await prismaClient.bookings.update({
          where: { id: bookingId },
          data: { payment_status: "FAILED" },
        });

        const booking = await prismaClient.bookings.findFirst({
          where: { id: bookingId },
        });

        if (!booking) break;

        try {
          await transporterMain.sendMail({
            from: process.env.APP_EMAIL,
            to: booking.email,
            subject: "❌ Payment Failed – Action Required for Your Booking",
            text: `
Hello ${booking.fullName},

Unfortunately, your payment for the tour package "${booking.packagename}" could not be completed.



Your booking has NOT been confirmed because the payment was unsuccessful.

Possible reasons include:
- Insufficient funds
- Card declined by bank
- Authentication (OTP / 3D Secure) not completed

What you can do next:
- Try making the payment again
- Use a different card or payment method
- Contact your bank if the issue persists

If you need assistance, please contact us at ${process.env.OWNER_EMAIL}.

We look forward to assisting you and welcoming you to the Kingdom of Bhutan.

Warm regards,
Tour Booking Team
`,
          });
        } catch (mailErr) {
          console.error("Failed payment email error", mailErr);
        }

        break;
      }

      /**
       * 🚫 USER CANCELLED / SESSION EXPIRED
       */
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;

        if (!bookingId) break;

        await prismaClient.bookings.update({
          where: { id: bookingId },
          data: { payment_status: "CANCELLED" },
        });

        break;
      }

      default:
        // Ignore other events
        break;
    }
  } catch (dbErr) {
    console.error("Webhook DB update failed", dbErr);
    // ⚠️ Do not fail webhook — Stripe will retry and cause duplicates
  }

  return res.status(200).json({ received: true });
};

routesUser.post("/bookingSave", async (req: Request, res: Response) => {
  const bookingInfo = req.body;
  let tourpackage = null;
  let booking = null;

  let image = null;
  if (bookingInfo.bookingType == "package") {
    tourpackage = await prismaClient.tourPackages.findFirst({
      where: {
        id: req.body.packageId,
      },
    });
    image = tourpackage?.mainImage;
  } else {
    tourpackage = await prismaClient.events.findFirst({
      where: {
        id: req.body.packageId,
      },
    });
    image = tourpackage?.image;
  }

  if (!tourpackage) {
    return res.status(404).json({ msg: "Tour package not found" });
  }
  const client = req.body.clientType.toUpperCase();
  if (bookingInfo.bookingType == "package") {
    booking = await prismaClient.bookings.create({
      data: {
        clientType: client,
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        country: req.body.country,
        adress: req.body.address,
        travelers: parseInt(req.body.travelers),
        vehicle: req.body.vehicle,
        arrival_date: new Date(req.body.arrivalDate),
        departure_date: new Date(req.body.departureDate),
        total_amount: tourpackage.price,
        payment_status: "PENDING", // or use enum type
        tourPackageId: req.body.packageId,
        packagename: tourpackage.name,
      },
    });
  } else {
    booking = await prismaClient.bookings.create({
      data: {
        clientType: client,
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        country: req.body.country,
        adress: req.body.address,
        travelers: parseInt(req.body.travelers),
        vehicle: req.body.vehicle,
        arrival_date: new Date(req.body.arrivalDate),
        departure_date: new Date(req.body.departureDate),
        total_amount: tourpackage.price,
        payment_status: "PENDING", // or use enum type
        eventId: req.body.packageId,
        packagename: tourpackage.name,
      },
    });
  }

  const tourDescription = [...tourpackage.description].toString();

  console.log(tourDescription);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    // ✅ CRITICAL: metadata at SESSION level (webhook-safe)
    metadata: {
      bookingId: booking.id.toString(),
      bookingType: bookingInfo.bookingType, // optional but useful
    },

    line_items: [
      {
        price_data: {
          currency: "inr", // ✅ use INR if your price is in rupees

          product_data: {
            name: tourpackage.name,
            description: tourpackage.description.join(", "),
            images: [
              `${base_url}/${image}`, // ✅ must be publicly accessible
            ],
          },

          // ₹ → paise
          unit_amount: booking.total_amount * 100,
        },
        quantity: 1,
      },
    ],

    // ✅ USER REDIRECT (UX ONLY)
    success_url:
      "https://tourismfrontend.anythingforall.com/payment-success.html",
    cancel_url:
      "https://tourismfrontend.anythingforall.com/payment-cancel.html",
  });

  return res.json({ ok: "ok", url: session.url });
});
