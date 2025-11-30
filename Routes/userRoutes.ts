import { Router, type Request, type Response } from "express";
import { prismaClient } from "../lib";
import { sleep } from "bun";
import Stripe from "stripe";
import { base_url } from "..";
import "dotenv/config";
import e from "express";
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

// routesUser.post(
//   "/create-payment-intent",
//   async (req: Request, res: Response) => {
//     try {
//       const { total_price } = req.body; // amount in rupees or cents
//       const amount = parseFloat(total_price);
//       console.log(amount);
//       const paymentIntent = await stripe.paymentIntents.create({
//         amount: amount * 100, // Stripe uses smallest currency unit (₹1 = 100 paise)
//         currency: "inr",
//         automatic_payment_methods: { enabled: true },
//       });

//       res.send({
//         clientSecret: paymentIntent.client_secret,
//       });
//     } catch (error) {
//       res.status(500).send({ error: error.message });
//     }
//   }
// );

routesUser.post(
  "/create-checkout-session",
  async (req: Request, res: Response) => {
    try {
      console.log("payment session");
      const { price } = req.body;

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: "Seoul City Tour",
              },
              unit_amount: price * 100, // convert rupees to paise
            },
            quantity: 1,
          },
        ],
        success_url: "http://127.0.0.1:5500/Tourism-main/payment-success.html",
        cancel_url: "http://localhost:5500/payment-cancel.html",
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: (error as Error).message });
    }
  }
);
const webhookEndpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

routesUser.post(
  "/webhook",
  e.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      return;
    }
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookEndpointSecret!
      );
    } catch (err) {
      console.log("Webhook signature verification failed.", err);
      return res.status(400).send(`Webhook Error: ${err}`);
    }

    // EVENT HANDLING
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (!session) {
        return;
      }
      // Update payment status in your database
      await prismaClient.bookings.update({
        where: { id: session.metadata.bookingId },
        data: { payment_status: "SUCCESS" },
      });

      console.log("Booking updated to SUCCESS");
    }

    res.json({ received: true });
  }
);

routesUser.post("/bookingSave", async (req: Request, res: Response) => {
  const bookingInfo = req.body;
  let tourpackage = null;
  let booking = null;
  if (bookingInfo.bookingType == "package") {
    tourpackage = await prismaClient.tourPackages.findFirst({
      where: {
        id: req.body.packageId,
      },
    });
  } else {
    tourpackage = await prismaClient.events.findFirst({
      where: {
        id: req.body.packageId,
      },
    });
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
      },
    });
  }

  const tourDescription = [...tourpackage.description].toString();
  const tourImage = base_url + tourpackage.mainImage;
  console.log(tourDescription);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: tourpackage.name,
            description: tourDescription,
            images: [
              "https://images.pexels.com/photos/33317573/pexels-photo-33317573.jpeg?_gl=1*mmfjul*_ga*NTE4MDQyNTg2LjE3NTMyNjgxMTQ.*_ga_8JE65Q40S6*czE3NjM4MDQzNzUkbzMkZzAkdDE3NjM4MDQzNzUkajYwJGwwJGgw",
            ],
            metadata: {
              bookingId: booking.id,
              travelers: booking.travelers.toString(),
              arrival: booking.arrival_date.toISOString(),
              departure: booking.departure_date.toISOString(),
              email: booking.email,
            },
          },
          unit_amount: booking.total_amount * 100, // convert rupees to paise
        },
        quantity: 1,
      },
    ],
    success_url: "http://127.0.0.1:5501/payment-success.html",
    cancel_url: "http://localhost:5500/payment-cancel.html",
  });

  return res.json({ ok: "ok", url: session.url });
});
