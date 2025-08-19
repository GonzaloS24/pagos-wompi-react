/* eslint-disable react/prop-types */
import { PuffLoader } from "react-spinners";
import WalletHeaderButton from "./WalletHeaderButton";

export const LoadingState = ({ pollingCount }) => (
  <div className="loader-container">
    <PuffLoader
      color="#009ee3"
      loading={true}
      size={60}
      margin={2}
      speedMultiplier={4}
    />
    {pollingCount > 0 && (
      <p className="polling-message">
        Verificando el estado de tu pago...
        {pollingCount > 5 && " Esto puede tomar unos momentos."}
      </p>
    )}
  </div>
);

export const ErrorState = () => (
  <div className="confirmation-card p-4 bg-white rounded">
    <div className="error-icon-container">
      <i className="bx bx-error-circle error-icon"></i>
    </div>
    <h2 className="text-center">Información No Disponible</h2>
    <p className="text-center text-muted">
      No se pudieron obtener los detalles de la transacción
    </p>
    <div className="text-center mt-4">
      <button
        className="btn-primary"
        onClick={() => (window.location.href = "/")}
      >
        Volver al inicio
      </button>
    </div>
  </div>
);

export const TransactionHeader = ({
  transactionData,
  showWalletButton,
  onWalletButtonClick,
}) => {
  const isSuccessful = transactionData?.status === "APPROVED";
  const isPending = transactionData?.status === "PENDING";
  const isFailed = ["DECLINED", "ERROR", "VOIDED"].includes(
    transactionData?.status
  );

  return (
    <>
      <div className="text-center mb-4">
        {isSuccessful ? (
          <>
            <div className="success-icon-container">
              <i className="bx bx-check-circle success-icon"></i>
            </div>
            <h2 className="confirmation-title">
              {transactionData.statusMessage}
            </h2>
            <p className="text-muted">
              Tu pago ha sido procesado correctamente
            </p>
          </>
        ) : isPending ? (
          <>
            <div className="pending-icon-container">
              <i className="bx bx-time pending-icon"></i>
            </div>
            <h2 className="confirmation-title pending-title">
              {transactionData.statusMessage}
            </h2>
            <p className="text-muted">
              Tu pago está siendo procesado. Esto puede tomar unos minutos.
            </p>
            <p className="refresh-hint">
              <i className="bx bx-refresh"></i> Puedes actualizar esta página en
              unos momentos para ver el estado actualizado.
            </p>
          </>
        ) : (
          <>
            <div className="error-icon-container">
              <i className="bx bx-x-circle error-icon"></i>
            </div>
            <h2 className="confirmation-title">
              {transactionData.statusMessage}
            </h2>
            <p className="text-muted">Hubo un problema con tu pago</p>

            {/* Botón de Wallet justo después del mensaje de error */}
            {isFailed && showWalletButton && (
              <div className="mt-3">
                <WalletHeaderButton onClick={onWalletButtonClick} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Alerta de pago recurrente inválido solo si no es tarjeta */}
      {isSuccessful &&
        transactionData.recurring &&
        transactionData.paymentMethod !== "CARD" && (
          <div className="recurring-payment-alert">
            <span>
              <strong>Nota importante:</strong> Has solicitado un pago
              recurrente, pero el método de pago utilizado (
              {transactionData.paymentMethodName}) no es compatible con esta
              función. Los pagos recurrentes solo son posibles con tarjetas.
            </span>
          </div>
        )}
    </>
  );
};
