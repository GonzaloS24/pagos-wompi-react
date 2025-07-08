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
 * Obtiene la suscripción de un workspace (ACTIVE o INACTIVE)
 */
export const getSubscription = async (workspaceId) => {
  try {
    const response = await getSubscriptionByWorkspace(workspaceId);

    if (
      response &&
      (response.status === "ACTIVE" || response.status === "CANCELED")
    ) {
      // eslint-disable-next-line no-unused-vars
      const [plans, assistants, complements] = await Promise.all([
        fetchPlans(),
        fetchAssistants(),
        fetchComplements(),
      ]);

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
            const complement = complements.find((c) => c.apiId === addon.id);

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

      // Calcular fecha de expiración
      const expirationDate = new Date(response.nextBillingAt);
      const isExpired = expirationDate < new Date();

      return {
        id: `${response.workspaceId}`,
        planId: response.planId,
        planName: plan?.name || response.planId,
        status: response.status,
        assistants: allAssistantIds,
        complements: mappedComplements,
        monthlyAmount: plan?.priceUSD || 0,
        nextPaymentDate: expirationDate.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        expirationDate: expirationDate,
        isExpired,
        createdAt: new Date().toISOString().split("T")[0],
        workspaceId: response.workspaceId.toString(),
        workspace_name: `Workspace ${response.workspaceId}`,
        owner_email: response.email,
        phone: "+57 300 000 0000",
        flowNs: response.flowNs,
        freeAssistantId: response.freeAssistantId,
        paidAssistantIds: response.paidAssistantIds || [],
        addons: response.addons || [],
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }
};

/**
 * Cancela una suscripción
 */
export const cancelSubscriptionData = async (workspaceId) => {
  try {
    await cancelSubscription(workspaceId);
    console.log("Subscription canceled:", workspaceId);
    return { success: true };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
};

export const updateSubscriptionData = async (workspaceId, updateData) => {
  try {
    const response = await updateSubscription(workspaceId, updateData);
    console.log("Subscription updated:", { workspaceId, updateData });
    return { success: true, data: response };
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
};

export const getPlans = async () => {
  return await fetchPlans();
};

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
