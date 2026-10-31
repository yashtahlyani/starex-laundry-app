/**
 * Meta hands out free WhatsApp test senders in the North American 555 range —
 * the exchange reserved for fiction, so no real subscriber line looks like
 * this. A test sender can only message a handful of numbers pre-listed in
 * Meta's console; every other recipient is rejected.
 *
 * The site ran on one (+1 555 479 4905) from launch until 31 Oct 2026. It
 * looked healthy from every angle — Twilio reported the sender ONLINE with a
 * HIGH quality rating and no offline reasons — and the only visible symptom
 * was that customers never replied. Reconstructing it needed the whole Twilio
 * message history: in no week were more than five numbers reachable, and the
 * set rotated week to week as phones were swapped on the list.
 *
 * Worth one regex so nobody has to work that out from message logs again.
 */
export function isMetaTestNumber(sender: string): boolean {
  return /^(whatsapp:)?\+1555\d{7}$/.test(sender.trim());
}
