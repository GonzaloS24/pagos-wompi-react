/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from "react";
import { WOMPI_CONFIG } from "../services/payments/wompi/wompiConfig";
import { PRICING, PAYMENT_PERIODS } from "../utils/constants";
import { calculateDiscountedPrice, getPriceInfo } from "../utils/discounts";
import {
  formatAssistantsForReference,
  formatComplementsForReference,
} from "../services/dataService";

export const usePaymentCalculations = ({
  purchaseType,
  selectedPlan,
  selectedAssistants,
  selectedComplements,
  usdToCopRate,
  urlParams,
  enableRecurring,
  paymentPeriod = PAYMENT_PERIODS.MONTHLY,
  freeAssistant,
}) => {
  const calculations = useMemo(() => {
    const assistantPrice = PRICING.ASSISTANT_PRICE_USD;
    let totalAssistantsPrice;
    let paidAssistants = [];

    if (purchaseType === "plan") {
      // Identificar asistentes pagados
      paidAssistants = selectedAssistants.filter((id) => id !== freeAssistant);
      totalAssistantsPrice = paidAssistants.length * assistantPrice;
    } else {
      // En compra de solo asistentes, todos son pagados
      paidAssistants = [...selectedAssistants];
      totalAssistantsPrice = selectedAssistants.length * assistantPrice;
    }

    // Precio base del plan (mensual)
    const basePlanPrice =
      purchaseType === "plan" ? selectedPlan?.priceUSD || 0 : 0;

    // Aplicar descuento anual al plan si corresponde
    const planPrice =
      purchaseType === "plan" && selectedPlan
        ? calculateDiscountedPrice(basePlanPrice, paymentPeriod)
        : basePlanPrice;

    // Los asistentes adicionales también se ven afectados por el descuento anual
    const assistantsPriceWithPeriod =
      purchaseType === "plan"
        ? calculateDiscountedPrice(totalAssistantsPrice, paymentPeriod)
        : totalAssistantsPrice;

    // Cálculo del precio total de los complementos (también afectados por periodo)
    const baseComplementsPrice = selectedComplements.reduce(
      (total, complement) =>
        total + (complement.totalPrice || complement.priceUSD || 0),
      0
    );

    const complementsPriceWithPeriod =
      purchaseType === "plan"
        ? calculateDiscountedPrice(baseComplementsPrice, paymentPeriod)
        : baseComplementsPrice;

    // Suma total en USD
    const totalUSD =
      planPrice + assistantsPriceWithPeriod + complementsPriceWithPeriod;

    // Información detallada de precios para el plan
    const planPriceInfo =
      purchaseType === "plan" && selectedPlan
        ? getPriceInfo(basePlanPrice, paymentPeriod)
        : null;

    // Información de descuento para asistentes
    const assistantsPriceInfo =
      purchaseType === "plan" && totalAssistantsPrice > 0
        ? getPriceInfo(totalAssistantsPrice, paymentPeriod)
        : null;

    // Información de descuento para complementos
    const complementsPriceInfo =
      purchaseType === "plan" && baseComplementsPrice > 0
        ? getPriceInfo(baseComplementsPrice, paymentPeriod)
        : null;

    // Calcular ahorros totales
    const totalAnnualSavings =
      paymentPeriod === PAYMENT_PERIODS.ANNUAL && purchaseType === "plan"
        ? (basePlanPrice + totalAssistantsPrice + baseComplementsPrice) *
          PRICING.MONTHS_IN_YEAR *
          (PRICING.ANNUAL_DISCOUNT_PERCENTAGE / 100)
        : 0;

    const validRate = usdToCopRate && usdToCopRate > 0 ? usdToCopRate : 4000;

    // Convertir a COP
    const priceInCOP = Math.round(totalUSD * validRate);
    const priceCOPCents = priceInCOP * 100;

    return {
      totalUSD,
      priceInCOP,
      priceCOPCents,
      planPrice,
      basePlanPrice,
      totalAssistantsPrice: assistantsPriceWithPeriod,
      baseAssistantsPrice: totalAssistantsPrice,
      totalComplementsPrice: complementsPriceWithPeriod,
      baseComplementsPrice,
      assistantPrice,

      // Información de descuentos
      planPriceInfo,
      assistantsPriceInfo,
      complementsPriceInfo,
      totalAnnualSavings,

      // Información de periodo
      paymentPeriod,
      isAnnual: paymentPeriod === PAYMENT_PERIODS.ANNUAL,

      freeAssistant,
      paidAssistants,
      freeAssistantName: freeAssistant || null,
      paidAssistantsCount: paidAssistants.length,
      freeAssistantsCount: freeAssistant ? 1 : 0,

      // Totales sin descuento para comparación
      totalUSDWithoutDiscount:
        purchaseType === "plan"
          ? (basePlanPrice + totalAssistantsPrice + baseComplementsPrice) *
            (paymentPeriod === PAYMENT_PERIODS.ANNUAL
              ? PRICING.MONTHS_IN_YEAR
              : 1)
          : totalUSD,

      // Descuento aplicado
      discountApplied:
        purchaseType === "plan" && paymentPeriod === PAYMENT_PERIODS.ANNUAL
          ? (basePlanPrice + totalAssistantsPrice + baseComplementsPrice) *
              PRICING.MONTHS_IN_YEAR -
            totalUSD
          : 0,
    };
  }, [
    purchaseType,
    selectedPlan,
    selectedAssistants,
    selectedComplements,
    usdToCopRate,
    paymentPeriod,
    freeAssistant,
  ]);

  // Función helper para obtener tipo de documento abreviado
  const getDocumentTypeAbbr = (type) => {
    if (!type || type.trim() === "") return null;
    return type;
  };

  const generateReference = useMemo(() => {
    const workspaceId =
      urlParams?.workspace_id || WOMPI_CONFIG.DEFAULT_WORKSPACE_ID;

    const assistantsForRef = formatAssistantsForReference(selectedAssistants);
    const complementsForRef =
      formatComplementsForReference(selectedComplements);

    const assistantsString =
      assistantsForRef.length > 0
        ? `-assistants=${assistantsForRef.join("+")}`
        : "";

    const complementsString =
      complementsForRef.length > 0
        ? `-complements=${complementsForRef.join("+")}`
        : "";

    // información del periodo de pago
    const periodString = calculations.isAnnual ? "-period=annual" : "";

    const recurringString = enableRecurring ? "-recurring=true" : "";

    // Agregar información del documento solo si ambos campos están presentes
    const documentTypeAbbr = getDocumentTypeAbbr(urlParams?.document_type);
    const documentString =
      documentTypeAbbr && urlParams?.document_number
        ? `-ssn=${documentTypeAbbr}+${urlParams.document_number}`
        : "";

    if (purchaseType === "plan") {
      return `plan_id=${
        selectedPlan?.id
      }-workspace_id=${workspaceId}-workspace_name=${
        urlParams?.workspace_name
      }-owner_email=${urlParams?.owner_email}-phone_number=${
        urlParams?.phone_number
      }${assistantsString}${complementsString}${recurringString}${periodString}${documentString}-reference${Date.now()}`;
    } else {
      return `assistants_only=true-workspace_id=${workspaceId}-workspace_name=${
        urlParams?.workspace_name
      }-owner_email=${urlParams?.owner_email}-phone_number=${
        urlParams?.phone_number
      }${assistantsString}${complementsString}${recurringString}${periodString}${documentString}-reference${Date.now()}`;
    }
  }, [
    purchaseType,
    selectedPlan,
    selectedAssistants,
    selectedComplements,
    urlParams,
    enableRecurring,
    calculations.isAnnual,
    freeAssistant,
  ]);

  const generateOrderDescription = useMemo(() => {
    let orderDescription =
      purchaseType === "plan"
        ? `Plan ${selectedPlan?.name || ""}`
        : "Asistentes adicionales";

    if (selectedAssistants.length > 0) {
      if (purchaseType === "plan" && freeAssistant) {
        const paidCount = selectedAssistants.length - 1;

        if (paidCount > 0) {
          orderDescription += ` con ${freeAssistant} (incluido) + ${paidCount} asistente(s) adicional(es)`;
        } else {
          orderDescription += ` con ${freeAssistant} (incluido)`;
        }
      } else {
        orderDescription += ` con ${selectedAssistants.length} asistente(s)`;
      }
    }

    if (selectedComplements.length > 0) {
      orderDescription += ` y ${selectedComplements.length} complemento(s)`;
    }

    if (calculations.isAnnual) {
      orderDescription += " (Plan Anual - Descuento 15%)";
    } else {
      orderDescription += " (Plan Mensual)";
    }

    return orderDescription;
  }, [
    purchaseType,
    selectedPlan,
    selectedAssistants,
    selectedComplements,
    calculations.isAnnual,
    freeAssistant,
  ]);

  return {
    ...calculations,
    reference: generateReference,
    orderDescription: generateOrderDescription,
  };
};
