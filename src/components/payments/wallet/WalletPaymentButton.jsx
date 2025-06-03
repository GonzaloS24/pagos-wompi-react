import { useState } from "react";
import PropTypes from "prop-types";
import walletIcon from "../../../assets/wallet-icon.png";

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
        backgroundColor: "#6f42c1",
        color: "white",
        border: "1px solid #6f42c1",
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
          <img src={walletIcon} width={20} />
          Pagar con Wallet
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
