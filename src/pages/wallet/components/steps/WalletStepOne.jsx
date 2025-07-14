import PropTypes from "prop-types";
import WalletPaymentSummary from "../WalletPaymentSummary";

const WalletStepOne = ({
  paymentData,
  selectedPlan,
  selectedAssistants,
  selectedComplements,
  isAssistantsOnly,
  paymentCalculations,
  walletData,
}) => {
  return (
    <div>
      <h5 className="text-center mb-3" style={{ color: "#009ee3" }}>
        Paso 1: Revisar tu Compra
      </h5>

      <WalletPaymentSummary
        paymentData={paymentData}
        selectedPlan={selectedPlan}
        selectedAssistants={selectedAssistants}
        selectedComplements={selectedComplements}
        isAssistantsOnly={isAssistantsOnly}
        paymentCalculations={paymentCalculations}
        walletData={walletData}
      />

      <p className="text-center text-muted">
        Verifica que todos los datos sean correctos antes de continuar.
      </p>
    </div>
  );
};

WalletStepOne.propTypes = {
  paymentData: PropTypes.object.isRequired,
  selectedPlan: PropTypes.object,
  selectedAssistants: PropTypes.array.isRequired,
  selectedComplements: PropTypes.array.isRequired,
  isAssistantsOnly: PropTypes.bool.isRequired,
  paymentCalculations: PropTypes.object,
  walletData: PropTypes.object.isRequired,
};

export default WalletStepOne;
