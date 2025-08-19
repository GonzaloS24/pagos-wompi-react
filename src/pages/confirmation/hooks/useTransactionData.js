/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { transactionService } from "../services/transactionService";
import Swal from "sweetalert2";

export const useTransactionData = (location) => {
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollingCount, setPollingCount] = useState(0);
  const [pollingTimer, setPollingTimer] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showWalletButton, setShowWalletButton] = useState(false);

  // Función para mostrar la alerta de pago fallido
  const showPaymentFailedAlert = () => {
    Swal.fire({
      icon: "error",
      title: "Problema con el pago",
      text: "Hubo un problema con el pago, pero si deseas puedes continuar el proceso pagando por Wallet.",
      showCancelButton: true,
      confirmButtonText: "Continuar con Wallet",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#009ee3",
      cancelButtonColor: "#6c757d",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setShowWalletModal(true);
      } else {
        setShowWalletButton(true);
      }
    });
  };

  const handleWalletModalClose = () => {
    setShowWalletModal(false);
  };

  const handleWalletButtonClick = () => {
    setShowWalletModal(true);
  };

  useEffect(() => {
    const startPolling = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const transactionId = params.get("id");
        const env = params.get("env");

        if (!transactionId) {
          setLoading(false);
          return;
        }

        const transactionResult =
          await transactionService.fetchTransactionDetails(
            transactionId,
            env,
            location.search
          );

        if (transactionResult) {
          setTransactionData(transactionResult);

          if (transactionService.isFailedPayment(transactionResult.status)) {
            setLoading(false);
            setTimeout(() => {
              showPaymentFailedAlert();
            }, 500);
            return;
          }

          if (transactionResult.status === "PENDING") {
            const timer = setTimeout(() => {
              setPollingCount((prev) => prev + 1);
            }, 3000);
            setPollingTimer(timer);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in polling:", error);
        setLoading(false);
      }
    };

    startPolling();

    return () => {
      if (pollingTimer) {
        clearTimeout(pollingTimer);
      }
    };
  }, [location]);

  useEffect(() => {
    const handlePolling = async () => {
      if (pollingCount > 0 && pollingCount <= 20) {
        try {
          const params = new URLSearchParams(location.search);
          const transactionId = params.get("id");
          const env = params.get("env");

          const updatedTransaction =
            await transactionService.fetchTransactionDetails(
              transactionId,
              env,
              location.search
            );

          if (updatedTransaction) {
            setTransactionData(updatedTransaction);

            if (transactionService.isFailedPayment(updatedTransaction.status)) {
              setLoading(false);
              setTimeout(() => {
                showPaymentFailedAlert();
              }, 500);
              return;
            }

            if (updatedTransaction.status !== "PENDING" || pollingCount >= 20) {
              setLoading(false);
            } else {
              const timer = setTimeout(() => {
                setPollingCount((prev) => prev + 1);
              }, 3000);
              setPollingTimer(timer);
            }
          } else {
            setLoading(false);
          }
        } catch (error) {
          console.error("Error in polling:", error);
          setLoading(false);
        }
      } else if (pollingCount > 20) {
        setLoading(false);
      }
    };

    if (pollingCount > 0) {
      handlePolling();
    }
  }, [pollingCount, location]);

  return {
    transactionData,
    loading,
    pollingCount,
    showWalletModal,
    showWalletButton,
    handleWalletModalClose,
    handleWalletButtonClick,
  };
};
