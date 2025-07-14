import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import chatea from "../../assets/chatea.png";
import "./styles/Confirmation.css";
import { useTransactionData } from "./hooks/useTransactionData";
import { TransactionDetails } from "./components/TransactionDetails";
import WalletPaymentModal from "../wallet/WalletPaymentModal";
import {
  LoadingState,
  ErrorState,
  TransactionHeader,
} from "./components/TransactionComponents";

const TransactionConfirmation = () => {
  const location = useLocation();
  const {
    transactionData,
    loading,
    pollingCount,
    showWalletModal,
    showWalletButton,
    handleWalletModalClose,
    handleWalletButtonClick,
  } = useTransactionData(location);

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

  // Generar datos para el modal de Wallet
  const generateWalletPaymentData = () => {
    if (!transactionData) return null;

    return {
      totalUSD: transactionData.amountUSD,
      priceInCOP: transactionData.amountCOP,
      orderDescription: `Transacción ${transactionData.id} - Pago alternativo por Wallet`,
      reference: transactionData.reference,
      formData: transactionData.workspaceData || {
        workspace_id: transactionData.workspace_id || "",
        workspace_name: "N/A",
        owner_email: "N/A",
        owner_name: "N/A",
        phone_number: "N/A",
      },
    };
  };

  // Generar cálculos de pago para el modal
  const generatePaymentCalculations = () => {
    if (!transactionData) return null;

    return {
      totalUSD: transactionData.amountUSD,
      priceInCOP: transactionData.amountCOP,
      isAnnual: transactionData.isAnnual || false,
      totalAnnualSavings: 0,
    };
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
          <TransactionHeader
            transactionData={transactionData}
            showWalletButton={showWalletButton}
            onWalletButtonClick={handleWalletButtonClick}
          />
          <TransactionDetails
            transactionData={transactionData}
            onPrint={handlePrint}
          />
        </div>
      )}

      {/* Modal de Wallet Payment */}
      {transactionData && (
        <WalletPaymentModal
          show={showWalletModal}
          onHide={handleWalletModalClose}
          paymentData={generateWalletPaymentData()}
          selectedPlan={
            transactionData.plan_id
              ? {
                  id: transactionData.plan_id,
                  name: transactionData.plan_id,
                }
              : null
          }
          selectedAssistants={
            transactionData.assistants
              ? transactionData.assistants.map((a) => a.id)
              : []
          }
          selectedComplements={transactionData.complements || []}
          isAssistantsOnly={!transactionData.plan_id}
          paymentCalculations={generatePaymentCalculations()}
        />
      )}
    </div>
  );
};

export default TransactionConfirmation;
