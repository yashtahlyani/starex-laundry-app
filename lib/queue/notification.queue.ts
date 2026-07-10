import { Queue } from "bullmq";
import { createQueueConnection } from "@/lib/redis/client";
import {
  sendBookingConfirmation,
  sendStatusNotification,
  type BookingNotificationPayload,
} from "@/lib/notifications";

export type StatusNotificationPayload = {
  orderId: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  newStatus: string;
};

export type NotificationJobData =
  | { type: "booking_confirmed"; payload: BookingNotificationPayload }
  | { type: "status_update"; payload: StatusNotificationPayload };

const QUEUE_NAME = "notifications";

let _queue: Queue | null = null;

function getQueue(): Queue | null {
  const conn = createQueueConnection();
  if (!conn) return null; // Redis not configured — fall back to direct calls
  if (_queue) return _queue;
  _queue = new Queue(QUEUE_NAME, {
    connection: conn,
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  });
  return _queue;
}

export async function enqueueBookingConfirmation(payload: BookingNotificationPayload): Promise<void> {
  const queue = getQueue();
  if (queue) {
    await queue.add("booking_confirmed", { type: "booking_confirmed", payload } satisfies NotificationJobData);
  } else {
    // Dev fallback: call directly (no retry, but works without Redis)
    sendBookingConfirmation(payload).catch(() => {});
  }
}

export async function enqueueStatusUpdate(payload: StatusNotificationPayload): Promise<void> {
  const queue = getQueue();
  if (queue) {
    await queue.add("status_update", { type: "status_update", payload } satisfies NotificationJobData);
  } else {
    sendStatusNotification(
      payload.orderId,
      payload.orderCode,
      payload.customerName,
      payload.customerEmail,
      payload.customerPhone,
      payload.newStatus
    ).catch(() => {});
  }
}
