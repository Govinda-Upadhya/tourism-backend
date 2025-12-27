// queues/emailQueue.ts
import { Queue } from "bullmq";
import { redisConnection } from "../lib";

export const emailQueue = new Queue("email-queue", {
  connection: redisConnection,
});
