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

  const handleComplementsChange = useCallback(
    (newComplementsFromComponent) => {
      // Esta función maneja SOLO los complementos nuevos del componente Complements
      // Los complementos actuales se manejan por separado
      if (!subscription) return;

      const currentComplements = subscription.complements || [];

      // Filtrar cuáles de los complementos actuales se mantienen
      const keptCurrentComplements = currentComplements.filter((currentComp) =>
        selectedComplements.some(
          (selComp) =>
            selComp.id === currentComp.id &&
            (currentComp.selectedBot
              ? selComp.selectedBot?.flow_ns ===
                currentComp.selectedBot?.flow_ns
              : true)
        )
      );

      // Los nuevos complementos son todos los que vienen del componente
      const newComplements = newComplementsFromComponent || [];

      // Combinar: complementos actuales mantenidos + todos los nuevos
      setSelectedComplements([...keptCurrentComplements, ...newComplements]);
    },
    [subscription, selectedComplements, setSelectedComplements]
  );

  const handleToggleCurrentComplement = useCallback(
    (complement, isCurrentlySelected) => {
      if (isCurrentlySelected) {
        // Eliminar el complemento
        setSelectedComplements((prev) =>
          prev.filter(
            (selComp) =>
              !(
                selComp.id === complement.id &&
                (complement.selectedBot
                  ? selComp.selectedBot?.flow_ns ===
                    complement.selectedBot?.flow_ns
                  : true)
              )
          )
        );
      } else {
        // Agregar el complemento de vuelta
        setSelectedComplements((prev) => [...prev, complement]);
      }
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

          <br />

          <ComplementsSection
            subscription={subscription}
            selectedComplements={selectedComplements}
            onComplementsChange={handleComplementsChange}
            onToggleCurrentComplement={handleToggleCurrentComplement}
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
            onProceedToPayment={handleProceedToPayment}
            modifying={modifying}
          />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
