/* eslint-disable react/prop-types */
import { useState, useCallback } from "react";
import {
  cancelSubscriptionData,
  updateSubscriptionData,
} from "../../services/subscriptionService";
import { subscriptionPaymentService } from "../../services/subscriptionPaymentService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import CreditCardForm from "../../components/payments/wompi/CreditCardForm";
import SubscriptionHeader from "./components/SubscriptionHeader";
import CurrentPlanSection from "./components/CurrentPlanSection";
import PlanSelector from "./components/PlanSelector";
import AssistantsSection from "./components/AssistantsSection";
import ComplementsSection from "./components/ComplementsSection";
import ChangesSummary from "./components/ChangesSummary";
import { useSubscription } from "./hooks/useSubscription";
import "./styles/SubscriptionManager.css";
import Swal from "sweetalert2";

const SubscriptionManager = ({ workspaceId, onSubscriptionCanceled }) => {
  const [modifying, setModifying] = useState(false);
  const [showPaymentUpdate, setShowPaymentUpdate] = useState(false);

  const {
    subscription,
    plans,
    loading,
    selectedAssistants,
    selectedPlan,
    selectedComplements,
    changesSummary,
    calculatingChanges,
    usdToCopRate,
    setSelectedAssistants,
    setSelectedPlan,
    setSelectedComplements,
  } = useSubscription(workspaceId, onSubscriptionCanceled);

  const handleAssistantChange = useCallback(
    (assistantId) => {
      setSelectedAssistants((prev) => {
        if (prev.includes(assistantId)) {
          return prev.filter((id) => id !== assistantId);
        } else {
          return [...prev, assistantId];
        }
      });
    },
    [setSelectedAssistants]
  );

  const handleComplementsChange = useCallback(
    (newComplements) => {
      setSelectedComplements(newComplements || []);
    },
    [setSelectedComplements]
  );

  // Función para manejar actualización de método de pago
  const handleUpdatePaymentMethod = useCallback(
    async (cardData) => {
      if (!subscription?.owner_email) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo obtener el email del propietario de la suscripción",
          confirmButtonColor: "#009ee3",
        });
        return;
      }

      setModifying(true);

      try {
        const result = await subscriptionPaymentService.updatePaymentMethod(
          workspaceId,
          cardData,
          subscription.owner_email
        );

        if (result.success) {
          await Swal.fire({
            icon: "success",
            title: "¡Método de Pago Actualizado!",
            text: "Tu tarjeta ha sido actualizada exitosamente.",
            confirmButtonColor: "#009ee3",
          });

          window.location.reload();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error al Actualizar",
            text: result.error || "No se pudo actualizar el método de pago",
            confirmButtonColor: "#009ee3",
          });
        }
      } catch (error) {
        console.error("Error updating payment method:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error inesperado. Por favor intenta nuevamente.",
          confirmButtonColor: "#009ee3",
        });
      } finally {
        setModifying(false);
      }
    },
    [workspaceId, subscription]
  );

  // Función modificada para estructurar el JSON con old/new
  const prepareUpdateData = async () => {
    try {
      // Importar funciones de formateo
      const { formatAssistantsForCreditCard, formatComplementsForCreditCard } =
        await import("../../services/dataService");

      // Convertir asistentes originales a IDs numéricos
      const originalAssistantsForAPI = await formatAssistantsForCreditCard(
        subscription.assistants || []
      );
      const originalComplementsForAPI = await formatComplementsForCreditCard(
        subscription.complements || []
      );

      // Convertir asistentes seleccionados a IDs numéricos
      const selectedAssistantsForAPI = await formatAssistantsForCreditCard(
        selectedAssistants
      );
      const selectedComplementsForAPI = await formatComplementsForCreditCard(
        selectedComplements
      );

      // Datos originales (old)
      const oldData = {
        plan_id: subscription.planId || null,
        free_assistant_id:
          originalAssistantsForAPI.length > 0
            ? originalAssistantsForAPI[0]
            : undefined,
        paid_assistants_ids:
          originalAssistantsForAPI.length > 1
            ? originalAssistantsForAPI.slice(1)
            : [],
        addons: originalComplementsForAPI,
      };

      // Datos nuevos (new)
      const newData = {
        plan_id: selectedPlan?.id || subscription.planId,
        free_assistant_id:
          selectedAssistantsForAPI.length > 0
            ? selectedAssistantsForAPI[0]
            : undefined,
        paid_assistants_ids:
          selectedAssistantsForAPI.length > 1
            ? selectedAssistantsForAPI.slice(1)
            : [],
        addons: selectedComplementsForAPI,
      };

      return {
        owner_email: subscription.owner_email,
        old: oldData,
        new: newData,
      };
    } catch (error) {
      console.error("Error preparing update data:", error);
      throw error;
    }
  };

  const handleUpdateSubscription = useCallback(async () => {
    if (!changesSummary) return;

    const hasPayment = changesSummary.totalAmount > 0;
    const totalCOP = hasPayment
      ? Math.round(changesSummary.totalAmount * usdToCopRate)
      : 0;

    try {
      // Preparar datos estructurados
      const updateData = await prepareUpdateData();

      // Log para debugging
      console.log("=== DATOS PARA ENVIAR AL BACKEND ===");
      console.log("Workspace ID:", workspaceId);
      console.log("Update Data:", JSON.stringify(updateData, null, 2));
      console.log("Changes Summary:", changesSummary);
      console.log("=======================================");

      // Mostrar alerta simple según el caso
      const result = await Swal.fire({
        icon: hasPayment ? "warning" : "question",
        title: hasPayment ? "Confirmar Pago Adicional" : "Confirmar Cambios",
        html: hasPayment
          ? `
            <div style="text-align: center;">
              <p>Se aplicará un cargo adicional a tu tarjeta registrada:</p>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #009ee3; margin: 0;">${changesSummary.totalAmount.toFixed(
                  2
                )} USD</h3>
                <p style="color: #6c757d; margin: 5px 0 0 0;">${totalCOP.toLocaleString()} COP</p>
              </div>
              <p style="font-size: 14px; color: #6c757d;">¿Deseas continuar?</p>
            </div>
          `
          : `
            <div style="text-align: center;">
              <p>¿Estás seguro de que deseas aplicar estos cambios a tu suscripción?</p>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="color: #28a745; margin: 0; font-weight: 500;">Sin costo adicional</p>
              </div>
            </div>
          `,
        confirmButtonText: hasPayment ? "Confirmar y Pagar" : "Aplicar Cambios",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        confirmButtonColor: "#009ee3",
        cancelButtonColor: "#6c757d",
        width: "450px",
      });

      if (result.isConfirmed) {
        setModifying(true);

        try {
          // Llamada real al backend
          await updateSubscriptionData(workspaceId, updateData);

          // Mostrar alerta de proceso en curso
          await Swal.fire({
            icon: "info",
            title: "Procesando Cambios",
            html: `
              <div style="text-align: center;">
                <p><strong>Tus cambios están siendo procesados.</strong></p>
                <br>
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                  <p style="color: #856404; margin: 0;">⏳ <strong>Tiempo estimado:</strong> 2-5 minutos</p>
                  <p style="color: #856404; margin: 10px 0 0 0;">📧 Recibirás un email confirmando si el proceso fue exitoso o rechazado.</p>
                </div>
                <br>
              </div>
            `,
            confirmButtonText: "Continuar",
            confirmButtonColor: "#009ee3",
            allowOutsideClick: false,
            allowEscapeKey: false,
          });

          window.location.reload();
        } catch (error) {
          console.error("Error updating subscription:", error);
          Swal.fire({
            icon: "error",
            title: "Error al Actualizar",
            text: "No se pudieron aplicar los cambios. Por favor intenta nuevamente.",
            confirmButtonColor: "#009ee3",
          });
        } finally {
          setModifying(false);
        }
      }
    } catch (error) {
      console.error("Error preparing update:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron preparar los datos para la actualización.",
        confirmButtonColor: "#009ee3",
      });
    }
  }, [
    workspaceId,
    subscription,
    selectedAssistants,
    selectedComplements,
    selectedPlan,
    changesSummary,
    usdToCopRate,
  ]);

  const handleCancelSubscription = useCallback(async () => {
    if (!subscription) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "Cancelar Suscripción",
      html: `
        <div style="text-align: center;">
          <p>¿Estás seguro de que quieres cancelar tu suscripción?</p>
          <br>
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h6 style="color: #856404;">Los servicios estarán activos hasta:</h6>
            <p style="color: #856404;"><strong>${subscription.nextPaymentDate}</strong></p>
          </div>
          <br>
          <p><small>Esta acción no se puede deshacer.</small></p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar suscripción",
      cancelButtonText: "No, mantener activa",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#009ee3",
      width: "500px",
    });

    if (result.isConfirmed) {
      try {
        await cancelSubscriptionData(workspaceId);

        await Swal.fire({
          icon: "success",
          title: "Suscripción Cancelada",
          html: `
            <div style="text-align: center;">
              <p><strong>Tu suscripción ha sido cancelada exitosamente.</strong></p>
              <br>
              <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
                <p style="color: #2e7d32; margin: 0;">
                  <strong>📅 Servicios activos hasta: ${subscription.nextPaymentDate}</strong>
                </p>
                <p style="color: #2e7d32; margin: 10px 0 0 0;">
                  Después de esta fecha, tu plan y asistentes se desactivarán automáticamente.
                </p>
              </div>
            </div>
          `,
          confirmButtonText: "Entendido",
          confirmButtonColor: "#009ee3",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        onSubscriptionCanceled?.();
      } catch (error) {
        console.error("Error canceling subscription:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cancelar la suscripción. Por favor, intenta nuevamente o contacta soporte.",
          confirmButtonColor: "#009ee3",
        });
      }
    }
  }, [workspaceId, subscription, onSubscriptionCanceled]);

  if (loading) {
    return <LoadingSpinner message="Cargando tu suscripción..." />;
  }

  if (!subscription) {
    return (
      <div className="no-subscription">
        <div className="text-center">
          <i
            className="bx bx-info-circle"
            style={{ fontSize: "3rem", color: "#009ee3" }}
          ></i>
          <h4>No tienes una suscripción activa</h4>
          <p className="text-muted">
            Puedes crear una nueva suscripción desde la página principal.
          </p>
        </div>
      </div>
    );
  }

  if (showPaymentUpdate) {
    return (
      <div className="subscription-manager">
        <div className="payment-update-section">
          <CreditCardForm
            onSubmit={handleUpdatePaymentMethod}
            loading={modifying}
            onCancel={() => setShowPaymentUpdate(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-manager">
      <SubscriptionHeader />

      <div className="subscription-content">
        <div className="subscription-left">
          <PlanSelector
            plans={plans}
            selectedPlan={selectedPlan}
            onPlanChange={setSelectedPlan}
          />

          <AssistantsSection
            subscription={subscription}
            selectedAssistants={selectedAssistants}
            onAssistantChange={handleAssistantChange}
          />

          <ComplementsSection
            subscription={subscription}
            selectedComplements={selectedComplements}
            onComplementsChange={handleComplementsChange}
            workspaceId={workspaceId}
          />
        </div>

        <div className="subscription-right">
          <CurrentPlanSection
            subscription={subscription}
            onCancelSubscription={handleCancelSubscription}
            onUpdatePayment={() => setShowPaymentUpdate(true)}
            modifying={modifying}
          />

          <ChangesSummary
            subscription={subscription}
            selectedAssistants={selectedAssistants}
            selectedPlan={selectedPlan}
            selectedComplements={selectedComplements}
            changesSummary={changesSummary}
            calculatingChanges={calculatingChanges}
            onProceedToPayment={handleUpdateSubscription}
            modifying={modifying}
            usdToCopRate={usdToCopRate}
          />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
