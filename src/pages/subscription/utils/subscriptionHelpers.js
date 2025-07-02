// src/pages/subscription/utils/subscriptionHelpers.js - Actualizado para discounts

/**
 * Calcula cambios con discounts aplicados
 */
export const calculateChangesWithDiscounts = (
  selectedAssistants,
  selectedPlan,
  selectedComplements,
  subscription,
  productsWithDiscounts = {}
) => {
  if (!subscription) return null;

  const {
    assistantsWithDiscounts = [],
    addonsWithDiscounts = [],
    plansWithDiscounts = [],
  } = productsWithDiscounts;

  const currentAssistants = subscription.assistants || [];
  const currentComplements = subscription.complements || [];
  const currentPlan = subscription.planId;

  const assistantsToAdd = selectedAssistants.filter(
    (id) => !currentAssistants.includes(id)
  );
  const assistantsToRemove = currentAssistants.filter(
    (id) => !selectedAssistants.includes(id)
  );

  // Análisis de complementos (igual que antes)
  const complementsToAdd = [];
  const complementsToRemove = [];
  const complementsToModify = [];

  const currentComplementsMap = new Map();
  currentComplements.forEach((comp) => {
    const key = `${comp.id}_${comp.selectedBot?.flow_ns || "default"}`;
    currentComplementsMap.set(key, comp);
  });

  const selectedComplementsMap = new Map();
  selectedComplements.forEach((comp) => {
    const key = `${comp.id}_${comp.selectedBot?.flow_ns || "default"}`;
    selectedComplementsMap.set(key, comp);
  });

  selectedComplementsMap.forEach((selectedComp, key) => {
    if (!currentComplementsMap.has(key)) {
      complementsToAdd.push(selectedComp);
    }
  });

  currentComplementsMap.forEach((currentComp, key) => {
    if (!selectedComplementsMap.has(key)) {
      complementsToRemove.push(currentComp);
    }
  });

  selectedComplementsMap.forEach((selectedComp, key) => {
    const currentComp = currentComplementsMap.get(key);
    if (currentComp && selectedComp.quantity !== currentComp.quantity) {
      complementsToModify.push({
        complement: selectedComp,
        originalQuantity: currentComp.quantity,
        newQuantity: selectedComp.quantity,
      });
    }
  });

  const planChange = selectedPlan?.id !== currentPlan ? selectedPlan : null;

  // NUEVO: Calcular con discounts
  return simulateCalculateChangesWithDiscounts({
    assistantsToAdd,
    assistantsToRemove,
    complementsToAdd,
    complementsToRemove,
    complementsToModify,
    planChange,
    currentPlan: subscription.planId,
    assistantsWithDiscounts,
    addonsWithDiscounts,
    plansWithDiscounts,
  });
};

/**
 * Simula el cálculo de cambios CON DISCOUNTS aplicados
 */
