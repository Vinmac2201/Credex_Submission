export const INR = {
  currencyCode: "INR",
  symbol: "₹",
  usdToInr: 98,
  verifiedDate: "2026-05-21",
};

export function usdToInr(usd: number) {
  return Math.round(usd * INR.usdToInr);
}

export function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}
