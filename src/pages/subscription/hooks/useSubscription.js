import { useState, useEffect, useCallback, useMemo } from "react";
import {
  simulateGetSubscription,
  simulateGetPlans,
  simulateUpdateSubscription,
  simulateCancelSubscription,
} from "../service/subscriptionAPI";
import { calculateChanges } from "../utils/subscriptionHelpers";
import { useAssistants } from "../../../hooks/useAssistants"; // IMPORTAR HOOK
import Swal from "sweetalert2";

export const useSubscription = (workspaceId, onSubscriptionCanceled) => {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modifying, setModifying] = useState(false);
  const [selectedAssistants, setSelectedAssistants] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedComplements, setSelectedComplements] = useState([]);

  // USAR HOOK DE ASISTENTES
  const { assistants } = useAssistants();

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
        // IMPORTANTE: Los asistentes en la suscripción siguen siendo nombres (string)
        // para mantener compatibilidad con el resto del sistema
        setSelectedAssistants(subscriptionData.assistants || []);
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
      subscription,
      assistants // PASAR ASISTENTES AL HELPER
    );
  }, [
    selectedAssistants,
    selectedPlan,
    selectedComplements,
    subscription,
    assistants,
  ]);

  const handleSaveChanges = useCallback(
    async (paymentData = null, modifiedData = null) => {
      setModifying(true);

      try {
        // Si se proporcionan datos modificados (con API IDs), usarlos
        // De lo contrario, usar los datos actuales del estado
        const assistantsToUse =
          modifiedData?.selectedAssistants || selectedAssistants;
        const planToUse = modifiedData?.selectedPlan || selectedPlan;
        const complementsToUse =
          modifiedData?.selectedComplements || selectedComplements;

        // Determinar si estamos usando API IDs o nombres
        const usingApiIds = modifiedData && modifiedData.selectedAssistants;

        let freeAssistantValue, paidAssistantValues;

        if (usingApiIds) {
          // Trabajar con API IDs (números)
          freeAssistantValue =
            assistantsToUse.length > 0 ? assistantsToUse[0] : null;
          paidAssistantValues =
            assistantsToUse.length > 1 ? assistantsToUse.slice(1) : [];
        } else {
          // Trabajar con nombres (strings) - flujo original
          freeAssistantValue =
            assistantsToUse.length > 0 ? assistantsToUse[0] : null;
          paidAssistantValues =
            assistantsToUse.length > 1 ? assistantsToUse.slice(1) : [];
        }

        // Mapear complementos (addons)
        const addons =
          complementsToUse?.map((complement) => ({
            id: complement.id,
            quantity: complement.quantity || 1,
            // Incluir bot_flow_ns si es webhook y tiene selectedBot
            ...(complement.id === "webhooks" && complement.selectedBot
              ? {
                  bot_flow_ns: complement.selectedBot.flow_ns,
                }
              : {}),
          })) || [];

        // JSON del estado ORIGINAL de la suscripción
        const originalSubscriptionData = {
          workspace_id: parseInt(subscription.workspaceId) || 0,
          phone: subscription.phone || "",
          plan_id: subscription.planId || null,
          workspace_name: subscription.workspace_name || "",
          owner_email: subscription.owner_email || "",
          free_assistant_id:
            subscription.assistants?.length > 0
              ? subscription.assistants[0]
              : null,
          paid_assistant_ids:
            subscription.assistants?.length > 1
              ? subscription.assistants.slice(1)
              : [],
          assistants_only: false,
          addons:
            subscription.complements?.map((complement) => ({
              id: complement.id,
              quantity: complement.quantity || 1,
              ...(complement.id === "webhooks" && complement.selectedBot
                ? {
                    bot_flow_ns: complement.selectedBot.flow_ns,
                  }
                : {}),
            })) || [],
        };

        // JSON del estado NUEVO con los cambios aplicados
        const updatedSubscriptionData = {
          workspace_id: parseInt(subscription.workspaceId) || 0,
          phone: subscription.phone || "",
          plan_id: planToUse?.id || subscription.planId,
          workspace_name: subscription.workspace_name || "",
          owner_email: subscription.owner_email || "",
          free_assistant_id: freeAssistantValue,
          paid_assistant_ids: paidAssistantValues,
          assistants_only: false,
          addons: addons,
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
              
              <h6 style="color: #28a745; margin-bottom: 10px;">📝 Datos Actualizados ${
                usingApiIds ? "(con API IDs)" : "(con nombres)"
              }:</h6>
              <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 11px; text-align: left; border-left: 4px solid #28a745;">
${JSON.stringify(updatedSubscriptionData, null, 2)}
              </pre>
              
              ${
                usingApiIds
                  ? `
              <h6 style="color: #17a2b8; margin-top: 15px; margin-bottom: 10px;">🔄 Nota:</h6>
              <div style="background: #e7f3ff; padding: 10px; border-radius: 5px; font-size: 11px; color: #0066cc;">
                Los asistentes se enviaron usando API IDs (números) para el backend
              </div>
              `
                  : ""
              }
            </div>
          `,
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#009ee3",
          width: "700px",
          customClass: {
            htmlContainer: "text-left",
          },
        });

        // Llamada comentada a la API
        /*
        const response = await fetch('/api/subscriptions/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            original: originalSubscriptionData,
            updated: updatedSubscriptionData
          })
        });

        if (!response.ok) {
          throw new Error('Error updating subscription');
        }

        const result = await response.json();
        */

        // Simulación del llamado a la API
        await simulateUpdateSubscription(workspaceId, {
          original: originalSubscriptionData,
          updated: updatedSubscriptionData,
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
      subscription,
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
