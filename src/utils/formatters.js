// Formateo de monedas
export const formatCurrency = (amount, currency = "USD", locale = "en-US") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "COP" ? 0 : 2,
    maximumFractionDigits: currency === "COP" ? 0 : 2,
  }).format(amount);
};

export const formatUSD = (amount) => formatCurrency(amount, "USD", "en-US");

export const formatCOP = (amount) => formatCurrency(amount, "COP", "es-CO");

// Formateo simple sin símbolo de moneda
export const formatAmount = (amount, decimals = 2) => {
  return Number(amount).toLocaleString("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Formateo de números grandes
export const formatLargeNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

// Formateo de fechas
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return new Date(date).toLocaleDateString("es-CO", {
    ...defaultOptions,
    ...options,
  });
};

export const formatDateShort = (date) => {
  return formatDate(date, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Formateo de texto
export const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatTitle = (str) => {
  if (!str) return "";
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Formateo de identificadores
export const formatTransactionId = (id) => {
  if (!id) return "";
  if (id.length > 12) {
    return `...${id.slice(-8)}`;
  }
  return id;
};

export const formatWorkspaceId = (id) => {
  if (!id) return "";
  return `WS-${id}`;
};

// Formateo de teléfonos
export const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  // Remover caracteres no numéricos excepto +
  const cleaned = phone.replace(/[^\d+]/g, "");

  // Formatear número colombiano
  if (cleaned.startsWith("+57") && cleaned.length === 13) {
    const number = cleaned.slice(3);
    return `+57 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(
      6,
      10
    )}`;
  }

  return cleaned;
};

// Formateo de emails
export const maskEmail = (email) => {
  if (!email) return "";

  const [username, domain] = email.split("@");
  if (!username || !domain) return email;

  if (username.length <= 2) return email;

  const maskedUsername =
    username.charAt(0) +
    "*".repeat(username.length - 2) +
    username.charAt(username.length - 1);
  return `${maskedUsername}@${domain}`;
};

// Formateo de porcentajes
export const formatPercentage = (value, decimals = 1) => {
  return `${Number(value).toFixed(decimals)}%`;
};

// Formateo de estados de transacción
export const formatTransactionStatus = (status) => {
  const statusMap = {
    APPROVED: "Aprobada",
    DECLINED: "Rechazada",
    PENDING: "Pendiente",
    VOIDED: "Anulada",
    ERROR: "Error",
  };

  return statusMap[status] || status;
};

// Formateo de métodos de pago
export const formatPaymentMethod = (method) => {
  const methodMap = {
    CARD: "Tarjeta",
    PSE: "PSE",
    NEQUI: "Nequi",
    BANCOLOMBIA_TRANSFER: "Transferencia Bancolombia",
    BANCOLOMBIA_COLLECT: "Recaudo Bancolombia",
    DAVIPLATA: "Daviplata",
  };

  return methodMap[method] || method;
};

// Sanitización de strings para HTML
export const sanitizeString = (str) => {
  if (!str) return "";
  return str.replace(/[<>]/g, "");
};

// Formateo de listas
export const formatList = (items, separator = ", ", lastSeparator = " y ") => {
  if (!items || items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(lastSeparator);

  const allButLast = items.slice(0, -1);
  const last = items[items.length - 1];

  return allButLast.join(separator) + lastSeparator + last;
};
