export const WOMPI_RECURRING_CONFIG = {
  PUBLIC_KEY: "pub_prod_mUzoGd0TQzkIWZwMamDL3ADjEYCO93N7",
  PRIVATE_KEY: "prv_prod_...",
  INTEGRITY_SECRET: "prod_integrity_KZkk9BdR7yGH9jDspvfhWud8IdUBnMQw",
};

export const WOMPI_RECURRING_ENDPOINTS = {
  TOKENIZE_CARD: "https://production.wompi.co/v1/tokens/cards",
  PAYMENT_SOURCES: "https://production.wompi.co/v1/payment_sources",
  TRANSACTIONS: "https://production.wompi.co/v1/transactions",
  ACCEPTANCE_TOKEN: "https://production.wompi.co/v1/merchants/{public_key}",
};

export const CARD_VALIDATION_RULES = {
  NUMBER: /^[0-9]{13,19}$/,
  EXP_MONTH: /^(0[1-9]|1[0-2])$/,
  EXP_YEAR: /^[0-9]{2}$/,
  CVC: /^[0-9]{3,4}$/,
  CARD_HOLDER: /^[a-zA-Z\s]{2,50}$/,
};
