import { useCallback, useRef, useState, useEffect } from "react";
import { PuffLoader } from "react-spinners";
import chatea from "../../assets/chatea.png";
import wompi from "../../assets/wompi.png";
import { useWompiPayment } from "../../hooks/useWompiPayment";
import {
  validateForm,
  convertUSDtoCOPCents,
  generateIntegritySignature,
} from "../../utils/wompiHelpers";
import { generateStripeReference } from "../../utils/stripeHelpers";
import { WOMPI_CONFIG } from "../../api/wompiConfig";
import { STRIPE_CONFIG } from "../../api/stripeConfig";
import ConfirmationModal from "../../components/ConfirmationModal";
import PaymentSummary from "../../components/PaymentSummary";
import AIAssistants from "../../components/AIAssistants";
import PaymentGatewaySelector from "../../components/PaymentGatewaySelector";
import PurchaseTypeSelector from "../../components/PurchaseTypeSelector";
import "bootstrap/dist/css/bootstrap.min.css";
import "./WompiPayment.css";
import ConfirmedInfo from "../../components/ConfirmedInfo";
import Complements from "../../components/Complements";
import Swal from "sweetalert2";
// import TestTransactionPanel from "../confirmation/TestTransactionPanel";
// import TestTransactionPanel from "../confirmation/TestTransactionPanel";

