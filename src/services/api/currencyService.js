import { fetchWithRetry } from "./index";

const EXCHANGE_RATE_API = "https://open.er-api.com/v6/latest/USD";
const CACHE_KEY = "currency_rates";
const CACHE_TIMESTAMP_KEY = "currency_rates_timestamp";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

// Monedas de Latinoamérica
export const LATAM_CURRENCIES = [
  { code: "COP", name: "Peso Colombiano", symbol: "$", country: "Colombia" },
  { code: "ARS", name: "Peso Argentino", symbol: "$", country: "Argentina" },
  { code: "CLP", name: "Peso Chileno", symbol: "$", country: "Chile" },
  {
    code: "USD",
    name: "Dólar Estadounidense",
    symbol: "$",
    country: "Ecuador",
  },
  {
    code: "GTQ",
    name: "Quetzal Guatemalteco",
    symbol: "Q",
    country: "Guatemala",
  },
  { code: "MXN", name: "Peso Mexicano", symbol: "$", country: "México" },
  { code: "PAB", name: "Balboa Panameño", symbol: "B/.", country: "Panamá" },
  { code: "PYG", name: "Guaraní Paraguayo", symbol: "₲", country: "Paraguay" },
  { code: "PEN", name: "Sol Peruano", symbol: "S/", country: "Perú" },
];

const getCachedRates = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (!cached || !timestamp) return null;

    const age = Date.now() - parseInt(timestamp);
    if (age > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      return null;
    }

    return JSON.parse(cached);
  } catch (error) {
    console.error("Error reading cached rates:", error);
    return null;
  }
};

const setCachedRates = (rates) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error("Error caching rates:", error);
  }
};

export const fetchCurrencyRates = async () => {
  const cached = getCachedRates();
  if (cached) {
    return cached;
  }

  try {
    const response = await fetchWithRetry(EXCHANGE_RATE_API);
    const data = await response.json();

    if (data.rates) {
      setCachedRates(data.rates);
      return data.rates;
    }

    return null;
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    return null;
  }
};

export const convertUSDToLocalCurrency = (amountUSD, rates, targetCurrency) => {
  if (!rates || !targetCurrency || targetCurrency === "USD") {
    return amountUSD;
  }

  const rate = rates[targetCurrency];
  if (!rate) return amountUSD;

  return amountUSD * rate;
};

export const formatCurrencyAmount = (amount, currencyCode) => {
  const currency = LATAM_CURRENCIES.find((c) => c.code === currencyCode);
  const decimals = ["COP", "CLP", "PYG"].includes(currencyCode) ? 0 : 2;

  const formatted = amount.toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return currency
    ? `${currency.symbol}${formatted}`
    : `${formatted} ${currencyCode}`;
};
