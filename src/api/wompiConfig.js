export const WOMPI_CONFIG = {
  PUBLIC_KEY: "pub_test_oRPBRklN6tpD4bJoRrkkd3X5l7kwzpF3",
  INTEGRITY_SECRET: "test_integrity_RMUwn1SSLmR31OFgXOdgJcV2VkcaaDVL",
  // PUBLIC_KEY: "pub_prod_mUzoGd0TQzkIWZwMamDL3ADjEYCO93N7",
  // INTEGRITY_SECRET: "prod_integrity_KZkk9BdR7yGH9jDspvfhWud8IdUBnMQw",
  EXCHANGE_RATE_API: "https://api.exchangerate-api.com/v4/latest/USD",
  DEFAULT_WORKSPACE_ID: null,
};

export const PLANS = [
  {
    id: "business",
    name: "Chatea Pro Start",
    priceUSD: 49,
    bot_users: 1000,
  },
  {
    id: "business_lite",
    name: "Chatea Pro Advanced",
    priceUSD: 109,
    bot_users: 10000,
  },
  {
    id: "custom_plan3",
    name: "Chatea Pro Plus",
    priceUSD: 189,
    bot_users: 20000,
  },
  {
    id: "business_large",
    name: "Chatea Pro Master",
    priceUSD: 389,
    bot_users: 50000,
  },
];
