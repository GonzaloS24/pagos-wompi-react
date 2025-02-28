import { useCallback, useEffect, useRef, useState } from "react";
import { PuffLoader } from "react-spinners";
import chatea from "../../assets/chatea.png";
import { useWompiPayment } from "../../hooks/useWompiPayment";
import {
  validateForm,
  generateIntegritySignature,
  convertUSDtoCOPCents,
} from "../../utils/wompiHelpers";
import { WOMPI_CONFIG } from "../../api/wompiConfig";
import ConfirmationModal from "../../components/ConfirmationModal";
import PaymentSummary from "../../components/PaymentSummary";
import AIAssistants from "../../components/AIAssistants";
import PurchaseTypeSelector from "../../components/PurchaseTypeSelector";
import "bootstrap/dist/css/bootstrap.min.css";
import "./WompiPayment.css";
import ConfirmedInfo from "../../components/ConfirmedInfo";
import Complements from "../../components/Complements";
const WompiPayment = () => {
  const [selectedAssistants, setSelectedAssistants] = useState([]);
  const [purchaseType, setPurchaseType] = useState(null);
  const complementsRef = useRef(null);
  const [selectedComplements, setSelectedComplements] = useState([]);
  const isUpdatingButton = useRef(false);

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

  // Determinar si mostrar el botón de Wompi
  const shouldShowWompiButton = () => {
    if (!purchaseType) return false;

    if (purchaseType === "plan") {
      // Solo mostrar el botón si hay un plan seleccionado Y al menos un asistente
      return selectedPlan !== null && selectedAssistants.length > 0;
    }

    if (purchaseType === "assistants") {
      // Se muestra si hay asistentes O complementos seleccionados
      return selectedAssistants.length > 0 || selectedComplements.length > 0;
    }

    return false;
  };

  useEffect(() => {
    const updateWompiButton = async () => {
      const container = document.getElementById("wompi-button-container");
      if (!container || !isDataConfirmed) return;

      // Verificar si ya se está actualizando el botón
      if (isUpdatingButton.current) return;
      isUpdatingButton.current = true;

      try {
        container.innerHTML = "";

        const existingScripts = document.querySelectorAll(
          'script[src="https://checkout.wompi.co/widget.js"]'
        );
        existingScripts.forEach((script) => script.remove());

        if (!shouldShowWompiButton()) {
          isUpdatingButton.current = false;
          return;
        }

        const assistantPrice = 20;
        // Aplicar lógica de asistente gratis SOLO para la compra de plan
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
        const totalUSD =
          planPrice + totalAssistantsPrice + totalComplementsPrice;

        const priceCOPCents = convertUSDtoCOPCents(totalUSD, usdToCopRate);
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

        const reference =
          purchaseType === "plan"
            ? `plan_id=${
                selectedPlan.id
              }-workspace_id=${workspaceId}-workspace_name=${
                urlParams?.workspace_name
              }-owner_name=${urlParams?.owner_name}-owner_email=${
                urlParams?.owner_email
              }-phone_number=${
                urlParams?.phone_number
              }${assistantsString}${complementsString}-reference${Date.now()}`
            : `assistants_only=true-workspace_id=${workspaceId}-workspace_name=${
                urlParams?.workspace_name
              }-owner_name=${urlParams?.owner_name}-owner_email=${
                urlParams?.owner_email
              }-phone_number=${
                urlParams?.phone_number
              }${assistantsString}${complementsString}-reference${Date.now()}`;

        const signature = await generateIntegritySignature(
          reference,
          priceCOPCents,
          "COP"
        );

        // console.log("191  >>>>>>>>> ", reference);

        if (!signature) return;

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
        script.setAttribute(
          "data-redirect-url",
          "https://transaction-redirect.wompi.co/check"
        );

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
                  <div id="wompi-button-container"></div>
                </div>
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
