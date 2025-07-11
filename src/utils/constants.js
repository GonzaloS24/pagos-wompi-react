// Precios y configuraciones básicas
export const PRICING = {
  FREE_ASSISTANTS_IN_PLAN: 1,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 100,
  ANNUAL_DISCOUNT_PERCENTAGE: 15,
  MONTHS_IN_YEAR: 12,
  ASSISTANT_PRICE_USD: 0.3,
};

// Tipos de compra
export const PURCHASE_TYPES = {
  PLAN: "plan",
  ASSISTANTS: "assistants",
};

// Periodicidad de pago
export const PAYMENT_PERIODS = {
  MONTHLY: "monthly",
  ANNUAL: "annual",
};

// Métodos de pago
export const PAYMENT_GATEWAYS = {
  WOMPI: "wompi",
  PAYMENTS_WAY: "paymentsway",
  WALLET: "wallet",
};

// Estados de transacciones
export const TRANSACTION_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  DECLINED: "DECLINED",
  VOIDED: "VOIDED",
  ERROR: "ERROR",
};

// Configuración de URLs y endpoints
export const URLS = {
  TRANSACTION_SUMMARY: "/transaction-summary",
  PAYMENT_PAGE: "/",
  CHATEA_WEBSITE: "https://chateapro.app/",
};

// Configuración de validación
export const VALIDATION_RULES = {
  WORKSPACE_ID: /^\d+$/,
  EMAIL: /\S+@\S+\.\S+/,
  PHONE: /^\+?\d{5,15}$/,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
};

// Configuración de la UI
export const UI_CONFIG = {
  POLLING_INTERVAL: 3000,
  MAX_POLLING_ATTEMPTS: 20,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
};

// Colores del tema
export const THEME_COLORS = {
  PRIMARY: "#009ee3",
  PRIMARY_HOVER: "#007ab3",
  SUCCESS: "#28a745",
  ERROR: "#dc3545",
  WARNING: "#f0ad4e",
  INFO: "#17a2b8",
  LIGHT: "#f8f9fa",
  DARK: "#343a40",
  ANNUAL_DISCOUNT: "#28a745",
};

// Mensajes de estado
export const STATUS_MESSAGES = {
  [TRANSACTION_STATUS.APPROVED]: "¡Transacción Exitosa!",
  [TRANSACTION_STATUS.DECLINED]: "Transacción Rechazada",
  [TRANSACTION_STATUS.VOIDED]: "Transacción Anulada",
  [TRANSACTION_STATUS.ERROR]: "Error en la Transacción",
  [TRANSACTION_STATUS.PENDING]: "Transacción en Proceso",
  DEFAULT: "Estado Desconocido",
};

// Configuración de logs
export const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

// Configuración de caché
export const CACHE_CONFIG = {
  EXCHANGE_RATE_DURATION: 5 * 60 * 1000, // 5 minutos
  PLANS_DURATION: 10 * 60 * 1000, // 10 minutos
  ASSISTANTS_DURATION: 5 * 60 * 1000, // 5 minutos
};

// Asistentes quemados que no vienen del API (proximamente)
export const COMING_SOON_ASSISTANTS = [
  {
    id: "remarketing",
    name: "Asistente de Remarketing",
    label: "Asistente de Remarketing",
    description: "Aumenta tus ventas usando tu base de datos.",
    icon: "bx-line-chart",
    comingSoon: true,
  },
  {
    id: "voz",
    name: "Asistente de Voz con IA",
    label: "Asistente de Voz con IA",
    description: "Contacta al cliente con un agente de voz IA",
    icon: "bx-microphone",
    comingSoon: true,
  },
];

// Mapeo de IDs de API a nombres de referencia para pagos normales
export const ASSISTANT_REFERENCE_MAPPING = {
  1: "ventas",
  2: "carritos",
  3: "comentarios",
};

// Mapeo de nombres de referencia a IDs de API para credit card
export const ASSISTANT_ID_MAPPING = {
  ventas: 1,
  carritos: 2,
  comentarios: 3,
};

// Mapeo de IDs de complementos API a nombres de referencia
export const COMPLEMENT_REFERENCE_MAPPING = {
  1: "bot",
  2: "member",
  3: "webhooks",
};

// Mapeo de nombres de referencia a IDs de API para credit card
export const COMPLEMENT_ID_MAPPING = {
  bot: 1,
  member: 2,
  webhooks: 3,
};

// Información de display para asistentes (con emojis y descripciones)
export const ASSISTANT_DISPLAY_INFO = {
  ventas: {
    label: "🔥Asistente de ventas por WhatsApp🔥",
    description: "Logra CPAs hasta de 5.000",
    icon: "bx bxl-whatsapp",
  },
  carritos: {
    label: "🛒Asistente de carritos abandonados🛒",
    description: "Recupera hasta el 50% de los carritos abandonados.",
    icon: "bx-cart",
  },
  comentarios: {
    label: "💬Asistente de comentarios💬",
    description: "Convierte en ventas los comentarios de Facebook.",
    icon: "bx-message-rounded-dots",
  },
};

/**
 * Convierte ID numérico de asistente a nombre de referencia
 */
export const getAssistantReference = (id) => {
  return ASSISTANT_REFERENCE_MAPPING[id] || id.toString();
};

/**
 * Convierte nombre de referencia a ID numérico
 */
export const getAssistantId = (reference) => {
  return ASSISTANT_ID_MAPPING[reference] || reference;
};

/**
 * Convierte ID numérico de complemento a nombre de referencia
 */
export const getComplementReference = (id) => {
  return COMPLEMENT_REFERENCE_MAPPING[id] || id.toString();
};

/**
 * Convierte nombre de referencia a ID numérico
 */
export const getComplementId = (reference) => {
  return COMPLEMENT_ID_MAPPING[reference] || reference;
};
