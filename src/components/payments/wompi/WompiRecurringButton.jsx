import { useState } from "react";
import PropTypes from "prop-types";
import wompiLogo from "../../../assets/wompi.png";

const WompiRecurringButton = ({ onPaymentClick, disabled = false }) => {
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
      className={`wompi-recurring-button ${disabled ? "disabled" : ""}`}
      onClick={handleClick}
      disabled={disabled || isLoading}
      style={{
        width: "100%",
        borderRadius: "8px",
        fontWeight: "500",
        letterSpacing: "0.5px",
        backgroundColor: "#009ee3",
        color: "white",
        border: "1px solid #009ee3",
        padding: "12px 16px",
        height: "50px",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
        cursor: disabled || isLoading ? "not-allowed" : "pointer",
        gap: "8px",
      }}
    >
      {isLoading ? (
        <span>Procesando...</span>
      ) : (
        <>
          <img width={22} src={wompiLogo} alt="Wompi" />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span>Pagar con Wompi</span>
            <small style={{ fontSize: "11px", opacity: "0.9" }}>
              Pago Automático Mensual
            </small>
          </div>
        </>
      )}
    </button>
  );
};

WompiRecurringButton.propTypes = {
  onPaymentClick: PropTypes.func,
  disabled: PropTypes.bool,
};

export default WompiRecurringButton;
