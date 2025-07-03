import {
  fetchPlans,
  fetchAssistants,
  fetchComplements,
} from "../../../services/dataService";

export const simulateCalculateChanges = async ({
  assistantsToAdd,
  assistantsToRemove,
  complementsToAdd,
  complementsToRemove,
  complementsToModify,
  planChange,
  currentPlan,
}) => {
  const items = [];
  let totalAmount = 0;

  // Obtener datos dinámicos de la API
  const [plans, assistants] = await Promise.all([
    fetchPlans(),
    fetchAssistants(),
    fetchComplements(),
  ]);

  // Cambio de plan
  if (planChange) {
    const currentPlanData = plans.find((p) => p.id === currentPlan);
    const newPlanData = plans.find((p) => p.id === planChange.id);

    if (currentPlanData && newPlanData) {
      const priceDiff = newPlanData.priceUSD - currentPlanData.priceUSD;

      if (priceDiff > 0) {
        // Upgrade
        items.push({
          type: "upgrade",
          description: `Upgrade a ${newPlanData.name}`,
          amount: priceDiff,
        });
        totalAmount += priceDiff;
      } else if (priceDiff < 0) {
        // Downgrade
        items.push({
          type: "downgrade",
          description: `Downgrade a ${newPlanData.name}`,
          amount: 0,
        });
      }
    }
  }

  // Asistentes a agregar
  for (const assistantId of assistantsToAdd) {
    const assistant = assistants.find((a) => a.id === assistantId);
    const assistantPrice = assistant?.cost || 20; // Usar precio de la API o fallback

    items.push({
      type: "add",
      description: `Agregar ${assistant?.label || assistantId}`,
      amount: assistantPrice,
    });
    totalAmount += assistantPrice;
  }

  // Asistentes a remover
  for (const assistantId of assistantsToRemove) {
    const assistant = assistants.find((a) => a.id === assistantId);

    items.push({
      type: "remove",
      description: `Remover ${assistant?.label || assistantId}`,
      amount: 0,
    });
  }

  // Complementos a agregar (completamente nuevos)
  complementsToAdd.forEach((complement) => {
    const complementPrice = complement.totalPrice || complement.priceUSD || 0;
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
    });
    totalAmount += complementPrice;
  });

  // Complementos a remover (completamente eliminados)
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
    });
  });

  // Complementos modificados (cambio de cantidad)
  complementsToModify.forEach((modification) => {
    const { complement, originalQuantity, newQuantity } = modification;
    const quantityDiff = newQuantity - originalQuantity;

    if (quantityDiff > 0) {
      // Aumento de cantidad
      const additionalPrice = (complement.priceUSD || 0) * quantityDiff;
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
      });
      totalAmount += additionalPrice;
    } else if (quantityDiff < 0) {
      // Disminución de cantidad
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
      });
    }
  });

  return {
    items,
    totalAmount: Math.max(0, totalAmount),
  };
};

export const calculateChanges = async (
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

  // Análisis más detallado de complementos
  const complementsToAdd = [];
  const complementsToRemove = [];
  const complementsToModify = [];

  // Crear mapas para facilitar la comparación
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

  // Encontrar complementos completamente nuevos
  selectedComplementsMap.forEach((selectedComp, key) => {
    if (!currentComplementsMap.has(key)) {
      complementsToAdd.push(selectedComp);
    }
  });

  // Encontrar complementos completamente removidos
  currentComplementsMap.forEach((currentComp, key) => {
    if (!selectedComplementsMap.has(key)) {
      complementsToRemove.push(currentComp);
    }
  });

  // Encontrar complementos modificados (cambio de cantidad)
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

  // Llamar a la función con datos dinámicos
  return await simulateCalculateChanges({
    assistantsToAdd,
    assistantsToRemove,
    complementsToAdd,
    complementsToRemove,
    complementsToModify,
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

  // Verificación más detallada de cambios en complementos
  const complementsChanged = (() => {
    if (selectedComplements.length !== currentComplements.length) {
      return true;
    }

    // Crear representaciones comparables
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
