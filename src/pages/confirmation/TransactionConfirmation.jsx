import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import chatea from "../../assets/chatea.png";
import "./Confirmation.css";
import { useTransactionData } from "./hooks/useTransactionData";
import { TransactionDetails } from "./components/TransactionDetails";
import {
  LoadingState,
  ErrorState,
  TransactionHeader,
} from "./components/TransactionComponents";

const TransactionConfirmation = () => {
  const location = useLocation();
  const { transactionData, loading, pollingCount } =
    useTransactionData(location);

  useEffect(() => {
    const originalTitle = document.title;
    return () => {
      document.title = originalTitle;
    };
  }, [transactionData]);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Recibo de Pago - ${transactionData?.id || ""}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  if (loading) {
    return <LoadingState pollingCount={pollingCount} />;
  }

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <img
          src={chatea}
          alt="Chatea Logo"
          className="img-fluid chatea-logo"
          style={{ maxWidth: "220px" }}
        />
      </div>

      {!transactionData ? (
        <ErrorState />
      ) : (
        <div className="confirmation-card p-4 bg-white rounded">
          <TransactionHeader transactionData={transactionData} />
          <TransactionDetails
            transactionData={transactionData}
            onPrint={handlePrint}
          />
        </div>
      )}
    </div>
  );
};

export default TransactionConfirmation;
