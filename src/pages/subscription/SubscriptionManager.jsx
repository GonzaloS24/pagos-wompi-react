/* eslint-disable react/prop-types */
import { useState, useCallback } from "react";
import { cancelSubscriptionData } from "../../services/subscriptionService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import SubscriptionHeader from "./components/SubscriptionHeader";
import CurrentPlanSection from "./components/CurrentPlanSection";
import PlanSelector from "./components/PlanSelector";
import AssistantsSection from "./components/AssistantsSection";
import ComplementsSection from "./components/ComplementsSection";
import ChangesSummary from "./components/ChangesSummary";
import PaymentView from "./components/PaymentView";
import { useSubscription } from "./hooks/useSubscription";
import "./styles/SubscriptionManager.css";
import Swal from "sweetalert2";

const SubscriptionManager = ({ workspaceId, onSubscriptionCanceled }) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const {
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

  const handleProceedToPayment = useCallback(() => {
    if (!changesSummary || changesSummary.totalAmount <= 0) {
      handleSaveChanges();
      return;
    }
    setShowPaymentForm(true);
  }, [changesSummary, handleSaveChanges]);

  const handleCardSubmit = useCallback(
    async (cardData) => {
      const success = await handleSaveChanges(cardData);
      if (success) {
        setShowPaymentForm(false);
      }
    },
    [handleSaveChanges]
  );

  const handleBackFromPayment = useCallback(() => {
    setShowPaymentForm(false);
  }, []);

  // Cancelación real de suscripción
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
        // Llamada real al endpoint de cancelación
        await cancelSubscriptionData(workspaceId);

        // Mostrar alerta de confirmación
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

        // Notificar al componente padre
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

  if (showPaymentForm) {
    return (
      <PaymentView
        changesSummary={changesSummary}
        onBack={handleBackFromPayment}
        onSubmit={handleCardSubmit}
        modifying={modifying}
        usdToCopRate={usdToCopRate}
      />
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
            modifying={modifying}
          />

          <ChangesSummary
            subscription={subscription}
            selectedAssistants={selectedAssistants}
            selectedPlan={selectedPlan}
            selectedComplements={selectedComplements}
            changesSummary={changesSummary}
            calculatingChanges={calculatingChanges}
            onProceedToPayment={handleProceedToPayment}
            modifying={modifying}
            usdToCopRate={usdToCopRate}
          />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
