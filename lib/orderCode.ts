// Short human-readable order ID shown to the customer, e.g. STX-482913
export function generateOrderCode(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `STX-${n}`;
}
