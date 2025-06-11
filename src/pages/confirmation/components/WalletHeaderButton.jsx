/* eslint-disable react/prop-types */
import "../styles/WalletHeaderButton.css";

const WalletHeaderButton = ({ onClick, className = "" }) => {
  return (
    <div className={`wallet-header-container ${className}`}>
      <div className="wallet-header-content">
        <div className="wallet-header-message">
          <i className="bx bx-info-circle"></i>
          <span>
            ¿No pudiste completar el pago? Puedes intentar con otra opción
          </span>
        </div>
        <button className="wallet-header-button" onClick={onClick}>
          <i className="bx bx-wallet"></i>
          Pagar con Wallet
        </button>
      </div>
    </div>
  );
};

export default WalletHeaderButton;