export const simulateCalculateChangesWithDiscounts = ({
  assistantsToAdd,
  assistantsToRemove,
  complementsToAdd,
  complementsToRemove,
  complementsToModify,
  planChange,
  currentPlan,
  assistantsWithDiscounts = [],
  addonsWithDiscounts = [],
  plansWithDiscounts = [],
}) => {
  const items = [];
  let totalAmount = 0;
  const discountsApplied = [];

  // Helper para obtener datos con discounts
  const getAssistantWithDiscounts = (assistantName) => {
    return (
      assistantsWithDiscounts.find((a) => a.name === assistantName) || {
        cost: 20,
        discounts: [],
      }
    );
  };

  const getAddonWithDiscounts = (addonId) => {
    return (
      addonsWithDiscounts.find((a) => a.id === addonId) || {
        cost: 10,
        discounts: [],
      }
    );
  };

  const getPlanWithDiscounts = (planId) => {
    return (
      plansWithDiscounts.find((p) => p.id === planId) || {
        cost: 0,
        discounts: [],
      }
    );
  };

  // Función para aplicar descuentos
  const applyDiscounts = (basePrice, discounts, type, itemName) => {
    let finalPrice = basePrice;
    const appliedDiscounts = [];

    discounts.forEach((discount) => {
      if (discount.type === "percentage") {
        const discountAmount = finalPrice * (discount.value / 100);
        finalPrice -= discountAmount;
        appliedDiscounts.push({
          type: "percentage",
          value: discount.value,
          amount: discountAmount,
          description: `${discount.value}% de descuento en ${itemName}`,
        });
      } else if (discount.type === "fixed") {
        const discountAmount = Math.min(discount.value, finalPrice);
        finalPrice -= discountAmount;
        appliedDiscounts.push({
          type: "fixed",
          value: discount.value,
          amount: discountAmount,
          description: `$${discount.value} de descuento en ${itemName}`,
        });
      }
    });

    return {
      originalPrice: basePrice,
      finalPrice: Math.max(0, finalPrice),
      discountsApplied: appliedDiscounts,
    };
  };

  // Cambio de plan CON DISCOUNTS
  if (planChange) {
    const currentPlanData = getPlanWithDiscounts(currentPlan);
    const newPlanData = getPlanWithDiscounts(planChange.id);

    const currentPlanResult = applyDiscounts(
      currentPlanData.cost,
      currentPlanData.discounts,
      "plan",
      `Plan actual`
    );

    const newPlanResult = applyDiscounts(
      newPlanData.cost,
      newPlanData.discounts,
      "plan",
      `Plan ${planChange.name}`
    );

    const priceDiff = newPlanResult.finalPrice - currentPlanResult.finalPrice;

    if (priceDiff > 0) {
      const proratedAmount = priceDiff * 0.5; // Prorrateado
      items.push({
        type: "upgrade",
        description: `Upgrade a ${planChange.name || planChange.id}`,
        amount: proratedAmount,
        originalAmount: priceDiff,
        discountsInfo: {
          current: currentPlanResult,
          new: newPlanResult,
        },
        discount: {
          description: `Prorrateado por 15 días restantes`,
          originalAmount: priceDiff,
        },
      });
      totalAmount += proratedAmount;
      discountsApplied.push(...newPlanResult.discountsApplied);
    } else if (priceDiff < 0) {
      items.push({
        type: "downgrade",
        description: `Downgrade a ${planChange.name || planChange.id}`,
        amount: 0,
        discountsInfo: {
          current: currentPlanResult,
          new: newPlanResult,
        },
        discount: {
          description: `Cambio aplicado sin costo adicional`,
        },
      });
    }
  }

  // Asistentes a agregar CON DISCOUNTS
  assistantsToAdd.forEach((assistantName) => {
    const assistantData = getAssistantWithDiscounts(assistantName);
    const priceResult = applyDiscounts(
      assistantData.cost,
      assistantData.discounts,
      "assistant",
      assistantName
    );

    const assistantPrice = priceResult.finalPrice * 0.5; // Prorrateado

    items.push({
      type: "add",
      description: `Agregar asistente ${assistantName}`,
      amount: assistantPrice,
      originalAmount: priceResult.originalPrice,
      discountsInfo: priceResult,
      discount: {
        description: `Prorrateado por 15 días restantes`,
        originalAmount: priceResult.finalPrice,
      },
    });
    totalAmount += assistantPrice;
    discountsApplied.push(...priceResult.discountsApplied);
  });

  // Asistentes a remover
  assistantsToRemove.forEach((assistantName) => {
    items.push({
      type: "remove",
      description: `Remover asistente ${assistantName}`,
      amount: 0,
      discount: {
        description: `Removido sin reembolso`,
      },
    });
  });

  // Complementos a agregar CON DISCOUNTS
  complementsToAdd.forEach((complement) => {
    const addonData = getAddonWithDiscounts(complement.apiId || complement.id);
    const priceResult = applyDiscounts(
      addonData.cost * complement.quantity,
      addonData.discounts,
      "addon",
      complement.name
    );

    const complementPrice = priceResult.finalPrice * 0.5; // Prorrateado

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
      originalAmount: priceResult.originalPrice,
      discountsInfo: priceResult,
      discount: {
        description: `Prorrateado por 15 días restantes`,
        originalAmount: priceResult.finalPrice,
      },
    });
    totalAmount += complementPrice;
    discountsApplied.push(...priceResult.discountsApplied);
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

  // Complementos modificados CON DISCOUNTS
  complementsToModify.forEach((modification) => {
    const { complement, originalQuantity, newQuantity } = modification;
    const quantityDiff = newQuantity - originalQuantity;

    if (quantityDiff > 0) {
      const addonData = getAddonWithDiscounts(
        complement.apiId || complement.id
      );
      const priceResult = applyDiscounts(
        addonData.cost * quantityDiff,
        addonData.discounts,
        "addon",
        complement.name
      );

      const additionalPrice = priceResult.finalPrice * 0.5; // Prorrateado

      let description = `Aumentar ${complement.name}`;
      if (complement.selectedBot) {
        description += ` para ${complement.selectedBot.name}`;
      }
      description += ` (${quantityDiff} unidad${
        quantityDiff > 1 ? "es" : ""
      } adicional${quantityDiff > 1 ? "es" : ""})`;

      items.push({
        type: "add",
        description,
        amount: additionalPrice,
        originalAmount: priceResult.originalPrice,
        discountsInfo: priceResult,
        discount: {
          description: `Prorrateado por 15 días restantes`,
          originalAmount: priceResult.finalPrice,
        },
      });
      totalAmount += additionalPrice;
      discountsApplied.push(...priceResult.discountsApplied);
    } else if (quantityDiff < 0) {
      const removedQuantity = Math.abs(quantityDiff);
      let description = `Disminuir ${complement.name}`;
      if (complement.selectedBot) {
        description += ` de ${complement.selectedBot.name}`;
      }
      description += ` (${removedQuantity} unidad${
        removedQuantity > 1 ? "es" : ""
      } menos)`;

      items.push({
        type: "remove",
        description,
        amount: 0,
        discount: {
          description: `Removido sin reembolso`,
        },
      });
    }
  });

  return {
    items,
    totalAmount: Math.max(0, totalAmount),
    discountsApplied,
    totalDiscountAmount: discountsApplied.reduce(
      (sum, discount) => sum + discount.amount,
      0
    ),
    originalTotalAmount: items.reduce(
      (sum, item) => sum + (item.originalAmount || item.amount),
      0
    ),
  };
};

