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

// Services
import { validateForm } from "../../services/validation/formValidation";
import {
  formatAssistantsForCreditCard,
  formatComplementsForCreditCard,
} from "../../services/dataService";
import { PAYMENT_PERIODS } from "../../utils/constants";
import { canApplyAnnualDiscount } from "../../utils/discounts";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/components/WompiPayment.css";

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
  const [hasActiveSubscription, setHasActiveSubscription] = useState(null);
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

  // Verificar suscripción activa cuando se confirman los datos
  useEffect(() => {
    if (isDataConfirmed && formData.workspace_id) {
      checkActiveSubscription(formData.workspace_id);
    }
  }, [isDataConfirmed, formData.workspace_id]);

  const checkActiveSubscription = async (workspaceId) => {
    setCheckingSubscription(true);
    try {
      // Simular llamado a API para verificar suscripción
      const hasSubscription = await simulateHasActiveSubscription(workspaceId);
      setHasActiveSubscription(hasSubscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setHasActiveSubscription(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleSubscriptionCanceled = () => {
    setHasActiveSubscription(false);
  };

  // Event handlers
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

          // Si era el asistente gratuito, actualizar el gratuito
          if (freeAssistant === assistantId) {
            if (newSelection.length > 0 && purchaseType === "plan") {
              // El primer asistente restante se vuelve gratuito
              setFreeAssistant(newSelection[0]);
            } else {
              setFreeAssistant(null);
            }
          }

          return newSelection;
        } else {
          const newSelection = [...prevSelected, assistantId];

          // Si es el primer asistente en un plan, se vuelve gratuito
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

    // Resetear el periodo si no se puede aplicar descuento anual
    if (!canApplyAnnualDiscount(type)) {
      setPaymentPeriod(PAYMENT_PERIODS.MONTHLY);
    }

    if (complementsRef.current) {
      complementsRef.current.reset();
    }

    if (type === "plan") {
      // Preseleccionar el asistente de ventas por WhatsApp por defecto
      const defaultAssistant = "ventas";
      setSelectedAssistants([defaultAssistant]);
      setFreeAssistant(defaultAssistant);

      if (urlParams?.plan_id) {
        const plan = plans.find((p) => p.id === urlParams.plan_id);
        setSelectedPlan(plan);
      }
    } else {
      // Para compra solo de asistentes, limpiar selección
      setSelectedAssistants([]);
      setFreeAssistant(null);
      setSelectedPlan(null);
    }
  };

  useEffect(() => {
    resetFreeAssistant();
  }, [resetFreeAssistant]);

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
    setShowWompiWidget(false);
    handleRecurringChange(false);
  };

  // Handler para cambio de periodo
  const handlePeriodChange = (period) => {
    setPaymentPeriod(period);
    setShowWompiWidget(false);

    // Si se cambia a anual, resetear pago recurrente ya que no son compatibles
    if (period === PAYMENT_PERIODS.ANNUAL && enableRecurring) {
      handleRecurringChange(false);
    }
  };

  // Handlers para Wompi tradicional
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

  // Handler para Wompi Recurring
  const handleWompiRecurringClick = async () => {
    try {
      const assistantsForCreditCard = await formatAssistantsForCreditCard(
        selectedAssistants
      );
      const complementsForCreditCard = await formatComplementsForCreditCard(
        selectedComplements
      );

      // Navegar a la nueva página con datos completos usando IDs numéricos
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

  // Handlers para Wallet
  const handleWalletPaymentClick = () => {
    setShowWalletModal(true);
  };

  const handleWalletModalClose = () => {
    setShowWalletModal(false);
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
      return selectedPlan !== null;
    }

    if (purchaseType === "assistants") {
      return selectedAssistants.length > 0 || selectedComplements.length > 0;
    }

    return false;
  };

  // Verificar si el pago recurrente es compatible con plan anual
  const isRecurringCompatibleWithPeriod = () => {
    return paymentPeriod === PAYMENT_PERIODS.MONTHLY;
  };

  // Determinar si es pago recurrente con Wompi
  const isWompiRecurringPayment = () => {
    return (
      selectedGateway === "wompi" &&
      enableRecurring &&
      isRecurringCompatibleWithPeriod() &&
      shouldShowPayButton()
    );
  };

  // Determinar si es pago recurrente con PaymentsWay
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

  // Efecto para resetear pago recurrente si se selecciona plan anual
  useEffect(() => {
    if (paymentPeriod === PAYMENT_PERIODS.ANNUAL && enableRecurring) {
      handleRecurringChange(false);
    }
  }, [paymentPeriod, enableRecurring, handleRecurringChange]);

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
            </div>
          ) : hasActiveSubscription ? (
            // Mostrar panel de gestión de suscripción
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
                onSubscriptionCanceled={handleSubscriptionCanceled}
              />
            </>
          ) : (
            // Mostrar flujo normal de compra
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
                          // Botón de Wompi Recurring
                          <WompiRecurringButton
                            onPaymentClick={handleWompiRecurringClick}
                            disabled={!shouldShowPayButton()}
                          />
                        ) : isPaymentsWayRecurringPayment() ? (
                          // Botón de PaymentsWay Recurring
                          <RecurringPaymentButton
                            planId={selectedPlan.id}
                            enableRecurring={enableRecurring}
                            selectedAssistants={selectedAssistants}
                          />
                        ) : selectedGateway === "wompi" ? (
                          // Wompi normal (widget)
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
                          // Wallet
                          <WalletPaymentButton
                            onPaymentClick={handleWalletPaymentClick}
                            disabled={!shouldShowPayButton()}
                          />
                        ) : (
                          // PaymentsWay normal
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
              )}
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

// === FUNCIÓN SIMULADA DE API ===
const simulateHasActiveSubscription = async (workspaceId) => {
  // Simular delay de API
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simular respuesta: workspace "12345" tiene suscripción activa
  return workspaceId === "123456789";
};

export default PaymentContainer;
