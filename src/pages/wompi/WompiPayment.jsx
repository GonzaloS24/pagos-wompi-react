import { useEffect } from "react";
import { PuffLoader } from "react-spinners";
import chatea from "../../assets/chatea.png";
import Swal from "sweetalert2";
import { useWompiPayment } from "../../hooks/useWompiPayment";
import {
  validateForm,
  generateIntegritySignature,
  convertUSDtoCOPCents,
} from "../../utils/wompiHelpers";
import { WOMPI_CONFIG } from "../../api/wompiConfig";
import ConfirmationModal from "../../components/ConfirmationModal";
import PaymentSummary from "../../components/PaymentSummary";
import "bootstrap/dist/css/bootstrap.min.css";
import "./WompiPayment.css";
import ConfirmedInfo from "../../components/ConfirmedInfo";

const WompiPayment = () => {
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

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setFormErrors({ ...formErrors, [field]: null });
  };

  useEffect(() => {
    const updateWompiButton = async () => {
      const container = document.getElementById("wompi-button-container");
      if (!container || !selectedPlan || !usdToCopRate || !isDataConfirmed)
        return;

      container.innerHTML = "";

      try {
        const priceCOPCents = convertUSDtoCOPCents(
          selectedPlan.priceUSD,
          usdToCopRate
        );
        const workspaceId =
          urlParams?.workspace_id || WOMPI_CONFIG.DEFAULT_WORKSPACE_ID;

        const reference = `plan_id=${
          selectedPlan.id
        }-workspace_id=${workspaceId}-workspace_name=${
          urlParams?.workspace_name
        }-owner_name=${urlParams?.owner_name}-owner_email=${
          urlParams?.owner_email
        }-phone_number=${urlParams?.phone_number}-reference${Date.now()}`;

        const signature = await generateIntegritySignature(
          reference,
          priceCOPCents,
          "COP"
        );

        // console.log(`Precio en USD: $${selectedPlan.priceUSD}`);
        // console.log(`Precio en COP centavos: ${priceCOPCents}`);
        // console.log(`Firma generada: ${signature}`);
        // console.log(">>>>>>>>> ", reference);

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
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al preparar el botón de pago",
        });
      }
    };

    updateWompiButton();
  }, [selectedPlan, usdToCopRate, urlParams, isDataConfirmed]);

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
    <div className="container min-vh-100 d-flex flex-column justify-content-center align-items-center py-4">
      <figure className="text-center mb-4">
        <img
          src={chatea}
          alt="Chatea Logo"
          className="img-fluid"
          style={{ maxWidth: "250px" }}
        />
      </figure>

      <div
        className="card shadow-sm p-2"
        style={{
          maxWidth: "500px",
          width: "100%",
          borderRadius: "10px",
          borderColor: "#009ee3",
        }}
      >
        <div className="card-body">
          {isDataConfirmed && <ConfirmedInfo formData={formData} />}

          <select
            className="form-select form-select-lg mb-4"
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
                {plan.name} - {plan.bot_users}
              </option>
            ))}
          </select>

          {selectedPlan && isDataConfirmed && (
            <div className="mt-4">
              <PaymentSummary
                selectedPlan={selectedPlan}
                usdToCopRate={usdToCopRate}
              />
              <div id="wompi-button-container"></div>
            </div>
          )}
        </div>
      </div>

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
