// Precios y configuraciones de productos
export const PRICING = {
  ASSISTANT_PRICE_USD: 20,
  FREE_ASSISTANTS_IN_PLAN: 1,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 100,
  ANNUAL_DISCOUNT_PERCENTAGE: 15,
  MONTHS_IN_YEAR: 12,
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

// Tipos de asistentes (mantener para compatibilidad)
export const ASSISTANT_TYPES = {
  VENTAS: "ventas",
  COMENTARIOS: "comentarios",
  CARRITOS: "carritos",
  REMARKETING: "remarketing",
  VOZ: "voz",
  LOGISTICA: "logistica",
};

// Tipos de complementos
export const COMPLEMENT_TYPES = {
  BOT: "bot",
  MEMBER: "member",
  WEBHOOKS: "webhooks",
};

// Configuración de complementos (mantener igual)
export const COMPLEMENTS_CONFIG = [
  {
    id: COMPLEMENT_TYPES.BOT,
    name: "🤖 1 Bot Adicional 🤖",
    description: "(Permite agregar un nuevo canal como FB, IG o WP)",
    priceUSD: 10,
  },
  {
    id: COMPLEMENT_TYPES.MEMBER,
    name: "🙋‍♀️1 Miembro Adicional 🙋‍♀️",
    description: "(Permite agregar un nuevo asesor)",
    priceUSD: 10,
  },
  {
    id: COMPLEMENT_TYPES.WEBHOOKS,
    name: "1.000 Webhooks Diarios 🔗",
    description: "",
    priceUSD: 20,
  },
];

// REMOVER: ASSISTANTS_CONFIG ya no se usa (ahora viene de la API)

// Mapeo de nombres de asistentes del API (mantener para compatibilidad)
export const ASSISTANT_NAME_MAPPING = {
  "Whatsapp IA": ASSISTANT_TYPES.VENTAS,
  Logistica: ASSISTANT_TYPES.LOGISTICA,
  "Comentarios IA": ASSISTANT_TYPES.COMENTARIOS,
  "Carritos IA": ASSISTANT_TYPES.CARRITOS,
  Marketing: "marketing",
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

/**
 * FUNCIONES HELPER ACTUALIZADAS PARA USAR EL HOOK
 */

/**
 * Convierte IDs de asistentes a objetos completos con información
 * NOTA: Esta función ahora debe usarse dentro de componentes que tengan acceso al hook useAssistants
 * @param {array} assistantIds - Array de IDs de asistentes
 * @param {array} assistantsFromAPI - Array de asistentes de la API
 * @returns {array} - Array de objetos con información completa de asistentes
 */
export const mapAssistantsToFullData = (assistantIds, assistantsFromAPI) => {
  if (!assistantsFromAPI) return [];

  return assistantIds.map((id) => {
    const assistant = assistantsFromAPI.find((a) => a.id === id);

    if (assistant) {
      return {
        id: assistant.id,
        apiId: assistant.apiId,
        name: assistant.label,
        type: assistant.type,
        description: assistant.description,
        icon: assistant.icon,
        comingSoon: assistant.comingSoon || false,
        cost: assistant.cost,
      };
    } else {
      return {
        id: id,
        apiId: null,
        name: `Asistente ${id}`,
        type: "Asistente personalizado",
        description: "",
        icon: "bx-bot",
        cost: 30,
      };
    }
  });
};

/**
 * Convierte IDs de complementos a objetos completos con información
 * @param {array} complements - Array de IDs o objetos de complementos
 * @returns {array} - Array de objetos con información completa de complementos
 */
export const mapComplementsToFullData = (complements) => {
  return complements.map((complement) => {
    if (typeof complement === "object" && complement.name) {
      return complement;
    }

    const id = typeof complement === "object" ? complement.id : complement;
    const config = getComplementConfig(id);

    return config
      ? {
          id: id,
          name: config.name,
          description: config.description,
          priceUSD: config.priceUSD,
        }
      : {
          id: id,
          name: `Complemento ${id}`,
          description: "",
          priceUSD: 0,
        };
  });
};

/**
 * Obtiene la configuración de un complemento por su ID
 * @param {string|number} id - ID del complemento
 * @returns {object|null} - Configuración del complemento o null si no se encuentra
 */
export const getComplementConfig = (id) => {
  return COMPLEMENTS_CONFIG.find((config) => config.id === id) || null;
};

/**
 * Obtiene una lista de todos los complementos disponibles
 * @returns {array} - Array de configuraciones de complementos
 */
export const getAvailableComplements = () => {
  return COMPLEMENTS_CONFIG;
};
