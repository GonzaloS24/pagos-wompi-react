import { useCallback, useEffect, useRef, useState } from "react";
import { PuffLoader } from "react-spinners";
import chatea from "../../assets/chatea.png";

// Hooks
import { useWompiPayment } from "../../hooks/useWompiPayment";
import { usePaymentCalculations } from "../../hooks/usePaymentCalculations";
import { usePaymentMethods } from "../../hooks/usePaymentMethods";

// Components
import ConfirmationModal from "../../components/common/ConfirmationModal";
import ConfirmedInfo from "../../components/common/ConfirmedInfo";
import PurchaseTypeSelector from "../../components/forms/PurchaseTypeSelector";
import PlanSelector from "../../components/products/PlanSelector";
import AIAssistants from "../../components/products/AIAssistants";
import Complements from "../../components/products/Complements";
import PaymentSummary from "../../components/payments/PaymentSummary";
import PaymentGatewaySelector from "../../components/payments/PaymentGatewaySelector";
import WompiPaymentButton from "../../components/payments/wompi/WompiPaymentButton";
import WompiWidget from "../../components/payments/wompi/WompiWidget";
import PaymentsWayForm from "../../components/payments/paymentsWay/PaymentsWayForm";
import RecurringPaymentButton from "../../components/payments/paymentsWay/RecurringPaymentButton";
import WalletPaymentButton from "../../components/payments/wallet/WalletPaymentButton";
import WalletPaymentModal from "../../components/payments/wallet/WalletPaymentModal";

// Services
import { validateForm } from "../../services/validation/formValidation";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/components/WompiPayment.css";

