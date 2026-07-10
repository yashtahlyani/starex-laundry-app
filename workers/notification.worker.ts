/**
 * Notification worker — BullMQ equivalent of a Celery worker.
 *
 * Run alongside Next.js in production:
 *   npx ts-node --esm workers/notification.worker.ts
 * Or as a separate Dockerfile CMD for horizontal scaling.
 *
 * Concurrency of 10 means 10 notification jobs run in parallel per worker instance.
 * Add more worker processes (or increase concurrency) to scale throughput linearly.
 */

import { Worker, type Job } from "bullmq";
import { createQueueConnection } from "../lib/redis/client";
import { sendBookingConfirmation, sendStatusNotification } from "../lib/notifications";
import type { NotificationJobData } from "../lib/queue/notification.queue";

const QUEUE_NAME = "notifications";

const conn = createQueueConnection();
if (!conn) {
  console.error("[notification-worker] REDIS_URL is not set — exiting.");
  process.exit(1);
}

const worker = new Worker<NotificationJobData>(
  QUEUE_NAME,
  async (job: Job<NotificationJobData>) => {
    const { type, payload } = job.data;

    switch (type) {
      case "booking_confirmed":
        await sendBookingConfirmation(payload);
        break;

      case "status_update":
        await sendStatusNotification(
          payload.orderId,
          payload.orderCode,
          payload.customerName,
          payload.customerEmail,
          payload.customerPhone,
          payload.newStatus
        );
        break;

      default:
        throw new Error(`Unknown notification job type: ${(job.data as any).type}`);
    }
  },
  {
    connection: conn,
    concurrency: 10,
  }
);

worker.on("completed", (job) => {
  console.log(`[notification-worker] ✓ ${job.name} (${job.id})`);
});

worker.on("failed", (job, err) => {
  console.error(`[notification-worker] ✗ ${job?.name} (${job?.id}) attempt ${job?.attemptsMade}: ${err.message}`);
});

worker.on("error", (err) => {
  console.error("[notification-worker] Worker error:", err.message);
});

console.log("[notification-worker] Started — waiting for jobs on queue:", QUEUE_NAME);
