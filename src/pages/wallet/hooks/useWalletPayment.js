import { useState, useCallback } from "react";
import { walletService } from "../../../services/payments/wallet/walletService";
import Swal from "sweetalert2";

export const useWalletPayment = (paymentData, onHide) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const walletData = walletService.createWalletPaymentData(paymentData);

  const handleConfirmPayment = async () => {
    try {
      const result = await walletService.processWalletPayment(walletData);

      if (result.success) {
        onHide();
        await Swal.fire({
          icon: "info",
          title: "Pago en Verificación",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#009ee3",
        });
      }
    } catch (error) {
      console.error("Error processing wallet payment:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al procesar tu solicitud. Por favor intenta nuevamente.",
        confirmButtonColor: "#009ee3",
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: "success",
        title: "Copiado",
        text: "Dirección copiada al portapapeles",
        timer: 1500,
        showConfirmButton: false,
      });
    });
  };

  const copyPurchaseSummary = (summary) => {
    navigator.clipboard.writeText(summary).then(() => {
      Swal.fire({
        icon: "success",
        title: "Resumen Copiado",
        text: "Resumen de compra copiado al portapapeles",
        timer: 1500,
        showConfirmButton: false,
      });
    });
  };

  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      console.log('Advancing from step:', prev, 'to step:', prev + 1);
      return prev < totalSteps ? prev + 1 : prev;
    });
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => prev > 1 ? prev - 1 : prev);
  }, []);

  const resetSteps = useCallback(() => {
    setCurrentStep(1);
  }, []);

  return {
    currentStep,
    totalSteps,
    walletData,
    handleConfirmPayment,
    copyToClipboard,
    copyPurchaseSummary,
    nextStep,
    prevStep,
    resetSteps,
  };
};