const PaymentContainer = () => {
  // Estados locales
  const [selectedAssistants, setSelectedAssistants] = useState([]);
  const [purchaseType, setPurchaseType] = useState(null);
  const [selectedComplements, setSelectedComplements] = useState([]);
  const [showWompiWidget, setShowWompiWidget] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Referencias
  const complementsRef = useRef(null);

  // Custom hooks
  const {
    plans,
    selectedPlan,
    setSelectedPlan,
    usdToCopRate,
    urlParams,
    setUrlParams,
    loading,
    showModal,
    setShowModal,
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    isDataConfirmed,
    setIsDataConfirmed,
  } = useWompiPayment();

  const {
    selectedGateway,
    enableRecurring,
    canShowRecurringOption,
    isRecurringPayment,
    handleGatewayChange,
    handleRecurringChange,
    resetRecurringIfNeeded,
  } = usePaymentMethods({
    purchaseType,
    selectedPlan,
    selectedAssistants,
    selectedComplements,
  });

  const paymentCalculations = usePaymentCalculations({
    purchaseType,
    selectedPlan,
    selectedAssistants,
    selectedComplements,
    usdToCopRate,
    urlParams,
    enableRecurring,
  });

  // Event handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length === 0) {
      setUrlParams({
        ...formData,
        plan_id: urlParams?.plan_id,
      });
      setIsDataConfirmed(true);
      setShowModal(false);
    } else {
      setFormErrors(errors);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setFormErrors({ ...formErrors, [field]: null });
  };

  const handleAssistantChange = useCallback((assistantId) => {
    setSelectedAssistants((prev) => {
      if (prev.includes(assistantId)) {
        if (assistantId === prev[0] && prev.length > 1) {
          const newSelection = [...prev];
          newSelection.splice(prev.indexOf(assistantId), 1);
          return newSelection;
        } else {
          return prev.filter((id) => id !== assistantId);
        }
      } else {
        return [...prev, assistantId];
      }
    });
  }, []);

  const handleComplementsChange = (complements) => {
    setSelectedComplements(complements);
  };

  const handlePurchaseTypeChange = (type) => {
    setPurchaseType(type);
    setSelectedAssistants([]);
    setShowWompiWidget(false);
    handleRecurringChange(false);
    handleGatewayChange("wompi");

    if (complementsRef.current) {
      complementsRef.current.reset();
    }

    if (type === "plan" && urlParams?.plan_id) {
      const plan = plans.find((p) => p.id === urlParams.plan_id);
      setSelectedPlan(plan);
    } else {
      setSelectedPlan(null);
    }
  };

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
    setShowWompiWidget(false);
    handleRecurringChange(false);
  };

  const handleWompiPaymentClick = () => {
    setShowWompiWidget(true);
  };

  const handleWalletPaymentClick = () => {
    setShowWalletModal(true);
  };

  const handleWalletModalClose = () => {
    setShowWalletModal(false);
  };

  const handleWompiWidgetReady = (success) => {
    if (success) {
      setTimeout(() => {
        const container = document.getElementById("wompi-button-container");
        const button = container?.querySelector("button");
        if (button) {
          button.click();
        }
      }, 500);
    }
  };

  // Utility functions
  const shouldShowAssistants = () => {
    if (purchaseType === "assistants") return true;
    if (purchaseType === "plan") return selectedPlan !== null;
    return false;
  };

  const shouldShowPayButton = () => {
    if (!purchaseType) return false;

    if (purchaseType === "plan") {
      return selectedPlan !== null && selectedAssistants.length > 0;
    }

    if (purchaseType === "assistants") {
      return selectedAssistants.length > 0 || selectedComplements.length > 0;
    }

    return false;
  };

  useEffect(() => {
    resetRecurringIfNeeded();
  }, [resetRecurringIfNeeded]);

  if (loading) {
    return (
      <div className="loader-container">
        <PuffLoader
          color="#009ee3"
          loading={true}
          size={60}
          margin={2}
          speedMultiplier={4}
        />
      </div>
    );
  }

  return (
    <div className="container py-4">
      {isDataConfirmed ? (
        <div>
          <figure className="mb-4 text-center">
            <img
              src={chatea}
              alt="Chatea Logo"
              className="img-fluid chatea-logo"
              style={{ maxWidth: "220px" }}
            />
          </figure>

          <PurchaseTypeSelector onSelect={handlePurchaseTypeChange} />

          {purchaseType && (
            <div className="main-container" key="main-content">
              <div className="plan-section">
                {purchaseType === "plan" && (
                  <div className="m-2">
                    <PlanSelector
                      plans={plans}
                      selectedPlan={selectedPlan}
                      onPlanChange={handlePlanChange}
                      disabled={Boolean(urlParams?.plan_id)}
                    />
                  </div>
                )}

                {shouldShowAssistants() && (
                  <div className="selected-plan-content">
                    <AIAssistants
                      selectedAssistants={selectedAssistants}
                      onAssistantChange={handleAssistantChange}
                      isStandalone={purchaseType === "assistants"}
                      workspaceId={formData.workspace_id}
                    />

                    <Complements
                      ref={complementsRef}
                      onComplementsChange={handleComplementsChange}
                      workspaceId={formData.workspace_id}
                    />
                  </div>
                )}
              </div>

              <div className="info-section">
                <ConfirmedInfo formData={formData} />

                {shouldShowAssistants() && (
                  <PaymentSummary
                    selectedPlan={purchaseType === "plan" ? selectedPlan : null}
                    usdToCopRate={usdToCopRate}
                    selectedAssistants={selectedAssistants}
                    isAssistantsOnly={purchaseType === "assistants"}
                    selectedComplements={selectedComplements}
                  />
                )}

                {shouldShowPayButton() && (
                  <div className="mt-4">
                    <PaymentGatewaySelector
                      selectedGateway={selectedGateway}
                      onChange={handleGatewayChange}
                      enableRecurring={enableRecurring}
                      setEnableRecurring={handleRecurringChange}
                      showRecurringOption={canShowRecurringOption}
                      isRecurringPayment={isRecurringPayment}
                    />

                    {isRecurringPayment ? (
                      <RecurringPaymentButton
                        planId={selectedPlan.id}
                        enableRecurring={enableRecurring}
                        selectedAssistants={selectedAssistants}
                      />
                    ) : selectedGateway === "wompi" ? (
                      <>
                        {!showWompiWidget && (
                          <WompiPaymentButton
                            onPaymentClick={handleWompiPaymentClick}
                            disabled={!shouldShowPayButton()}
                          />
                        )}

                        <WompiWidget
                          paymentData={{
                            priceCOPCents: paymentCalculations.priceCOPCents,
                            reference: paymentCalculations.reference,
                          }}
                          isVisible={showWompiWidget}
                          onWidgetReady={handleWompiWidgetReady}
                          shouldUpdate={true}
                        />
                      </>
                    ) : selectedGateway === "wallet" ? (
                      <WalletPaymentButton
                        onPaymentClick={handleWalletPaymentClick}
                        disabled={!shouldShowPayButton()}
                      />
                    ) : (
                      <PaymentsWayForm
                        amount={paymentCalculations.priceInCOP}
                        orderDescription={paymentCalculations.orderDescription}
                        formData={formData}
                        reference={paymentCalculations.reference}
                        enableRecurring={enableRecurring}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-muted" key="waiting-message"></div>
      )}

      <ConfirmationModal
        show={showModal}
        formData={formData}
        formErrors={formErrors}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
      />

      {/* Modal de Wallet Payment */}
      <WalletPaymentModal
        show={showWalletModal}
        onHide={handleWalletModalClose}
        paymentData={{
          totalUSD: paymentCalculations.totalUSD,
          priceInCOP: paymentCalculations.priceInCOP,
          orderDescription: paymentCalculations.orderDescription,
          reference: paymentCalculations.reference,
          formData: formData,
        }}
        selectedPlan={purchaseType === "plan" ? selectedPlan : null}
        selectedAssistants={selectedAssistants}
        selectedComplements={selectedComplements}
        isAssistantsOnly={purchaseType === "assistants"}
      />
    </div>
  );
};

export default PaymentContainer;
