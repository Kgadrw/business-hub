const DEFAULT_USD_TO_FRW_RATE = 1300;
const USD_TO_FRW_RATE_STORAGE_KEY = "usd_to_frw_rate";

let cachedRate: number | null = null;

export function getUsdToFrwRate() {
  if (typeof window === "undefined") return DEFAULT_USD_TO_FRW_RATE;
  if (cachedRate != null) return cachedRate;
  const raw = window.localStorage.getItem(USD_TO_FRW_RATE_STORAGE_KEY);
  if (!raw) return DEFAULT_USD_TO_FRW_RATE;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_USD_TO_FRW_RATE;
}

export function setUsdToFrwRate(rate: number) {
  if (typeof window === "undefined") return;
  cachedRate = rate;
  window.localStorage.setItem(USD_TO_FRW_RATE_STORAGE_KEY, String(rate));
}

export function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatFRW(amountInUsd: number) {
  const usdToFrwRate = getUsdToFrwRate();
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(amountInUsd * usdToFrwRate);
}

export function formatDualCurrency(amountInUsd: number) {
  return `${formatUSD(amountInUsd)} (${formatFRW(amountInUsd)})`;
}

