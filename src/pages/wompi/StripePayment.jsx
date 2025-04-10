import { useCallback, useRef, useState } from "react";
import { PuffLoader } from "react-spinners";
import chatea from "../../assets/chatea.png";
import { useStripePayment } from "../../hooks/useStripePayment";
import {
  validateForm,
  convertUSDtoCOPCents,
  generateReference,
} from "../../utils/stripeHelpers";
import ConfirmationModal from "../../components/ConfirmationModal";
import PaymentSummary from "../../components/PaymentSummary";
import AIAssistants from "../../components/AIAssistants";
import PurchaseTypeSelector from "../../components/PurchaseTypeSelector";
import "bootstrap/dist/css/bootstrap.min.css";
import "./StripePayment.css";
import ConfirmedInfo from "../../components/ConfirmedInfo";
import Complements from "../../components/Complements";
import Swal from "sweetalert2";
// import TestTransactionPanel from "../confirmation/TestTransactionPanel";

const StripePayment = () => {
  const [selectedAssistants, setSelectedAssistants] = useState([]);
  const [purchaseType, setPurchaseType] = useState(null);
  const complementsRef = useRef(null);
  const [selectedComplements, setSelectedComplements] = useState([]);
  const [enableRecurringPayment, setEnableRecurringPayment] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
  } = useStripePayment();

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

  const handleComplementsChange = (complements) => {
    setSelectedComplements(complements);
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

  const handlePurchaseTypeChange = (type) => {
    setPurchaseType(type);
    setSelectedAssistants([]);

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

  // Determinar si mostrar los asistentes y complementos
  const shouldShowAssistants = () => {
    if (purchaseType === "assistants") return true;
    if (purchaseType === "plan") return selectedPlan !== null;
    return false;
  };

  // Determinar si mostrar el botón de pago
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

  // Función para manejar el pago con Stripe
  const handleStripePayment = async () => {
    if (!shouldShowPayButton()) return;

    // Si no marcaron la casilla de pago recurrente, preguntar si desean activarlo
    if (!enableRecurringPayment) {
      const { isConfirmed } = await Swal.fire({
        title: "¿Deseas activar el pago automático mensual?",
        html: `
          <div style="text-align: center; margin-bottom: 1rem; margin-top: 1rem;">
            <p>Los pagos automáticos solo están disponibles con tarjetas de crédito o débito.</p>
            <p>Activar esta opción permitirá que los cobros se realicen de forma automática, autorizando cargos mensuales a tu tarjeta para renovar tu compra.</p>
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#009ee3",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, activar pago automático",
        cancelButtonText: "No, pago único",
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
      });

      setEnableRecurringPayment(isConfirmed);
      if (isConfirmed) {
        proceedWithPayment(true); // Pago recurrente
      } else {
        proceedWithPayment(false); // Pago único
      }
    } else {
      proceedWithPayment(true);
    }
  };

  const proceedWithPayment = async (isRecurring) => {
    try {
      setIsProcessingPayment(true);

      const assistantPrice = 20;
      let totalAssistantsPrice;
      if (purchaseType === "plan") {
        const freeAssistants = selectedAssistants.length > 0 ? 1 : 0;
        const paidAssistants = Math.max(
          0,
          selectedAssistants.length - freeAssistants
        );
        totalAssistantsPrice = paidAssistants * assistantPrice;
      } else {
        totalAssistantsPrice = selectedAssistants.length * assistantPrice;
      }

      const planPrice = purchaseType === "plan" ? selectedPlan.priceUSD : 0;

      // Cálculo del precio total de los complementos
      const totalComplementsPrice = selectedComplements.reduce(
        (total, complement) => total + complement.totalPrice,
        0
      );

      // Suma total en USD
      const totalUSD = planPrice + totalAssistantsPrice + totalComplementsPrice;

      // Convertir a COP
      const priceCOPCents = convertUSDtoCOPCents(totalUSD, usdToCopRate);

      // Generar la referencia que contiene toda la información del pedido
      const reference = generateReference(
        purchaseType,
        selectedPlan,
        formData.workspace_id,
        formData.workspace_name,
        formData.owner_email,
        formData.phone_number,
        selectedAssistants,
        selectedComplements,
        isRecurring
      );

      console.log("206  >>>>>>>>> ", reference);

      // Preparar los items para enviar a Stripe
      let items = [];

      // Agregar plan si corresponde
      if (purchaseType === "plan" && selectedPlan) {
        items.push({
          id: selectedPlan.id,
          name: `Plan ${selectedPlan.name}`,
          price: priceCOPCents,
          quantity: 1,
        });
      }

      // Agregar asistentes como items separados si estamos solo comprando asistentes
      if (purchaseType === "assistants" && selectedAssistants.length > 0) {
        items.push({
          id: "assistants",
          name: `Asistentes de IA (${selectedAssistants.length})`,
          price: convertUSDtoCOPCents(totalAssistantsPrice, usdToCopRate),
          quantity: 1,
        });
      }

      // Si no hay items (caso de solo complementos), agregar uno genérico
      if (items.length === 0 && selectedComplements.length > 0) {
        items.push({
          id: "complements",
          name: "Complementos",
          price: convertUSDtoCOPCents(totalComplementsPrice, usdToCopRate),
          quantity: 1,
        });
      }

      // Llamar al endpoint correcto según si es pago único o recurrente
      const endpoint = isRecurring
        ? "http://localhost:4000/create-subscription"
        : "http://localhost:4000/create-checkout-session";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          customerEmail: formData.owner_email,
          metadata: {
            reference,
            workspace_id: formData.workspace_id,
            purchaseType,
            isRecurring,
          },
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No se recibió la URL de checkout de Stripe");
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al procesar el pago. Por favor, intenta nuevamente.",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

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
                    <p style={{ color: "#009ee3" }} className=" mb-3">
                      Todos los planes incluyen por defecto el Asistente
                      Logístico (confirmación, seguimiento y novedad)
                    </p>
                    <select
                      className="form-select form-select-lg mb-3 "
                      onChange={(e) => {
                        const plan = plans.find((p) => p.id === e.target.value);
                        setSelectedPlan(plan);
                      }}
                      value={selectedPlan?.id || ""}
                      disabled={Boolean(urlParams?.plan_id)}
                    >
                      <option value="">Seleccionar plan</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - {plan.bot_users} usuarios
                        </option>
                      ))}
                    </select>
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
                <div className="mt-4">
                  {shouldShowPayButton() && (
                    <>
                      {/* Checkbox para habilitar pago recurrente */}
                      <div className="alert alert-info mb-3 p-3">
                        <div className="tooltip-container d-flex align-items-center">
                          <input
                            type="checkbox"
                            className="form-check-input me-2 recurring-payment-checkbox"
                            id="recurringPaymentCheck"
                            checked={enableRecurringPayment}
                            onChange={(e) =>
                              setEnableRecurringPayment(e.target.checked)
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor="recurringPaymentCheck"
                          >
                            Habilitar pago automático mensual
                            <i
                              style={{ fontSize: "24px" }}
                              className="bx bx-info-circle ms-2 text-primary"
                            ></i>
                          </label>

                          <div className="tooltip">
                            <strong>Información sobre Pagos Automáticos</strong>
                            <p>
                              Los pagos automáticos solo están disponibles con
                              tarjetas de crédito o débito.
                            </p>
                            <p>
                              Activar esta opción permitirá que los cobros se
                              realicen de forma automática, autorizando cargos
                              mensuales a tu tarjeta para renovar tu compra.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Botón para iniciar el proceso de pago con Stripe */}
                      <button
                        className="stripe-button-custom"
                        onClick={handleStripePayment}
                        disabled={isProcessingPayment}
                      >
                        {isProcessingPayment ? (
                          <span>
                            <i className="bx bx-loader-alt bx-spin me-2"></i>
                            Procesando...
                          </span>
                        ) : (
                          <span>
                            <i className="bx bxl-stripe me-2"></i>
                            Pagar con Stripe
                          </span>
                        )}
                      </button>
                    </>
                  )}
                </div>
                {/* <TestTransactionPanel /> */}
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
    </div>
  );
};

export default StripePayment;
