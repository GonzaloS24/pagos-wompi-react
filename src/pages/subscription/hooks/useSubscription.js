import { useState, useEffect, useCallback, useMemo } from "react";
import {
  simulateGetSubscription,
  simulateGetPlans,
  simulateUpdateSubscription,
  simulateCancelSubscription,
} from "../service/subscriptionAPI";
import { calculateChanges } from "../utils/subscriptionHelpers";
import Swal from "sweetalert2";

export const useSubscription = (workspaceId, onSubscriptionCanceled) => {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modifying, setModifying] = useState(false);
  const [selectedAssistants, setSelectedAssistants] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedComplements, setSelectedComplements] = useState([]);

  const fetchSubscriptionData = useCallback(async () => {
    setLoading(true);
    try {
      const [subscriptionData, plansData] = await Promise.all([
        simulateGetSubscription(workspaceId),
        simulateGetPlans(),
      ]);

      setSubscription(subscriptionData);
      setPlans(plansData);

      if (subscriptionData) {
        setSelectedAssistants(subscriptionData.assistants || []);
        setSelectedComplements(subscriptionData.complements || []);
        setSelectedPlan(
          plansData.find((p) => p.id === subscriptionData.planId) || null
        );
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  // Memoizar el cálculo de cambios para evitar recalcular innecesariamente
  const changesSummary = useMemo(() => {
    if (!subscription) return null;
    return calculateChanges(
      selectedAssistants,
      selectedPlan,
      selectedComplements,
      subscription
    );
  }, [selectedAssistants, selectedPlan, selectedComplements, subscription]);

  const handleSaveChanges = useCallback(
    async (paymentData = null) => {
      setModifying(true);
      try {
        await simulateUpdateSubscription(workspaceId, {
          assistants: selectedAssistants,
          complements: selectedComplements,
          planId: selectedPlan?.id,
          paymentData,
        });

        Swal.fire({
          icon: "success",
          title: "¡Suscripción Actualizada!",
          text: "Los cambios han sido aplicados exitosamente",
          confirmButtonColor: "#009ee3",
        });

        await fetchSubscriptionData();
        return true;
      } catch (error) {
        console.error("Error updating subscription:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron guardar los cambios. Intenta nuevamente.",
          confirmButtonColor: "#009ee3",
        });
        return false;
      } finally {
        setModifying(false);
      }
    },
    [
      workspaceId,
      selectedAssistants,
      selectedComplements,
      selectedPlan,
      fetchSubscriptionData,
    ]
  );

  const handleCancelSubscription = useCallback(async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Cancelar Suscripción",
      html: `
        <p>¿Estás seguro de que quieres cancelar tu suscripción?</p>
        <p><strong>Esta acción no se puede deshacer.</strong></p>
        <p><small>Tu acceso continuará hasta el final del período pagado.</small></p>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar suscripción",
      cancelButtonText: "No, mantener",
      confirmButtonColor: "#dc3545",
    });

    if (result.isConfirmed) {
      setModifying(true);
      try {
        await simulateCancelSubscription(workspaceId);

        Swal.fire({
          icon: "info",
          title: "Suscripción Cancelada",
          text: "Tu suscripción ha sido cancelada. Tendrás acceso hasta el final del período pagado.",
          confirmButtonColor: "#009ee3",
        });

        onSubscriptionCanceled?.();
      } catch (error) {
        console.error("Error canceling subscription:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cancelar la suscripción. Intenta nuevamente.",
          confirmButtonColor: "#009ee3",
        });
      } finally {
        setModifying(false);
      }
    }
  }, [workspaceId, onSubscriptionCanceled]);

  return {
    subscription,
    plans,
    loading,
    modifying,
    selectedAssistants,
    selectedPlan,
    selectedComplements,
    changesSummary,
    setSelectedAssistants,
    setSelectedPlan,
    setSelectedComplements,
    handleSaveChanges,
    handleCancelSubscription,
  };
};
