import { PRICING } from "./constants";

// Cálculos de precios de asistentes
export const calculateAssistantsPrice = (selectedAssistants, purchaseType) => {
  if (purchaseType === "plan") {
    // En planes, el primer asistente es gratis
    const freeAssistants =
      selectedAssistants.length > 0 ? PRICING.FREE_ASSISTANTS_IN_PLAN : 0;
    const paidAssistants = Math.max(
      0,
      selectedAssistants.length - freeAssistants
    );
    return paidAssistants * PRICING.ASSISTANT_PRICE_USD;
  } else {
    // En compra de solo asistentes, todos son pagados
    return selectedAssistants.length * PRICING.ASSISTANT_PRICE_USD;
  }
};

// Cálculo del precio total de complementos
export const calculateComplementsPrice = (selectedComplements) => {
  return selectedComplements.reduce(
    (total, complement) => total + complement.totalPrice,
    0
  );
};

// Cálculo del precio total en USD
export const calculateTotalUSD = (
  planPrice,
  assistantsPrice,
  complementsPrice
) => {
  return planPrice + assistantsPrice + complementsPrice;
};

// Conversión de USD a COP (centavos)
export const convertUSDtoCOPCents = (usdAmount, usdToCopRate) => {
  if (!usdAmount || !usdToCopRate) return 0;
  const copAmount = Math.round(usdAmount * usdToCopRate);
  return copAmount * 100;
};

// Conversión de USD a COP
export const convertUSDtoCOP = (usdAmount, usdToCopRate) => {
  if (!usdAmount || !usdToCopRate) return 0;
  return Math.round(usdAmount * usdToCopRate);
};

// Conversión de COP a USD
export const convertCOPtoUSD = (copAmount, usdToCopRate) => {
  if (!copAmount || !usdToCopRate) return 0;
  return copAmount / usdToCopRate;
};
