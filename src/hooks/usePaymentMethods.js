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
    if (purchaseType !== "plan" || !selectedPlan) {
      return false;
    }

    // Solo mostrar si:
    // 1. Hay al menos 1 asistente seleccionado
    // 2. NO hay complementos seleccionados
    const hasAssistants = selectedAssistants.length > 0;
    const noComplements = selectedComplements.length === 0;
    const additionalAssistants = Math.max(0, selectedAssistants.length - 1);

    // Verificar si hay configuración para esta combinación
    // eslint-disable-next-line no-unused-vars
    const hasRecurringConfig = hasRecurringPlan(
      selectedPlan.id,
      additionalAssistants
    );

    const result = hasAssistants && noComplements;
    return result;
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

  // Reset cuando cambian los complementos
  const resetRecurringIfNeeded = useCallback(() => {
    if (selectedComplements.length > 0 && enableRecurring) {
      setEnableRecurring(false);
    }
  }, [selectedComplements, enableRecurring]);

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
