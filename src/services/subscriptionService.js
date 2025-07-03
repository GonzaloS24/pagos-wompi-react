import {
  getSubscriptionByWorkspace,
  updateSubscription,
  cancelSubscription,
} from "./newApi/subscriptions";
import { fetchPlans, fetchAssistants, fetchComplements } from "./dataService";
import { calculateChanges as calculateChangesHelper } from "../pages/subscription/utils/subscriptionHelpers";
import {
  getAssistantReference,
  getComplementReference,
} from "../utils/constants";

/**
 * Obtiene la suscripción de un workspace
 */
export const getSubscription = async (workspaceId) => {
  try {
    // Llamada a la API real
    const response = await getSubscriptionByWorkspace(workspaceId);

    if (response && response.status === "ACTIVE") {
      // Obtener datos adicionales para mapear IDs a nombres
      const [plans, complements] = await Promise.all([
        fetchPlans(),
        fetchAssistants(),
        fetchComplements(),
      ]);

      // Mapear plan
      const plan = plans.find((p) => p.id === response.planId);

      // Mapear asistentes: combinar gratuito + pagados
      const allAssistantIds = [];
      if (response.freeAssistantId) {
        const freeAssistantRef = getAssistantReference(
          response.freeAssistantId
        );
        allAssistantIds.push(freeAssistantRef);
      }
      if (response.paidAssistantIds && response.paidAssistantIds.length > 0) {
        const paidAssistantRefs = response.paidAssistantIds.map((id) =>
          getAssistantReference(id)
        );
        allAssistantIds.push(...paidAssistantRefs);
      }

      // Mapear complementos/addons
      const mappedComplements = response.addons
        ? response.addons.map((addon) => {
            const complementRef = getComplementReference(addon.id);
            const complement = complements.find((c) => c.id === complementRef);

            return {
              id: complementRef,
              name: complement?.name || `Complemento ${addon.id}`,
              quantity: addon.quantity,
              priceUSD: complement?.priceUSD || 0,
              totalPrice: (complement?.priceUSD || 0) * addon.quantity,
              selectedBot: addon.botFlowNs
                ? {
                    flow_ns: addon.botFlowNs,
                    name: `Bot ${addon.botFlowNs}`,
                  }
                : null,
            };
          })
        : [];

      return {
        id: `sub_${response.workspaceId}`,
        planId: response.planId,
        planName: plan?.name || response.planId,
        status: response.status,
        assistants: allAssistantIds, // IDs de referencia (ventas, carritos, etc.)
        complements: mappedComplements,
        monthlyAmount: plan?.priceUSD || 0,
        nextPaymentDate: new Date(response.nextBillingAt).toLocaleDateString(
          "es-ES",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        ),
        createdAt: new Date().toISOString().split("T")[0],
        workspaceId: response.workspaceId.toString(),
        workspace_name: `Workspace ${response.workspaceId}`,
        owner_email: response.email,
        phone: "+57 300 000 0000", // No viene en la API, valor por defecto
        flowNs: response.flowNs,
        // Datos adicionales para el hook
        freeAssistantId: response.freeAssistantId,
        paidAssistantIds: response.paidAssistantIds || [],
        addons: response.addons || [],
      };
    }

    return null; // No hay suscripción activa
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return null; // En caso de error, asumir que no hay suscripción
  }
};

/**
 * Actualiza una suscripción
 */
export const updateSubscriptionData = async (workspaceId, updateData) => {
  try {
    // Ahora usa la API real a través de Axios centralizado
    const response = await updateSubscription(workspaceId, updateData);

    console.log("Subscription updated:", { workspaceId, updateData });
    return { success: true, data: response };
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
    // Ahora usa la API real a través de Axios centralizado
    await cancelSubscription(workspaceId);

    console.log("Subscription canceled:", workspaceId);
    return { success: true };
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
 * Calcula los cambios en una suscripción usando el helper actualizado
 */
export const calculateChanges = async (
  selectedAssistants,
  selectedPlan,
  selectedComplements,
  subscription
) => {
  return await calculateChangesHelper(
    selectedAssistants,
    selectedPlan,
    selectedComplements,
    subscription
  );
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