const WompiPayment = () => {
  const [selectedAssistants, setSelectedAssistants] = useState([]);
  const [purchaseType, setPurchaseType] = useState(null);
  const complementsRef = useRef(null);
  const [selectedComplements, setSelectedComplements] = useState([]);
  const [showWompiWidget, setShowWompiWidget] = useState(false);
  const wompiButtonRef = useRef(null);
  const isUpdatingButton = useRef(false);
  const [paymentGateway, setPaymentGateway] = useState("wompi");
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
  } = useWompiPayment();

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
    setShowWompiWidget(false);

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

  // Función común para calcular los precios totales
  const calculateTotals = () => {
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

    // Convertir a COP en centavos para las pasarelas
    const priceCOPCents = convertUSDtoCOPCents(totalUSD, usdToCopRate);

    return {
      totalUSD,
      priceCOPCents,
      totalAssistantsPrice,
      totalComplementsPrice,
    };
  };

  // Manejo del clic botón wompi
  const handleWompiButtonClick = () => {
    setShowWompiWidget(true);
    setTimeout(() => {
      const wompiButton = document.querySelector(
        "#wompi-button-container button"
      );
      if (wompiButton) {
        wompiButtonRef.current = wompiButton;
        wompiButton.click();
      }
    }, 500);
  };

  // Función para manejar el pago con Stripe
  const handleStripePayment = async () => {
    if (!shouldShowPayButton()) return;

    try {
      setIsProcessingPayment(true);

      const { totalUSD, priceCOPCents } = calculateTotals();

      // Generar la referencia que contiene toda la información del pedido
      const reference = generateStripeReference(
        purchaseType,
        selectedPlan,
        formData.workspace_id,
        formData.workspace_name,
        formData.owner_email,
        formData.phone_number,
        selectedAssistants,
        selectedComplements,
        enableRecurringPayment,
        totalUSD
      );

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
        const { totalAssistantsPrice } = calculateTotals();
        items.push({
          id: "assistants",
          name: `Asistentes de IA (${selectedAssistants.length})`,
          price: convertUSDtoCOPCents(totalAssistantsPrice, usdToCopRate),
          quantity: 1,
        });
      }

      // Si no hay items (caso de solo complementos), agregar uno genérico
      if (items.length === 0 && selectedComplements.length > 0) {
        const { totalComplementsPrice } = calculateTotals();
        items.push({
          id: "complements",
          name: "Complementos",
          price: convertUSDtoCOPCents(totalComplementsPrice, usdToCopRate),
          quantity: 1,
        });
      }

      // Llamar al endpoint correcto según si es pago único o recurrente
      const endpoint = enableRecurringPayment
        ? `${STRIPE_CONFIG.CHECKOUT_URL}/create-subscription`
        : `${STRIPE_CONFIG.CHECKOUT_URL}/create-checkout-session`;

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
            isRecurring: enableRecurringPayment,
            totalUSD: totalUSD.toString(),
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
      console.error("Error al procesar el pago con Stripe:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al procesar el pago. Por favor, intenta nuevamente.",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Actualizar botón de Wompi cuando cambian las selecciones
  useEffect(() => {
    const updateWompiButton = async () => {
      const container = document.getElementById("wompi-button-container");
      if (
        !container ||
        !isDataConfirmed ||
        !showWompiWidget ||
        paymentGateway !== "wompi"
      )
        return;

      if (isUpdatingButton.current) return;
      isUpdatingButton.current = true;

      try {
        container.innerHTML = "";

        const existingScripts = document.querySelectorAll(
          'script[src="https://checkout.wompi.co/widget.js"]'
        );
        existingScripts.forEach((script) => script.remove());

        if (!shouldShowPayButton()) {
          isUpdatingButton.current = false;
          return;
        }

        // eslint-disable-next-line no-unused-vars
        const { totalUSD, priceCOPCents } = calculateTotals();

        const workspaceId =
          urlParams?.workspace_id || WOMPI_CONFIG.DEFAULT_WORKSPACE_ID;

        const assistantsString =
          selectedAssistants.length > 0
            ? `-assistants=${selectedAssistants.join("+")}`
            : "";

        const complementsString =
          selectedComplements.length > 0
            ? `-complements=${selectedComplements
                .map((c) => {
                  if (c.id === "webhooks") {
                    return `${c.id}_${c.quantity}_${c.selectedBot.flow_ns}`;
                  }
                  return `${c.id}_${c.quantity}`;
                })
                .join("+")}`
            : "";

        // const gatewayString = "-gateway=wompi";
        // const totalUSDString = `-totalUSD=${totalUSD}`;

        const reference =
          purchaseType === "plan"
            ? `plan_id=${
                selectedPlan.id
              }-workspace_id=${workspaceId}-workspace_name=${
                urlParams?.workspace_name
              }-owner_email=${urlParams?.owner_email}-phone_number=${
                urlParams?.phone_number
              }${assistantsString}${complementsString}-reference${Date.now()}`
            : `assistants_only=true-workspace_id=${workspaceId}-workspace_name=${
                urlParams?.workspace_name
              }-owner_email=${urlParams?.owner_email}-phone_number=${
                urlParams?.phone_number
              }${assistantsString}${complementsString}-reference${Date.now()}`;

        const signature = await generateIntegritySignature(
          reference,
          priceCOPCents,
          "COP"
        );

        console.log("355  >>>>>>>>> ", reference);

        if (!signature) return;

        const baseUrl = window.location.origin;
        const redirectUrl = `${baseUrl}/transaction-summary-wompi`;

        const script = document.createElement("script");
        script.src = "https://checkout.wompi.co/widget.js";
        script.setAttribute("data-render", "button");
        script.setAttribute("data-public-key", WOMPI_CONFIG.PUBLIC_KEY);
        script.setAttribute("data-currency", "COP");
        script.setAttribute("data-amount-in-cents", priceCOPCents.toString());
        script.setAttribute("data-reference", reference);
        script.setAttribute("data-signature:integrity", signature);
        script.setAttribute("data-finish-text", "Pago completado");
        script.setAttribute("data-complete", "true");
        script.setAttribute("data-redirect-url", redirectUrl);

        container.appendChild(script);
      } catch (error) {
        console.error("Error al actualizar botón de Wompi:", error);
      } finally {
        isUpdatingButton.current = false;
      }
    };

    updateWompiButton();
  }, [
    selectedPlan,
    usdToCopRate,
    urlParams,
    isDataConfirmed,
    selectedAssistants,
    selectedComplements,
    purchaseType,
    showWompiWidget,
    paymentGateway,
  ]);

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
                        setShowWompiWidget(false);
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
                      <PaymentGatewaySelector
                        selectedGateway={paymentGateway}
                        onChange={setPaymentGateway}
                        enableRecurring={enableRecurringPayment}
                        setEnableRecurring={setEnableRecurringPayment}
                      />

                      {paymentGateway === "wompi" ? (
                        <>
                          {/* Botón personalizado visible cuando no se muestra el widget */}
                          {!showWompiWidget && (
                            <button
                              className="wompi-button-custom"
                              onClick={handleWompiButtonClick}
                              disabled={isProcessingPayment}
                            >
                              <img width={22} src={wompi} alt="" /> Pagar con
                              Wompi
                            </button>
                          )}

                          <div
                            id="wompi-button-container"
                            style={{
                              display: showWompiWidget ? "block" : "none",
                              visibility: showWompiWidget
                                ? "visible"
                                : "hidden",
                            }}
                          ></div>
                        </>
                      ) : (
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
                      )}
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

export default WompiPayment;
