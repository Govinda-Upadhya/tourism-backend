import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import { Redis } from "ioredis";
export const prismaClient = new PrismaClient();

export const transporterMain = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
export const redisConnection = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});
