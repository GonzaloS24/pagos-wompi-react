/* eslint-disable react-hooks/exhaustive-deps */
import { Modal, Button } from "react-bootstrap";
import { useEffect } from "react";
import PropTypes from "prop-types";

// Hooks
import { useWalletPayment } from "./hooks/useWalletPayment";

// Components
import WalletStepIndicator from "./components/WalletStepIndicator";
import WalletStepOne from "./components/steps/WalletStepOne";
import WalletStepTwo from "./components/steps/WalletStepTwo";
import WalletStepThree from "./components/steps/WalletStepThree";
import WalletStepFour from "./components/steps/WalletStepFour";

const WalletPaymentModal = ({
  show,
  onHide,
  paymentData,
  selectedPlan,
  selectedAssistants,
  selectedComplements,
  isAssistantsOnly,
  paymentCalculations,
}) => {
  const {
    currentStep,
    totalSteps,
    walletData,
    cedula,
    telefono,
    errors,
    handleCedulaChange,
    handleTelefonoChange,
    handleConfirmPayment,
    copyToClipboard,
    copyPurchaseSummary,
    nextStep,
    prevStep,
    resetSteps,
  } = useWalletPayment(paymentData, onHide);

  useEffect(() => {
    if (show && currentStep !== 1) {
      resetSteps();
    }
  }, [show]);

  const renderStepContent = () => {
    const commonProps = {
      paymentData,
      selectedPlan,
      selectedAssistants,
      selectedComplements,
      isAssistantsOnly,
      paymentCalculations,
      walletData,
      cedula,
      telefono,
    };

    switch (currentStep) {
      case 1:
        return <WalletStepOne {...commonProps} />;
      case 2:
        return (
          <WalletStepFour
            {...commonProps}
            onCedulaChange={handleCedulaChange}
            onTelefonoChange={handleTelefonoChange}
            errors={errors}
          />
        );
      case 3:
        return (
          <WalletStepTwo
            {...commonProps}
            copyToClipboard={copyToClipboard}
            copyPurchaseSummary={copyPurchaseSummary}
          />
        );
      case 4:
        return <WalletStepThree {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "#009ee3" }}>
          Pago por Wallet - Paso {currentStep} de {totalSteps}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <WalletStepIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
        {renderStepContent()}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <Button
          variant="outline-secondary"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Anterior
        </Button>

        <div>
          {currentStep < totalSteps ? (
            <Button
              variant="primary"
              onClick={nextStep}
              style={{
                backgroundColor: "#009ee3",
                borderColor: "#009ee3",
                padding: "0.5rem 1.5rem",
              }}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleConfirmPayment}
              style={{
                backgroundColor: "#009ee3",
                borderColor: "#009ee3",
                padding: "0.5rem 1.5rem",
              }}
            >
              Confirmar Pago
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

WalletPaymentModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  paymentData: PropTypes.object.isRequired,
  selectedPlan: PropTypes.object,
  selectedAssistants: PropTypes.array.isRequired,
  selectedComplements: PropTypes.array.isRequired,
  isAssistantsOnly: PropTypes.bool.isRequired,
  paymentCalculations: PropTypes.object,
};

export default WalletPaymentModal;
