/* eslint-disable react/prop-types */
import { useState, useCallback } from "react";
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
    handleCancelSubscription,
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

  // Manejar cambios en complementos
  const handleComplementsChange = useCallback(
    (newComplements) => {
      console.log("Cambio en complementos:", newComplements);
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
        {/* Columna Izquierda - Configuración Actual y Modificaciones */}
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

        {/* Columna Derecha - Resumen de Cambios */}
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
