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
  note?: string | null;
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
    // Dev/no-Redis fallback: call directly. Must be awaited here, not just by
    // the caller — an un-awaited call inside this function resolves the
    // outer promise before the send actually finishes, which let Vercel
    // freeze the function mid-send (confirmed live: status-update emails
    // were silently dropped even though the API route already awaited
    // enqueueStatusUpdate(), because this inner call wasn't awaited).
    await sendBookingConfirmation(payload).catch(() => {});
  }
}

export async function enqueueStatusUpdate(payload: StatusNotificationPayload): Promise<void> {
  const queue = getQueue();
  if (queue) {
    await queue.add("status_update", { type: "status_update", payload } satisfies NotificationJobData);
  } else {
    await sendStatusNotification(
      payload.orderId,
      payload.orderCode,
      payload.customerName,
      payload.customerEmail,
      payload.customerPhone,
      payload.newStatus,
      payload.note
    ).catch(() => {});
  }
}
