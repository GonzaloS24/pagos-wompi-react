import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import WompiRecurringButton from "../../components/payments/wompi/WompiRecurringButton";
import PaymentsWayForm from "../../components/payments/paymentsWay/PaymentsWayForm";
import RecurringPaymentButton from "../../components/payments/paymentsWay/RecurringPaymentButton";
import WalletPaymentButton from "../../components/payments/wallet/WalletPaymentButton";
import WalletPaymentModal from "../../components/payments/wallet/WalletPaymentModal";
import SubscriptionManager from "../subscription/SubscriptionManager";
import CanceledSubscriptionView from "./CanceledSubscriptionView";

// Services
import { validateForm } from "../../services/validation/formValidation";
import { getSubscription } from "../../services/subscriptionService";
import {
  formatAssistantsForCreditCard,
  formatComplementsForCreditCard,
} from "../../services/dataService";
import { PAYMENT_PERIODS } from "../../utils/constants";
import { canApplyAnnualDiscount } from "../../utils/discounts";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/components/WompiPayment.css";
import Swal from "sweetalert2";

const PaymentContainer = () => {
  const navigate = useNavigate();

  // Estados locales
  const [selectedAssistants, setSelectedAssistants] = useState([]);
  const [purchaseType, setPurchaseType] = useState(null);
  const [selectedComplements, setSelectedComplements] = useState([]);
  const [showWompiWidget, setShowWompiWidget] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [freeAssistant, setFreeAssistant] = useState(null);

  // Estado para manejo de suscripciones
  const [subscription, setSubscription] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

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
    paymentPeriod,
    setPaymentPeriod,
  } = useWompiPayment();

  const {
    selectedGateway,
    enableRecurring,
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
    paymentPeriod,
    freeAssistant,
  });

  // Verificar suscripción cuando se confirman los datos
  useEffect(() => {
    if (isDataConfirmed && formData.workspace_id) {
      checkSubscription(formData.workspace_id);
    }
  }, [isDataConfirmed, formData.workspace_id]);

  const checkSubscription = async (workspaceId) => {
    setCheckingSubscription(true);
    try {
      const subscriptionData = await getSubscription(workspaceId);
      console.log('120  >>>>>>>>> ', subscriptionData);
      setSubscription(subscriptionData);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscription(null);
    } finally {
      setCheckingSubscription(false);
    }
  };

  // Handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length === 0) {
      setUrlParams({
        ...formData,
        plan_id: urlParams?.plan_id,
        period: paymentPeriod,
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

  const handleAssistantChange = useCallback(
    (assistantId) => {
      setSelectedAssistants((prevSelected) => {
        const isCurrentlySelected = prevSelected.includes(assistantId);

        if (isCurrentlySelected) {
          const newSelection = prevSelected.filter((id) => id !== assistantId);
          if (freeAssistant === assistantId) {
            if (newSelection.length > 0 && purchaseType === "plan") {
              setFreeAssistant(newSelection[0]);
            } else {
              setFreeAssistant(null);
            }
          }
          return newSelection;
        } else {
          const newSelection = [...prevSelected, assistantId];
          if (prevSelected.length === 0 && purchaseType === "plan") {
            setFreeAssistant(assistantId);
          }
          return newSelection;
        }
      });
    },
    [freeAssistant, purchaseType]
  );

  const resetFreeAssistant = useCallback(() => {
    if (purchaseType === "plan" && selectedAssistants.length > 0) {
      setFreeAssistant(selectedAssistants[0]);
    } else {
      setFreeAssistant(null);
    }
  }, [purchaseType, selectedAssistants]);

  const handleComplementsChange = (complements) => {
    setSelectedComplements(complements);
  };

  const handlePurchaseTypeChange = (type) => {
    setPurchaseType(type);
    setShowWompiWidget(false);
    handleRecurringChange(false);
    handleGatewayChange("wompi");

    if (!canApplyAnnualDiscount(type)) {
      setPaymentPeriod(PAYMENT_PERIODS.MONTHLY);
    }

    if (complementsRef.current) {
      complementsRef.current.reset();
    }

    if (type === "plan") {
      const defaultAssistant = "ventas";
      setSelectedAssistants([defaultAssistant]);
      setFreeAssistant(defaultAssistant);

      if (urlParams?.plan_id) {
        const plan = plans.find((p) => p.id === urlParams.plan_id);
        setSelectedPlan(plan);
      }
    } else if (type === "assistants") {
      setSelectedAssistants([]);
      setFreeAssistant(null);
      setSelectedPlan(null);
    }
    // Para type === "subscription" no hacemos nada, se maneja en CanceledSubscriptionView
  };

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
    setShowWompiWidget(false);
    handleRecurringChange(false);
  };

  const handlePeriodChange = (period) => {
    setPaymentPeriod(period);
    setShowWompiWidget(false);

    if (period === PAYMENT_PERIODS.ANNUAL && enableRecurring) {
      handleRecurringChange(false);
    }
  };

  const handleWompiPaymentClick = () => {
    setShowWompiWidget(true);
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

  const handleWompiRecurringClick = async () => {
    try {
      const assistantsForCreditCard = await formatAssistantsForCreditCard(
        selectedAssistants
      );
      const complementsForCreditCard = await formatComplementsForCreditCard(
        selectedComplements
      );

      navigate("/recurring-payment", {
        state: {
          paymentCalculations,
          formData,
          selectedPlan: purchaseType === "plan" ? selectedPlan : null,
          selectedAssistants: assistantsForCreditCard,
          selectedComplements: complementsForCreditCard,
          purchaseType,
        },
      });
    } catch (error) {
      console.error("Error formatting data for credit card:", error);
    }
  };

  const handleWalletPaymentClick = () => {
    setShowWalletModal(true);
  };

  const handleWalletModalClose = () => {
    setShowWalletModal(false);
  };

  const handleReactivateSubscription = async () => {
    await Swal.fire({
      icon: "info",
      title: "Funcionalidad Próximamente",
      text: "La reactivación de suscripciones estará disponible muy pronto.",
      confirmButtonColor: "#009ee3",
    });
  };

  // Utility functions
  const shouldShowAssistants = () => {
    if (purchaseType === "assistants") return true;
    if (purchaseType === "plan") return selectedPlan !== null;
    return false;
  };

  const shouldShowPayButton = () => {
    if (!purchaseType || purchaseType === "subscription") return false;

    if (purchaseType === "plan") {
      return selectedPlan !== null;
    }

    if (purchaseType === "assistants") {
      return selectedAssistants.length > 0 || selectedComplements.length > 0;
    }

    return false;
  };

  const isRecurringCompatibleWithPeriod = () => {
    return paymentPeriod === PAYMENT_PERIODS.MONTHLY;
  };

  const isWompiRecurringPayment = () => {
    return (
      selectedGateway === "wompi" &&
      enableRecurring &&
      isRecurringCompatibleWithPeriod() &&
      shouldShowPayButton()
    );
  };

  const isPaymentsWayRecurringPayment = () => {
    return (
      selectedGateway === "paymentsway" &&
      enableRecurring &&
      isRecurringCompatibleWithPeriod() &&
      shouldShowPayButton()
    );
  };

  useEffect(() => {
    resetRecurringIfNeeded();
  }, [resetRecurringIfNeeded]);

  useEffect(() => {
    if (paymentPeriod === PAYMENT_PERIODS.ANNUAL && enableRecurring) {
      handleRecurringChange(false);
    }
  }, [paymentPeriod, enableRecurring, handleRecurringChange]);

  useEffect(() => {
    resetFreeAssistant();
  }, [resetFreeAssistant]);

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
          {checkingSubscription ? (
            <div className="loader-container">
              <PuffLoader
                color="#009ee3"
                loading={true}
                size={60}
                margin={2}
                speedMultiplier={4}
              />
              <p className="loading-message mt-3 text-center text-muted">
                Verificando tu suscripción...
              </p>
            </div>
          ) : subscription?.status === "ACTIVE" ? (
            // Mostrar panel de gestión de suscripción activa
            <>
              <figure className="mb-4 text-center">
                <img
                  src={chatea}
                  alt="Chatea Logo"
                  className="img-fluid chatea-logo"
                  style={{ maxWidth: "220px" }}
                />
              </figure>

              <SubscriptionManager
                workspaceId={formData.workspace_id}
                onSubscriptionCanceled={() =>
                  setSubscription({ ...subscription, status: "INACTIVE" })
                }
              />
            </>
          ) : (
            // Mostrar flujo normal de compra (incluye INACTIVE y null)
            <div>
              <figure className="mb-4 text-center">
                <img
                  src={chatea}
                  alt="Chatea Logo"
                  className="img-fluid chatea-logo"
                  style={{ maxWidth: "220px" }}
                />
              </figure>

              <PurchaseTypeSelector
                onSelect={handlePurchaseTypeChange}
                inactiveSubscription={
                  subscription?.status === "INACTIVE" ? subscription : null
                }
              />

              {purchaseType === "subscription" && subscription ? (
                // Vista de suscripción cancelada
                <CanceledSubscriptionView
                  subscription={subscription}
                  onReactivate={handleReactivateSubscription}
                />
              ) : purchaseType && purchaseType !== "subscription" ? (
                <div className="main-container" key="main-content">
                  <div className="plan-section">
                    {purchaseType === "plan" && (
                      <div className="m-2">
                        <PlanSelector
                          plans={plans}
                          selectedPlan={selectedPlan}
                          onPlanChange={handlePlanChange}
                          paymentPeriod={paymentPeriod}
                          onPeriodChange={handlePeriodChange}
                          planSelectorDisabled={Boolean(urlParams?.plan_id)}
                          periodToggleDisabled={false}
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
                        selectedPlan={
                          purchaseType === "plan" ? selectedPlan : null
                        }
                        usdToCopRate={usdToCopRate}
                        selectedAssistants={selectedAssistants}
                        isAssistantsOnly={purchaseType === "assistants"}
                        selectedComplements={selectedComplements}
                        paymentCalculations={paymentCalculations}
                      />
                    )}

                    {shouldShowPayButton() && (
                      <div className="mt-4">
                        <PaymentGatewaySelector
                          selectedGateway={selectedGateway}
                          onChange={handleGatewayChange}
                          enableRecurring={
                            enableRecurring && isRecurringCompatibleWithPeriod()
                          }
                          setEnableRecurring={handleRecurringChange}
                          showRecurringOption={
                            shouldShowPayButton() &&
                            isRecurringCompatibleWithPeriod()
                          }
                          isRecurringPayment={
                            enableRecurring &&
                            selectedGateway === "wompi" &&
                            isRecurringCompatibleWithPeriod()
                          }
                        />

                        {/* Lógica de botones de pago */}
                        {isWompiRecurringPayment() ? (
                          <WompiRecurringButton
                            onPaymentClick={handleWompiRecurringClick}
                            disabled={!shouldShowPayButton()}
                          />
                        ) : isPaymentsWayRecurringPayment() ? (
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
                                priceCOPCents:
                                  paymentCalculations.priceCOPCents,
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
                            orderDescription={
                              paymentCalculations.orderDescription
                            }
                            formData={formData}
                            reference={paymentCalculations.reference}
                            enableRecurring={
                              enableRecurring &&
                              isRecurringCompatibleWithPeriod()
                            }
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-muted" key="waiting-message"></div>
      )}

      {/* Modal de confirmación inicial */}
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
        paymentCalculations={paymentCalculations}
      />
    </div>
  );
};

export default PaymentContainer;
