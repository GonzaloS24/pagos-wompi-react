import { ASSISTANTS_CONFIG } from "../../../utils/constants";

export const simulateCalculateChanges = ({
  assistantsToAdd,
  assistantsToRemove,
  complementsToAdd,
  complementsToRemove,
  planChange,
  currentPlan,
}) => {
  const items = [];
  let totalAmount = 0;

  // Cambio de plan
  if (planChange) {
    const plans = {
      business: { name: "Chatea Pro Start", price: 49 },
      business_lite: { name: "Chatea Pro Advanced", price: 109 },
      custom_plan3: { name: "Chatea Pro Plus", price: 189 },
      business_large: { name: "Chatea Pro Master", price: 399 },
    };

    const currentPlanData = plans[currentPlan];
    const newPlanData = plans[planChange.id];
    const priceDiff = newPlanData.price - currentPlanData.price;

    if (priceDiff > 0) {
      // Upgrade - se cobra la diferencia prorrateada
      const proratedAmount = priceDiff * 0.5;
      items.push({
        type: "upgrade",
        description: `Upgrade a ${newPlanData.name}`,
        amount: proratedAmount,
        discount: {
          description: `Prorrateado por 15 días restantes`,
          originalAmount: priceDiff,
        },
      });
      totalAmount += proratedAmount;
    } else if (priceDiff < 0) {
      // Downgrade - no se cobra ni se devuelve dinero
      items.push({
        type: "downgrade",
        description: `Downgrade a ${newPlanData.name}`,
        amount: 0,
        discount: {
          description: `Cambio aplicado sin costo adicional`,
        },
      });
    }
  }

  // Asistentes a agregar
  assistantsToAdd.forEach((assistantId) => {
    const assistant = ASSISTANTS_CONFIG.find((a) => a.id === assistantId);
    const assistantPrice = 20 * 0.5; // Prorrateado
    items.push({
      type: "add",
      description: `Agregar ${assistant?.label || assistantId}`,
      amount: assistantPrice,
      discount: {
        description: `Prorrateado por 15 días restantes`,
        originalAmount: 20,
      },
    });
    totalAmount += assistantPrice;
  });

  // Asistentes a remover
  assistantsToRemove.forEach((assistantId) => {
    const assistant = ASSISTANTS_CONFIG.find((a) => a.id === assistantId);
    items.push({
      type: "remove",
      description: `Remover ${assistant?.label || assistantId}`,
      amount: 0,
      discount: {
        description: `Removido sin reembolso`,
      },
    });
  });

  // Complementos a agregar
  complementsToAdd.forEach((complement) => {
    const complementPrice = complement.totalPrice * 0.5; // Prorrateado
    let description = `Agregar ${complement.name}`;
    if (complement.selectedBot) {
      description += ` para ${complement.selectedBot.name}`;
    }
    if (complement.quantity > 1) {
      description += ` (${complement.quantity} unidades)`;
    }

    items.push({
      type: "add",
      description,
      amount: complementPrice,
      discount: {
        description: `Prorrateado por 15 días restantes`,
        originalAmount: complement.totalPrice,
      },
    });
    totalAmount += complementPrice;
  });

  // Complementos a remover
  complementsToRemove.forEach((complement) => {
    let description = `Remover ${complement.name}`;
    if (complement.selectedBot) {
      description += ` de ${complement.selectedBot.name}`;
    }
    if (complement.quantity > 1) {
      description += ` (${complement.quantity} unidades)`;
    }

    items.push({
      type: "remove",
      description,
      amount: 0,
      discount: {
        description: `Removido sin reembolso`,
      },
    });
  });

  return {
    items,
    totalAmount: Math.max(0, totalAmount), // No permitir montos negativos
  };
};

export const calculateChanges = (
  selectedAssistants,
  selectedPlan,
  selectedComplements,
  subscription
) => {
  if (!subscription) return null;

  const currentAssistants = subscription.assistants || [];
  const currentComplements = subscription.complements || [];
  const currentPlan = subscription.planId;

  const assistantsToAdd = selectedAssistants.filter(
    (id) => !currentAssistants.includes(id)
  );
  const assistantsToRemove = currentAssistants.filter(
    (id) => !selectedAssistants.includes(id)
  );

  // Calcular cambios en complementos
  const complementsToAdd = selectedComplements.filter(
    (newComp) =>
      !currentComplements.some(
        (currentComp) =>
          currentComp.id === newComp.id &&
          (newComp.selectedBot
            ? currentComp.selectedBot?.flow_ns === newComp.selectedBot?.flow_ns
            : true)
      )
  );

  const complementsToRemove = currentComplements.filter(
    (currentComp) =>
      !selectedComplements.some(
        (newComp) =>
          newComp.id === currentComp.id &&
          (currentComp.selectedBot
            ? newComp.selectedBot?.flow_ns === currentComp.selectedBot?.flow_ns
            : true)
      )
  );

  const planChange = selectedPlan?.id !== currentPlan ? selectedPlan : null;

  // Simular respuesta del backend con precios y descuentos
  return simulateCalculateChanges({
    assistantsToAdd,
    assistantsToRemove,
    complementsToAdd,
    complementsToRemove,
    planChange,
    currentPlan: subscription.planId,
  });
};

export const hasChanges = (
  selectedAssistants,
  selectedPlan,
  selectedComplements,
  subscription
) => {
  if (!subscription) return false;
  const currentAssistants = subscription.assistants || [];
  const currentComplements = subscription.complements || [];

  const assistantsChanged =
    JSON.stringify(selectedAssistants.sort()) !==
    JSON.stringify(currentAssistants.sort());

  const complementsChanged =
    JSON.stringify(
      selectedComplements
        .map((c) => ({
          id: c.id,
          quantity: c.quantity,
          bot: c.selectedBot?.flow_ns,
        }))
        .sort()
    ) !==
    JSON.stringify(
      currentComplements
        .map((c) => ({
          id: c.id,
          quantity: c.quantity,
          bot: c.selectedBot?.flow_ns,
        }))
        .sort()
    );

  const planChanged = selectedPlan?.id !== subscription.planId;

  return assistantsChanged || planChanged || complementsChanged;
};
