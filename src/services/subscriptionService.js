// import { 
//   getSubscriptionByWorkspace, 
//   updateSubscription, 
//   cancelSubscription 
// } from "./newApi/subscriptions";
import { fetchPlans, fetchAssistants, fetchComplements } from "./dataService";
import { getAssistantReference, getComplementReference } from "../utils/constants";

/**
 * Obtiene la suscripción de un workspace
 */
export const getSubscription = async (workspaceId) => {
  try {
    // TODO: Descomentar cuando la API esté lista
    // const response = await getSubscriptionByWorkspace(workspaceId);
    
    // Simulación temporal
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (workspaceId === "123456789") {
      return {
        id: "sub_123456",
        planId: "business",
        planName: "Chatea Pro Start",
        status: "ACTIVE",
        assistants: ["ventas", "carritos"], // IDs de referencia
        complements: [
          {
            id: "webhooks",
            name: "1.000 Webhooks Diarios 🔗",
            quantity: 2,
            priceUSD: 20,
            totalPrice: 40,
            selectedBot: {
              flow_ns: "bot_123",
              name: "Bot Principal",
            },
          },
          {
            id: "bot",
            name: "🤖 1 Bot Adicional 🤖",
            quantity: 1,
            priceUSD: 10,
            totalPrice: 10,
          },
        ],
        monthlyAmount: 69.0,
        nextPaymentDate: "15 de Agosto, 2025",
        createdAt: "2025-07-15",
        workspaceId: workspaceId,
        workspace_name: "Mi Empresa Demo",
        owner_email: "admin@miempresa.com",
        phone: "+57 300 123 4567",
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }
};

/**
 * Actualiza una suscripción
 */
export const updateSubscriptionData = async (workspaceId, updateData) => {
  try {
    // TODO: Descomentar cuando la API esté lista
    // const response = await updateSubscription(workspaceId, updateData);
    
    // Simulación temporal
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (Math.random() > 0.1) {
      console.log("Subscription updated:", { workspaceId, updateData });
      return { success: true };
    } else {
      throw new Error("API Error");
    }
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
};

/**
 * Cancela una suscripción
 */
export const cancelSubscriptionData = async (workspaceId) => {
  try {
    // TODO: Descomentar cuando la API esté lista
    // const response = await cancelSubscription(workspaceId);
    
    // Simulación temporal
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (Math.random() > 0.05) {
      console.log("Subscription canceled:", workspaceId);
      return { success: true };
    } else {
      throw new Error("API Error");
    }
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
};

/**
 * Obtiene todos los planes disponibles
 */
export const getPlans = async () => {
  return await fetchPlans();
};

/**
 * Calcula los cambios en una suscripción
 */
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

  // Análisis detallado de complementos
  const complementsToAdd = [];
  const complementsToRemove = [];
  const complementsToModify = [];

  // Crear mapas para facilitar la comparación
  const currentComplementsMap = new Map();
  currentComplements.forEach(comp => {
    const key = `${comp.id}_${comp.selectedBot?.flow_ns || 'default'}`;
    currentComplementsMap.set(key, comp);
  });

  const selectedComplementsMap = new Map();
  selectedComplements.forEach(comp => {
    const key = `${comp.id}_${comp.selectedBot?.flow_ns || 'default'}`;
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
        newQuantity: selectedComp.quantity
      });
    }
  });

  const planChange = selectedPlan?.id !== currentPlan ? selectedPlan : null;

  return simulateCalculateChanges({
    assistantsToAdd,
    assistantsToRemove,
    complementsToAdd,
    complementsToRemove,
    complementsToModify,
    planChange,
    currentPlan: subscription.planId,
  });
};

/**
 * Simula el cálculo de cambios con precios y descuentos
 */
const simulateCalculateChanges = ({
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
    const assistantPrice = 20 * 0.5; // Prorrateado
    items.push({
      type: "add",
      description: `Agregar asistente ${assistantId}`,
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
    items.push({
      type: "remove",
      description: `Remover asistente ${assistantId}`,
      amount: 0,
      discount: {
        description: `Removido sin reembolso`,
      },
    });
  });

  // Complementos a agregar
  complementsToAdd.forEach((complement) => {
    const complementPrice = complement.totalPrice * 0.5;
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

  // Complementos modificados
  complementsToModify.forEach((modification) => {
    const { complement, originalQuantity, newQuantity } = modification;
    const quantityDiff = newQuantity - originalQuantity;
    
    if (quantityDiff > 0) {
      const additionalPrice = (complement.priceUSD * quantityDiff) * 0.5;
      let description = `Aumentar ${complement.name}`;
      if (complement.selectedBot) {
        description += ` para ${complement.selectedBot.name}`;
      }
      description += ` (${quantityDiff} unidad${quantityDiff > 1 ? 'es' : ''} adicional${quantityDiff > 1 ? 'es' : ''})`;

      items.push({
        type: "add",
        description,
        amount: additionalPrice,
        discount: {
          description: `Prorrateado por 15 días restantes`,
          originalAmount: complement.priceUSD * quantityDiff,
        },
      });
      totalAmount += additionalPrice;
    } else if (quantityDiff < 0) {
      const removedQuantity = Math.abs(quantityDiff);
      let description = `Disminuir ${complement.name}`;
      if (complement.selectedBot) {
        description += ` de ${complement.selectedBot.name}`;
      }
      description += ` (${removedQuantity} unidad${removedQuantity > 1 ? 'es' : ''} menos)`;

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
  };
};

/**
 * Verifica si hay cambios en la suscripción
 */
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

  // Verificación detallada de cambios en complementos
  const complementsChanged = (() => {
    if (selectedComplements.length !== currentComplements.length) {
      return true;
    }

    const currentRep = currentComplements.map(c => ({
      id: c.id,
      quantity: c.quantity,
      bot: c.selectedBot?.flow_ns || null
    })).sort((a, b) => `${a.id}_${a.bot}`.localeCompare(`${b.id}_${b.bot}`));

    const selectedRep = selectedComplements.map(c => ({
      id: c.id,
      quantity: c.quantity,
      bot: c.selectedBot?.flow_ns || null
    })).sort((a, b) => `${a.id}_${a.bot}`.localeCompare(`${b.id}_${b.bot}`));

    return JSON.stringify(currentRep) !== JSON.stringify(selectedRep);
  })();

  const planChanged = selectedPlan?.id !== subscription.planId;

  return assistantsChanged || planChanged || complementsChanged;
};