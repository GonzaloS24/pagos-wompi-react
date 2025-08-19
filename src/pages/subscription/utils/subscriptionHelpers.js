import {
  fetchPlans,
  fetchAssistants,
  fetchComplements,
} from "../../../services/dataService";
import { PRICING } from "../../../utils/constants";

export const simulateCalculateChanges = async ({
  assistantsToAdd,
  assistantsToRemove,
  complementsToAdd,
  complementsToRemove,
  complementsToModify,
  planChange,
}) => {
  const items = [];
  let totalAmount = 0;

  // Obtener datos dinámicos de la API
  // eslint-disable-next-line no-unused-vars
  const [plans, assistants, complements] = await Promise.all([
    fetchPlans(),
    fetchAssistants(),
    fetchComplements(),
  ]);

  // Cambio de plan - SIEMPRE COBRAMOS EL PRECIO COMPLETO DEL NUEVO PLAN
  if (planChange) {
    const newPlanData = plans.find((p) => p.id === planChange.id);

    if (newPlanData) {
      // Siempre cobramos el precio completo del nuevo plan
      items.push({
        type: "upgrade",
        description: `Upgrade a ${newPlanData.name}`,
        amount: newPlanData.priceUSD,
      });
      totalAmount += newPlanData.priceUSD;
    }
  }

  // Asistentes a agregar - $20 cada uno
  for (const assistantId of assistantsToAdd) {
    // eslint-disable-next-line no-unused-vars
    const assistant = assistants.find((a) => a.id === assistantId);
    const assistantPrice = PRICING.ASSISTANT_PRICE_USD;

    items.push({
      type: "add",
      description: `Agregar asistente: ${assistantId}`,
      amount: assistantPrice,
    });
    totalAmount += assistantPrice;
  }

  // Asistentes a remover - Sin costo
  for (const assistantId of assistantsToRemove) {
    // eslint-disable-next-line no-unused-vars
    const assistant = assistants.find((a) => a.id === assistantId);

    items.push({
      type: "remove",
      description: `Remover asistente: ${assistantId}`,
      amount: 0,
    });
  }

  // Complementos a agregar (completamente nuevos)
  complementsToAdd.forEach((complement) => {
    // Determinar precio según tipo de complemento
    let complementPrice = 10; // Precio por defecto para bot y member
    if (complement.id === "webhooks") {
      complementPrice = 20; // Webhooks cuestan $20
    }

    const totalPrice = complementPrice * (complement.quantity || 1);
    let description = `Agregar ${complement.id}`;

    if (complement.selectedBot) {
      description += ` (bot: ${complement.selectedBot.flow_ns})`;
    }
    if (complement.quantity > 1) {
      description += ` x${complement.quantity}`;
    }

    items.push({
      type: "add",
      description,
      amount: totalPrice,
    });
    totalAmount += totalPrice;
  });

  // Complementos a remover (completamente eliminados) - Sin costo
  complementsToRemove.forEach((complement) => {
    let description = `Remover ${complement.id}`;

    if (complement.selectedBot) {
      description += ` (bot: ${complement.selectedBot.flow_ns})`;
    }
    if (complement.quantity > 1) {
      description += ` x${complement.quantity}`;
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
      // Aumento de cantidad - cobrar solo las unidades adicionales
      let complementPrice = 10;
      if (complement.id === "webhooks") {
        complementPrice = 20;
      }

      const additionalPrice = complementPrice * quantityDiff;
      let description = `Aumentar ${complement.id}`;

      if (complement.selectedBot) {
        description += ` (bot: ${complement.selectedBot.flow_ns})`;
      }
      description += ` +${quantityDiff}`;

      items.push({
        type: "add",
        description,
        amount: additionalPrice,
      });
      totalAmount += additionalPrice;
    } else if (quantityDiff < 0) {
      // Disminución de cantidad - sin costo
      const removedQuantity = Math.abs(quantityDiff);
      let description = `Disminuir ${complement.id}`;

      if (complement.selectedBot) {
        description += ` (bot: ${complement.selectedBot.flow_ns})`;
      }
      description += ` -${removedQuantity}`;

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
