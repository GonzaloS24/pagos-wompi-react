import { useMemo } from "react";
import { WOMPI_CONFIG } from "../services/payments/wompi/wompiConfig";

export const usePaymentCalculations = ({
  purchaseType,
  selectedPlan,
  selectedAssistants,
  selectedComplements,
  usdToCopRate,
  urlParams,
  enableRecurring,
}) => {
  const calculations = useMemo(() => {
    const assistantPrice = 20;
    let totalAssistantsPrice;

    // Cálculo de precio de asistentes según tipo de compra
    if (purchaseType === "plan") {
      const freeAssistants = selectedAssistants.length > 0 ? 1 : 0;
      const paidAssistants = Math.max(
        0,
        selectedAssistants.length - freeAssistants
      );
      totalAssistantsPrice = paidAssistants * assistantPrice;
    } else {
      totalAssistantsPrice = selectedAssistants.length * assistantPrice;
    }

    const planPrice = purchaseType === "plan" ? selectedPlan?.priceUSD || 0 : 0;

    // Cálculo del precio total de los complementos
    const totalComplementsPrice = selectedComplements.reduce(
      (total, complement) => total + complement.totalPrice,
      0
    );

    // Suma total en USD
    const totalUSD = planPrice + totalAssistantsPrice + totalComplementsPrice;

    // Verificar que tenemos una tasa válida
    const validRate = usdToCopRate && usdToCopRate > 0 ? usdToCopRate : 4000;

    // Convertir a COP (precio final para las pasarelas)
    const priceInCOP = Math.round(totalUSD * validRate);
    const priceCOPCents = priceInCOP * 100;

    return {
      totalUSD,
      priceInCOP,
      priceCOPCents,
      planPrice,
      totalAssistantsPrice,
      totalComplementsPrice,
      assistantPrice,
    };
  }, [
    purchaseType,
    selectedPlan,
    selectedAssistants,
    selectedComplements,
    usdToCopRate,
  ]);

  const generateReference = useMemo(() => {
    const workspaceId =
      urlParams?.workspace_id || WOMPI_CONFIG.DEFAULT_WORKSPACE_ID;

    const assistantsString =
      selectedAssistants.length > 0
        ? `-assistants=${selectedAssistants.join("+")}`
        : "";

    const complementsString =
      selectedComplements.length > 0
        ? `-complements=${selectedComplements
            .map((c) => {
              if (c.id === "webhooks") {
                return `${c.id}_${c.quantity}_${c.selectedBot.flow_ns}`;
              }
              return `${c.id}_${c.quantity}`;
            })
            .join("+")}`
        : "";

    const recurringString = enableRecurring ? "-recurring=true" : "";

    if (purchaseType === "plan") {
      return `plan_id=${
        selectedPlan?.id
      }-workspace_id=${workspaceId}-workspace_name=${
        urlParams?.workspace_name
      }-owner_email=${urlParams?.owner_email}-phone_number=${
        urlParams?.phone_number
      }${assistantsString}${complementsString}${recurringString}-reference${Date.now()}`;
    } else {
      return `assistants_only=true-workspace_id=${workspaceId}-workspace_name=${
        urlParams?.workspace_name
      }-owner_email=${urlParams?.owner_email}-phone_number=${
        urlParams?.phone_number
      }${assistantsString}${complementsString}${recurringString}-reference${Date.now()}`;
    }
  }, [
    purchaseType,
    selectedPlan,
    selectedAssistants,
    selectedComplements,
    urlParams,
    enableRecurring,
  ]);

  const generateOrderDescription = useMemo(() => {
    let orderDescription =
      purchaseType === "plan"
        ? `Plan ${selectedPlan?.name || ""}`
        : "Asistentes adicionales";

    if (selectedAssistants.length > 0) {
      orderDescription += ` con ${selectedAssistants.length} asistente(s)`;
    }

    if (selectedComplements.length > 0) {
      orderDescription += ` y ${selectedComplements.length} complemento(s)`;
    }

    return orderDescription;
  }, [purchaseType, selectedPlan, selectedAssistants, selectedComplements]);

  return {
    ...calculations,
    reference: generateReference,
    orderDescription: generateOrderDescription,
  };
};
