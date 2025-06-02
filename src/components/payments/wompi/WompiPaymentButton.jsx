import { useState } from "react";
import PropTypes from "prop-types";
import wompiLogo from "../../../assets/wompi.png";

const WompiPaymentButton = ({ onPaymentClick, disabled = false }) => {
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
      className={`wompi-button-custom ${disabled ? "disabled" : ""}`}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <span>Procesando...</span>
      ) : (
        <>
          <img width={22} src={wompiLogo} alt="Wompi" />
          Paga con Wompi
        </>
      )}
    </button>
  );
};

WompiPaymentButton.propTypes = {
  onPaymentClick: PropTypes.func,
  disabled: PropTypes.bool,
};

export default WompiPaymentButton;