// Mantener función original para compatibilidad con flujo normal
export const calculateChanges = (
  selectedAssistants,
  selectedPlan,
  selectedComplements,
  subscription,
  assistants = []
) => {
  // Usar función original sin discounts para flujo normal
  return simulateCalculateChanges({
    assistantsToAdd: selectedAssistants.filter(
      (id) => !subscription.assistants?.includes(id)
    ),
    assistantsToRemove:
      subscription.assistants?.filter(
        (id) => !selectedAssistants.includes(id)
      ) || [],
    complementsToAdd: [],
    complementsToRemove: [],
    complementsToModify: [],
    planChange: selectedPlan?.id !== subscription.planId ? selectedPlan : null,
    currentPlan: subscription.planId,
    assistants,
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

  const complementsChanged = (() => {
    if (selectedComplements.length !== currentComplements.length) {
      return true;
    }

    const currentRep = currentComplements
      .map((c) => ({
        id: c.id,
        quantity: c.quantity,
        bot: c.selectedBot?.flow_ns || null,
      }))
      .sort((a, b) => `${a.id}_${a.bot}`.localeCompare(`${b.id}_${b.bot}`));

    const selectedRep = selectedComplements
      .map((c) => ({
        id: c.id,
        quantity: c.quantity,
        bot: c.selectedBot?.flow_ns || null,
      }))
      .sort((a, b) => `${a.id}_${a.bot}`.localeCompare(`${b.id}_${b.bot}`));

    return JSON.stringify(currentRep) !== JSON.stringify(selectedRep);
  })();

  const planChanged = selectedPlan?.id !== subscription.planId;

  return assistantsChanged || planChanged || complementsChanged;
};
