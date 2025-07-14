import { useState } from "react";
import PropTypes from "prop-types";

const WalletPaymentButton = ({ onPaymentClick, disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      await onPaymentClick?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`wallet-button-custom ${disabled ? "disabled" : ""}`}
      onClick={handleClick}
      disabled={disabled || isLoading}
      style={{
        width: "100%",
        borderRadius: "8px",
        fontWeight: "500",
        letterSpacing: "0.5px",
        backgroundColor: "#40c4cc",
        color: "white",
        border: "1px solid #40c4cc",
        padding: "8px 16px",
        height: "40px",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {isLoading ? (
        <span>Procesando...</span>
      ) : (
        <>
          <i className="bx bx-wallet"></i>­­­ ­Pagar con Wallet
        </>
      )}
    </button>
  );
};

WalletPaymentButton.propTypes = {
  onPaymentClick: PropTypes.func,
  disabled: PropTypes.bool,
};

export default WalletPaymentButton;
