/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { transactionService } from "../services/transactionService";

export const useTransactionData = (location) => {
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollingCount, setPollingCount] = useState(0);
  const [pollingTimer, setPollingTimer] = useState(null);

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

  return { transactionData, loading, pollingCount };
};
