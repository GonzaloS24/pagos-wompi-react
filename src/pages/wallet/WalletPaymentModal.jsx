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
import WalletStepFive from "./components/steps/WalletStepFive";

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
    tipoDocumento,
    videoCompleted,
    selectedCurrency,
    currencyRates,
    errors,
    handleCedulaChange,
    handleTelefonoChange,
    handleDocumentChange,
    handleVideoCompleted,
    handleCurrencyChange,
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
      tipoDocumento,
      selectedCurrency,
      currencyRates,
    };

    switch (currentStep) {
      case 1:
        return (
          <WalletStepOne
            {...commonProps}
            onCurrencyChange={handleCurrencyChange}
            errors={errors}
          />
        );
      case 2:
        return (
          <WalletStepTwo
            {...commonProps}
            onCedulaChange={handleCedulaChange}
            onTelefonoChange={handleTelefonoChange}
            onTipoDocumentoChange={handleDocumentChange}
            errors={errors}
          />
        );
      case 3:
        return <WalletStepThree onVideoCompleted={handleVideoCompleted} />;
      case 4:
        return (
          <WalletStepFour
            {...commonProps}
            copyToClipboard={copyToClipboard}
            copyPurchaseSummary={copyPurchaseSummary}
          />
        );
      case 5:
        return <WalletStepFive {...commonProps} />;
      default:
        return null;
    }
  };

  // Función para determinar si el botón "Siguiente" debe estar deshabilitado
  const isNextButtonDisabled = () => {
    if (currentStep === 3 && !videoCompleted) {
      return true;
    }
    return false;
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      style={{
        "--bs-modal-width": "600px",
      }}
    >
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
              disabled={isNextButtonDisabled()}
              style={{
                backgroundColor: isNextButtonDisabled() ? "#6c757d" : "#009ee3",
                borderColor: isNextButtonDisabled() ? "#6c757d" : "#009ee3",
                padding: "0.5rem 1.5rem",
              }}
            >
              {currentStep === 3 && !videoCompleted ? (
                <>
                  <i className="bx bx-lock me-1"></i>
                  Ver Tutorial Completo
                </>
              ) : (
                "Siguiente"
              )}
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
