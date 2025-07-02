import { useState, useEffect, useCallback, useMemo } from "react";
import {
  simulateGetSubscription,
  simulateUpdateSubscription,
  simulateCancelSubscription,
} from "../service/subscriptionAPI";
import { calculateChangesWithDiscounts } from "../utils/subscriptionHelpers";
import Swal from "sweetalert2";

export const useSubscription = (workspaceId, onSubscriptionCanceled, productsData) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modifying, setModifying] = useState(false);
  const [selectedAssistants, setSelectedAssistants] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedComplements, setSelectedComplements] = useState([]);

  // MEMOIZAR los productos para evitar re-renders
  const { 
    plansWithDiscounts, 
    assistantsWithDiscounts, 
    addonsWithDiscounts 
  } = useMemo(() => {
    if (!productsData) {
      return {
        plansWithDiscounts: [],
        assistantsWithDiscounts: [],
        addonsWithDiscounts: []
      };
    }
    
    return {
      plansWithDiscounts: productsData.plansWithDiscounts || [],
      assistantsWithDiscounts: productsData.assistantsWithDiscounts || [],
      addonsWithDiscounts: productsData.addonsWithDiscounts || []
    };
  }, [productsData]);

  const fetchSubscriptionData = useCallback(async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("🔄 Fetching subscription data for workspace:", workspaceId);
      const subscriptionData = await simulateGetSubscription(workspaceId);

      if (subscriptionData) {
        console.log("✅ Subscription data loaded:", subscriptionData);
        setSubscription(subscriptionData);

        // IMPORTANTE: Los asistentes en la suscripción siguen siendo nombres (string)
        setSelectedAssistants(subscriptionData.assistants || []);
        
        // Buscar el plan en los datos con discounts SOLO si hay datos disponibles
        if (plansWithDiscounts.length > 0) {
          const planWithDiscounts = plansWithDiscounts.find(
            p => p.id === subscriptionData.planId
          );
          setSelectedPlan(planWithDiscounts || null);
          console.log("✅ Plan loaded:", planWithDiscounts);
        } else {
          // Si no hay planes con discounts, usar estructura básica
          setSelectedPlan({
            id: subscriptionData.planId,
            name: subscriptionData.planName || subscriptionData.planId,
            cost: 0,
            discounts: []
          });
        }

        // Inicializar complementos seleccionados
        if (subscriptionData.complements) {
          setSelectedComplements(subscriptionData.complements);
        }
      } else {
        console.log("❌ No subscription found");
        setSubscription(null);
      }
    } catch (error) {
      console.error("❌ Error fetching subscription:", error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, plansWithDiscounts]);

  // EFECTO INICIAL - solo se ejecuta cuando cambia workspaceId o plansWithDiscounts
  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  // Cálculo de cambios CON DISCOUNTS - MEMOIZADO para evitar recálculos
  const changesSummary = useMemo(() => {
    if (!subscription) {
      return null;
    }
    
    try {
      return calculateChangesWithDiscounts(
        selectedAssistants,
        selectedPlan,
        selectedComplements,
        subscription,
        {
          assistantsWithDiscounts,
          addonsWithDiscounts,
          plansWithDiscounts
        }
      );
    } catch (error) {
      console.error("❌ Error calculating changes:", error);
      return null;
    }
  }, [
    selectedAssistants,
    selectedPlan,
    selectedComplements,
    subscription,
    assistantsWithDiscounts,
    addonsWithDiscounts,
    plansWithDiscounts
  ]);

  const handleSaveChanges = useCallback(
    async (paymentData = null, modifiedData = null) => {
      setModifying(true);

      try {
        // Si se proporcionan datos modificados (con API IDs), usarlos
        const assistantsToUse = modifiedData?.selectedAssistants || selectedAssistants;
        const planToUse = modifiedData?.selectedPlan || selectedPlan;
        const complementsToUse = modifiedData?.selectedComplements || selectedComplements;

        // Determinar si estamos usando API IDs o nombres
        const usingApiIds = modifiedData && modifiedData.selectedAssistants;

        let freeAssistantValue, paidAssistantValues;

        if (usingApiIds) {
          // Trabajar con API IDs (números)
          freeAssistantValue = assistantsToUse.length > 0 ? assistantsToUse[0] : null;
          paidAssistantValues = assistantsToUse.length > 1 ? assistantsToUse.slice(1) : [];
        } else {
          // Trabajar con nombres (strings) - flujo original
          freeAssistantValue = assistantsToUse.length > 0 ? assistantsToUse[0] : null;
          paidAssistantValues = assistantsToUse.length > 1 ? assistantsToUse.slice(1) : [];
        }

        // Mapear complementos (addons)
        const addons = complementsToUse?.map((complement) => ({
          id: complement.apiId || complement.id,
          quantity: complement.quantity || 1,
          ...(complement.id === "webhooks" && complement.selectedBot
            ? { bot_flow_ns: complement.selectedBot.flow_ns }
            : {}),
        })) || [];

        // JSON del estado ORIGINAL
        const originalSubscriptionData = {
          workspace_id: parseInt(subscription.workspaceId) || 0,
          phone: subscription.phone || "",
          plan_id: subscription.planId || null,
          workspace_name: subscription.workspace_name || "",
          owner_email: subscription.owner_email || "",
          free_assistant_id: subscription.assistants?.length > 0 ? subscription.assistants[0] : null,
          paid_assistant_ids: subscription.assistants?.length > 1 ? subscription.assistants.slice(1) : [],
          assistants_only: false,
          addons: subscription.complements?.map((complement) => ({
            id: complement.apiId || complement.id,
            quantity: complement.quantity || 1,
            ...(complement.id === "webhooks" && complement.selectedBot
              ? { bot_flow_ns: complement.selectedBot.flow_ns }
              : {}),
          })) || [],
        };

        // JSON del estado NUEVO con cambios y DISCOUNTS aplicados
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
          
          // NUEVO: Incluir información de discounts para cálculos
          pricing_context: {
            plan_discounts: planToUse?.discounts || [],
            assistants_discounts: assistantsWithDiscounts,
            addons_discounts: addonsWithDiscounts,
            changes_summary: changesSummary
          }
        };

        // Si hay datos de pago, agregar card_details
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
          title: paymentData ? "Datos de Actualización con Pago" : "Datos de Actualización de Suscripción",
          html: `
            <div style="text-align: left; max-height: 500px; overflow-y: auto;">
              <h6 style="color: #dc3545; margin-bottom: 10px;">📋 Datos Originales:</h6>
              <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 11px; text-align: left; margin-bottom: 15px; border-left: 4px solid #dc3545;">
${JSON.stringify(originalSubscriptionData, null, 2)}
              </pre>
              
              <h6 style="color: #28a745; margin-bottom: 10px;">📝 Datos Actualizados con Discounts ${usingApiIds ? "(con API IDs)" : "(con nombres)"}:</h6>
              <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 11px; text-align: left; border-left: 4px solid #28a745;">
${JSON.stringify(updatedSubscriptionData, null, 2)}
              </pre>
              
              ${changesSummary ? `
              <h6 style="color: #17a2b8; margin-top: 15px; margin-bottom: 10px;">💰 Cálculo con Discounts:</h6>
              <div style="background: #e7f3ff; padding: 10px; border-radius: 5px; font-size: 11px; color: #0066cc;">
                Total a pagar: $${changesSummary.totalAmount?.toFixed(2) || '0.00'} USD<br>
                Descuentos aplicados: ${changesSummary.discountsApplied?.length || 0}
              </div>
              ` : ""}
            </div>
          `,
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#009ee3",
          width: "700px",
          customClass: {
            htmlContainer: "text-left",
          },
        });

        // Llamada a la API
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
      changesSummary,
      assistantsWithDiscounts,
      addonsWithDiscounts,
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