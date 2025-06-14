import { useState, useCallback } from "react";
import { hasRecurringPlan } from "../services/payments/paymentsWay/paymentsWayRecurringConfig";

export const usePaymentMethods = ({
  purchaseType,
  selectedPlan,
  selectedAssistants,
  selectedComplements,
}) => {
  const [selectedGateway, setSelectedGateway] = useState("wompi");
  const [enableRecurring, setEnableRecurring] = useState(false);

  // Determina si se puede mostrar la opción de pago recurrente
  const canShowRecurringOption = useCallback(() => {
    if (purchaseType === "plan") {
      if (!selectedPlan || selectedAssistants.length === 0) {
        return false;
      }

      const additionalAssistants = Math.max(0, selectedAssistants.length - 1);

      const hasRecurringConfig = hasRecurringPlan(
        selectedPlan.id,
        additionalAssistants
      );
      return hasRecurringConfig;
    }

    if (purchaseType === "assistants") {
      return selectedAssistants.length > 0 || selectedComplements.length > 0;
    }

    return false;
  }, [purchaseType, selectedPlan, selectedAssistants, selectedComplements]);

  // Determina si es un pago recurrente
  const isRecurringPayment = useCallback(() => {
    return (
      selectedGateway === "paymentsway" &&
      enableRecurring &&
      canShowRecurringOption()
    );
  }, [selectedGateway, enableRecurring, canShowRecurringOption]);

  // Maneja el cambio de gateway
  const handleGatewayChange = useCallback((gateway) => {
    setSelectedGateway(gateway);
  }, []);

  // Maneja el cambio de recurrente
  const handleRecurringChange = useCallback((isEnabled) => {
    setEnableRecurring(isEnabled);

    // Si se activa el pago recurrente, cambiar automáticamente a Payments Way
    if (isEnabled) {
      setSelectedGateway("paymentsway");
    }
  }, []);

  const resetRecurringIfNeeded = useCallback(() => {
    if (enableRecurring && !canShowRecurringOption()) {
      setEnableRecurring(false);
    }
  }, [enableRecurring, canShowRecurringOption]);

  return {
    selectedGateway,
    enableRecurring,
    canShowRecurringOption: canShowRecurringOption(),
    isRecurringPayment: isRecurringPayment(),
    handleGatewayChange,
    handleRecurringChange,
    resetRecurringIfNeeded,
  };
};
