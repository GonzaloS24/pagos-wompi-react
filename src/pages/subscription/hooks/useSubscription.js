/* eslint-disable no-constant-binary-expression */
import { useState, useEffect, useCallback } from "react";
import { fetchUSDtoCOPRate } from "../../../services/api/exchangeRateApi";
import {
  getSubscription,
  getPlans,
} from "../../../services/subscriptionService";
import { calculateChanges } from "../utils/subscriptionHelpers";
import {
  formatAssistantsForCreditCard,
  formatComplementsForCreditCard,
} from "../../../services/dataService";
import Swal from "sweetalert2";

export const useSubscription = (workspaceId, onSubscriptionCanceled) => {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modifying, setModifying] = useState(false);
  const [selectedAssistants, setSelectedAssistants] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedComplements, setSelectedComplements] = useState([]);
  const [changesSummary, setChangesSummary] = useState(null);
  const [calculatingChanges, setCalculatingChanges] = useState(false);
  const [usdToCopRate, setUsdToCopRate] = useState(4200);

  const fetchSubscriptionData = useCallback(async () => {
    setLoading(true);
    try {
      const [subscriptionData, plansData, exchangeRate] = await Promise.all([
        getSubscription(workspaceId),
        getPlans(),
        fetchUSDtoCOPRate(),
      ]);

      console.log("Subscription data received:", subscriptionData);
      console.log("Plans data received:", plansData);

      setSubscription(subscriptionData);
      setPlans(plansData);
      setUsdToCopRate(exchangeRate || 4200);

      if (subscriptionData) {
        console.log("Setting default data from API:");
        console.log("- Assistants:", subscriptionData.assistants);
        console.log("- Plan ID:", subscriptionData.planId);
        console.log("- Complements:", subscriptionData.complements);

        // Establecer datos predeterminados desde la API
        setSelectedAssistants([...subscriptionData.assistants] || []);

        const currentPlan = plansData.find(
          (p) => p.id === subscriptionData.planId
        );
        setSelectedPlan(currentPlan || null);
        console.log("Selected plan set to:", currentPlan);

        setSelectedComplements([...subscriptionData.complements] || []);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  // Efecto para calcular cambios cuando se actualicen los datos seleccionados
  useEffect(() => {
    const calculateChangesSummary = async () => {
      if (!subscription) {
        setChangesSummary(null);
        return;
      }

      // Solo calcular si hay diferencias con los valores originales
      const hasAssistantChanges =
        JSON.stringify(selectedAssistants.sort()) !==
        JSON.stringify((subscription.assistants || []).sort());
      const hasPlanChanges = selectedPlan?.id !== subscription.planId;
      const hasComplementChanges =
        JSON.stringify(selectedComplements) !==
        JSON.stringify(subscription.complements || []);

      if (!hasAssistantChanges && !hasPlanChanges && !hasComplementChanges) {
        setChangesSummary(null);
        return;
      }

      setCalculatingChanges(true);
      try {
        console.log("Calculating changes with:");
        console.log("- Selected assistants:", selectedAssistants);
        console.log("- Original assistants:", subscription.assistants);
        console.log("- Selected plan:", selectedPlan?.id);
        console.log("- Original plan:", subscription.planId);
        console.log("- Selected complements:", selectedComplements);
        console.log("- Original complements:", subscription.complements);

        const summary = await calculateChanges(
          selectedAssistants,
          selectedPlan,
          selectedComplements,
          subscription
        );

        console.log("Changes summary calculated:", summary);
        setChangesSummary(summary);
      } catch (error) {
        console.error("Error calculating changes:", error);
        setChangesSummary(null);
      } finally {
        setCalculatingChanges(false);
      }
    };

    calculateChangesSummary();
  }, [selectedAssistants, selectedPlan, selectedComplements, subscription]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const handleSaveChanges = useCallback(
    async (paymentData = null) => {
      setModifying(true);

      try {
        // Convertir asistentes y complementos a IDs numéricos para la API
        const assistantsForAPI = await formatAssistantsForCreditCard(
          selectedAssistants
        );
        const complementsForAPI = await formatComplementsForCreditCard(
          selectedComplements
        );

        // Mapear asistentes separando gratis vs pagados
        const freeAssistantId =
          assistantsForAPI.length > 0 ? assistantsForAPI[0] : null;
        const paidAssistantIds =
          assistantsForAPI.length > 1 ? assistantsForAPI.slice(1) : [];

        // JSON del estado ORIGINAL de la suscripción (con IDs numéricos)
        const originalAssistantsForAPI = await formatAssistantsForCreditCard(
          subscription.assistants || []
        );
        const originalComplementsForAPI = await formatComplementsForCreditCard(
          subscription.complements || []
        );

        const originalSubscriptionData = {
          workspace_id: parseInt(subscription.workspaceId) || 0,
          phone: subscription.phone || "",
          plan_id: subscription.planId || null,
          workspace_name: subscription.workspace_name || "",
          owner_email: subscription.owner_email || "",
          free_assistant_id:
            originalAssistantsForAPI.length > 0
              ? originalAssistantsForAPI[0]
              : null,
          paid_assistant_ids:
            originalAssistantsForAPI.length > 1
              ? originalAssistantsForAPI.slice(1)
              : [],
          assistants_only: false,
          addons: originalComplementsForAPI,
        };

        // JSON del estado NUEVO con los cambios aplicados (con IDs numéricos)
        const updatedSubscriptionData = {
          workspace_id: parseInt(subscription.workspaceId) || 0,
          phone: subscription.phone || "",
          plan_id: selectedPlan?.id || subscription.planId,
          workspace_name: subscription.workspace_name || "",
          owner_email: subscription.owner_email || "",
          free_assistant_id: freeAssistantId,
          paid_assistant_ids: paidAssistantIds,
          assistants_only: false,
          addons: complementsForAPI,
        };

        // Si hay datos de pago (cuando se requiere pago), agregar card_details
        if (paymentData) {
          updatedSubscriptionData.card_details = {
            exp_date: {
              year: parseInt(paymentData.exp_year),
              month: parseInt(paymentData.exp_month),
            },
            card_holder: paymentData.card_holder,
            card_number: paymentData.number,
            cvv: paymentData.cvc,
          };
        }

        // Mostrar JSON estructurado antes de enviar
        await Swal.fire({
          icon: "info",
          title: paymentData
            ? "Datos de Actualización con Pago"
            : "Datos de Actualización de Suscripción",
          html: `
            <div style="text-align: left; max-height: 500px; overflow-y: auto;">
              <h6 style="color: #dc3545; margin-bottom: 10px;">📋 Datos Originales:</h6>
              <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 11px; text-align: left; margin-bottom: 15px; border-left: 4px solid #dc3545;">
${JSON.stringify(originalSubscriptionData, null, 2)}
              </pre>
              
              <h6 style="color: #28a745; margin-bottom: 10px;">📝 Datos Actualizados:</h6>
              <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 11px; text-align: left; border-left: 4px solid #28a745;">
${JSON.stringify(updatedSubscriptionData, null, 2)}
              </pre>

              ${changesSummary?.totalAmount > 0 ? `
                <h6 style="color: #009ee3; margin-bottom: 10px;">💰 Resumen de Costos:</h6>
                <div style="background: #edf4ff; padding: 10px; border-radius: 5px; border-left: 4px solid #009ee3;">
                  <p><strong>Total a pagar:</strong> $${changesSummary.totalAmount.toFixed(2)} USD</p>
                  <p><strong>En pesos colombianos:</strong> $${Math.round(changesSummary.totalAmount * usdToCopRate).toLocaleString()} COP</p>
                </div>
              ` : ''}
            </div>
          `,
          confirmButtonText: "Continuar",
          confirmButtonColor: "#009ee3",
          width: "700px",
          customClass: {
            htmlContainer: "text-left",
          },
        });

        // COMENTAR ESTA LÍNEA PARA NO HACER LLAMADAS REALES A LA API
        // await updateSubscriptionData(workspaceId, {
        //   original: originalSubscriptionData,
        //   updated: updatedSubscriptionData,
        // });

        console.log("=== DATOS QUE SE ENVIARÍAN AL BACKEND ===");
        console.log("Original:", originalSubscriptionData);
        console.log("Updated:", updatedSubscriptionData);
        console.log("Payment Data:", paymentData);
        console.log("Changes Summary:", changesSummary);
        console.log("============================================");

        Swal.fire({
          icon: "success",
          title: "¡Cambios Aplicados!",
          text: paymentData 
            ? `Pago de $${changesSummary.totalAmount.toFixed(2)} USD procesado correctamente`
            : "Los cambios han sido aplicados exitosamente",
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
      subscription,
      selectedAssistants,
      selectedComplements,
      selectedPlan,
      fetchSubscriptionData,
      changesSummary,
      usdToCopRate,
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
        // COMENTAR ESTA LÍNEA PARA NO HACER LLAMADAS REALES A LA API
        // await cancelSubscriptionData(workspaceId);

        console.log("=== CANCELACIÓN DE SUSCRIPCIÓN ===");
        console.log("Workspace ID:", workspaceId);
        console.log("===================================");

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
    calculatingChanges,
    usdToCopRate,
    setSelectedAssistants,
    setSelectedPlan,
    setSelectedComplements,
    handleSaveChanges,
    handleCancelSubscription,
  };
};