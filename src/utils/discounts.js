import { PRICING, PAYMENT_PERIODS } from "./constants";

/**
 * Calcula el precio con descuento anual
 * @param {number} monthlyPrice - Precio mensual base
 * @param {string} period - Periodicidad (monthly/annual)
 * @returns {number} Precio final
 */
export const calculateDiscountedPrice = (monthlyPrice, period) => {
  if (period === PAYMENT_PERIODS.ANNUAL) {
    const annualPriceBeforeDiscount = monthlyPrice * PRICING.MONTHS_IN_YEAR;
    const discountAmount =
      annualPriceBeforeDiscount * (PRICING.ANNUAL_DISCOUNT_PERCENTAGE / 100);
    return annualPriceBeforeDiscount - discountAmount;
  }
  return monthlyPrice;
};

/**
 * Calcula el monto del descuento anual
 * @param {number} monthlyPrice - Precio mensual base
 * @returns {number} Monto del descuento
 */
export const calculateAnnualDiscount = (monthlyPrice) => {
  const annualPriceBeforeDiscount = monthlyPrice * PRICING.MONTHS_IN_YEAR;
  return annualPriceBeforeDiscount * (PRICING.ANNUAL_DISCOUNT_PERCENTAGE / 100);
};

/**
 * Calcula el ahorro anual
 * @param {number} monthlyPrice - Precio mensual base
 * @returns {number} Ahorro anual
 */
export const calculateAnnualSavings = (monthlyPrice) => {
  return calculateAnnualDiscount(monthlyPrice);
};

/**
 * Calcula el precio mensual equivalente del plan anual
 * @param {number} monthlyPrice - Precio mensual base
 * @returns {number} Precio mensual equivalente con descuento
 */
export const calculateEquivalentMonthlyPrice = (monthlyPrice) => {
  const annualDiscountedPrice = calculateDiscountedPrice(
    monthlyPrice,
    PAYMENT_PERIODS.ANNUAL
  );
  return annualDiscountedPrice / PRICING.MONTHS_IN_YEAR;
};

/**
 * Obtiene información completa de precios para un plan
 * @param {number} monthlyPrice - Precio mensual base
 * @param {string} period - Periodicidad seleccionada
 * @returns {Object} Información completa de precios
 */
export const getPriceInfo = (monthlyPrice, period) => {
  const isAnnual = period === PAYMENT_PERIODS.ANNUAL;
  const finalPrice = calculateDiscountedPrice(monthlyPrice, period);
  const annualSavings = isAnnual ? calculateAnnualSavings(monthlyPrice) : 0;
  const equivalentMonthlyPrice = isAnnual
    ? calculateEquivalentMonthlyPrice(monthlyPrice)
    : monthlyPrice;

  return {
    originalMonthlyPrice: monthlyPrice,
    finalPrice,
    isAnnual,
    period,
    discount: {
      percentage: isAnnual ? PRICING.ANNUAL_DISCOUNT_PERCENTAGE : 0,
      amount: isAnnual ? calculateAnnualDiscount(monthlyPrice) : 0,
      savings: annualSavings,
    },
    equivalentMonthlyPrice,
    totalMonthsIncluded: isAnnual ? PRICING.MONTHS_IN_YEAR : 1,
  };
};

/**
 * Formatea el mensaje de ahorro
 * @param {number} savingsAmount - Monto del ahorro
 * @param {string} currency - Moneda (USD/COP)
 * @returns {string} Mensaje formateado
 */
export const formatSavingsMessage = (savingsAmount, currency = "USD") => {
  const formattedAmount =
    currency === "USD"
      ? `$${savingsAmount.toFixed(2)}`
      : `$${Math.round(savingsAmount).toLocaleString("es-CO")}`;

  return `¡Ahorra ${formattedAmount} ${currency} al año!`;
};

/**
 * Valida si se puede aplicar descuento anual
 * @param {string} purchaseType - Tipo de compra
 * @returns {boolean} Si se puede aplicar descuento anual
 */
export const canApplyAnnualDiscount = (purchaseType) => {
  // Solo se aplica descuento anual a planes completos, no a compra de solo asistentes
  return purchaseType === "plan";
};

/**
 * Calcula el porcentaje de ahorro mensual equivalente
 * @param {number} monthlyPrice - Precio mensual base
 * @returns {number} Porcentaje de ahorro por mes
 */
export const calculateMonthlyEquivalentSavings = (monthlyPrice) => {
  const originalMonthly = monthlyPrice;
  const discountedMonthly = calculateEquivalentMonthlyPrice(monthlyPrice);
  return ((originalMonthly - discountedMonthly) / originalMonthly) * 100;
};
