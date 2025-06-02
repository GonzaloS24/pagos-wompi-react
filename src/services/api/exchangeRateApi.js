import { fetchWithRetry } from "./index";

const EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest/USD";

export const fetchExchangeRate = async (targetCurrency = "COP") => {
  try {
    const response = await fetchWithRetry(EXCHANGE_RATE_API);

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rate: ${response.status}`);
    }

    const data = await response.json();

    if (targetCurrency === "COP") {
      return data.rates.COP;
    }

    return data.rates[targetCurrency] || null;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return targetCurrency === "COP" ? 4000 : 1;
  }
};

export const fetchUSDtoCOPRate = async () => {
  try {
    const response = await fetchWithRetry(EXCHANGE_RATE_API);

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rate: ${response.status}`);
    }

    const data = await response.json();

    if (data.rates && data.rates.COP) {
      const rate = data.rates.COP;
      return rate;
    } else {
      console.warn("Invalid API response structure, using fallback rate");
      return 4200;
    }
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return 4200;
  }
};

export const convertCurrency = async (
  amount,
  fromCurrency = "USD",
  toCurrency = "COP"
) => {
  try {
    const rate = await fetchExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  } catch (error) {
    console.error("Error converting currency:", error);
    return amount;
  }
};

// Cache para evitar múltiples llamadas
let cachedRate = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000;

export const getCachedExchangeRate = async () => {
  const now = Date.now();

  if (cachedRate && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
    return cachedRate;
  }

  const rate = await fetchUSDtoCOPRate();
  cachedRate = rate;
  cacheTimestamp = now;

  return rate;
};
