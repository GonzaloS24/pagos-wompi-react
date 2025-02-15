import { useState, useEffect } from "react";
import "./WompiPayment.css";
import chatea from "../../assets/chatea.png";
import Swal from "sweetalert2";
import { Modal, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const CONFIG = {
  WOMPI_PUBLIC_KEY: "pub_prod_mUzoGd0TQzkIWZwMamDL3ADjEYCO93N7",
  INTEGRITY_SECRET: "prod_integrity_KZkk9BdR7yGH9jDspvfhWud8IdUBnMQw",
  EXCHANGE_RATE_API: "https://api.exchangerate-api.com/v4/latest/USD",
  DEFAULT_WORKSPACE_ID: null,
};

const WompiPayment = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [usdToCopRate, setUsdToCopRate] = useState();
  const [urlParams, setUrlParams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(true);
  const [formData, setFormData] = useState({
    workspace_id: "",
    workspace_name: "",
    owner_name: "",
    owner_email: "",
    phone_number: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isDataConfirmed, setIsDataConfirmed] = useState(false);

  // Función para seleccionar el plan según el plan_id
  const selectPlanFromId = (planId) => {
    if (!planId || !plans.length) return;
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
    } else {
      Swal.fire({
        icon: "error",
        title: "Plan Inválido",
        text: "El plan especificado no es válido",
      });
    }
  };

  // Función para sanitizar strings
  const sanitizeString = (str) => {
    if (!str) return "";
    return str.replace(/[<>]/g, "");
  };

  // Función para validar el formulario
  const validateForm = () => {
    const errors = {};
    if (!formData.workspace_id.trim())
      errors.workspace_id = "El ID del espacio es requerido";
    if (!formData.workspace_name.trim())
      errors.workspace_name = "El nombre del espacio es requerido";
    if (!formData.owner_name.trim())
      errors.owner_name = "El nombre del dueño es requerido";
    if (
      !formData.owner_email.trim() ||
      !/\S+@\S+\.\S+/.test(formData.owner_email)
    ) {
      errors.owner_email = "Email inválido";
    }
    if (
      !formData.phone_number.trim() ||
      !/^\d{10}$/.test(formData.phone_number)
    ) {
      errors.phone_number = "Número de teléfono inválido (10 dígitos)";
    }
    return errors;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
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

  // Función para generar hash SHA-256
  const generateIntegritySignature = async (
    reference,
    amountInCents,
    currency
  ) => {
    try {
      const message = `${reference}${amountInCents}${currency}${CONFIG.INTEGRITY_SECRET}`;
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (error) {
      console.error("Error generando firma:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al generar la firma de seguridad",
      });
      return null;
    }
  };

  const convertUSDtoCOPCents = (usdAmount) => {
    if (!usdAmount || !usdToCopRate) return 0;
    // Redondeamos el valor en COP antes de convertirlo a centavos
    const copAmount = Math.round(usdAmount * usdToCopRate);
    return copAmount * 100; // Convertir a centavos
  };

  // Función para extraer y validar parámetros de la URL
  const extractUrlParams = () => {
    try {
      const decodedUrl = decodeURIComponent(
        window.location.search.replace(/&amp;/g, "&")
      );
      const params = new URLSearchParams(decodedUrl);

      const urlData = {
        workspace_id: sanitizeString(params.get("workspace_id")),
        workspace_name: sanitizeString(params.get("workspace_name")),
        owner_name: sanitizeString(params.get("owner_name")),
        owner_email: sanitizeString(params.get("owner_email")),
        phone_number: sanitizeString(params.get("phone_number")),
        plan_id: sanitizeString(params.get("plan_id")),
      };

      // Si hay un plan_id en la URL, intentar seleccionarlo
      if (urlData.plan_id && plans.length > 0) {
        selectPlanFromId(urlData.plan_id);
      }

      // Prellenar el formulario con los datos que existen
      setFormData({
        workspace_id: urlData.workspace_id || "",
        workspace_name: urlData.workspace_name || "",
        owner_name: urlData.owner_name || "",
        owner_email: urlData.owner_email || "",
        phone_number: urlData.phone_number || "",
      });

      // Guardamos los parámetros de la URL
      setUrlParams(urlData);
    } catch (error) {
      console.error("Error al procesar los parámetros de la URL:", error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // tasa de cambio USD a COP
        const response = await fetch(CONFIG.EXCHANGE_RATE_API);
        if (!response.ok) throw new Error("Error al obtener tasa de cambio");
        const data = await response.json();
        setUsdToCopRate(data.rates.COP);

        const Plans = [
          {
            id: "business",
            name: "Chatea Pro Start",
            priceUSD: 49,
          },
          {
            id: "business_lite",
            name: "Chatea Pro Advanced",
            priceUSD: 109,
          },
          {
            id: "custom_plan3",
            name: "Chatea Pro Plus",
            priceUSD: 189,
          },
          {
            id: "business_large",
            name: "Chatea Pro Master",
            priceUSD: 389,
          },
        ];
        setPlans(Plans);

        // Obtener plan_id de la URL después de cargar los planes
        const params = new URLSearchParams(window.location.search);
        const planId = sanitizeString(params.get("plan_id"));
        if (planId) {
          const plan = Plans.find((p) => p.id === planId);
          if (plan) {
            setSelectedPlan(plan);
          }
        }
      } catch (error) {
        console.error("Error en la inicialización:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al cargar los datos necesarios",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (plans.length > 0) {
      extractUrlParams();
    }
  }, [plans]);

  useEffect(() => {
    const updateWompiButton = async () => {
      const container = document.getElementById("wompi-button-container");
      if (!container || !selectedPlan || !usdToCopRate || !isDataConfirmed)
        return;

      container.innerHTML = "";

      try {
        const priceCOPCents = convertUSDtoCOPCents(selectedPlan.priceUSD);
        const workspaceId =
          urlParams?.workspace_id || CONFIG.DEFAULT_WORKSPACE_ID;

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
        // console.log("724  >>>>>>>>> ", reference);

        if (!signature) return;

        const script = document.createElement("script");
        script.src = "https://checkout.wompi.co/widget.js";
        script.setAttribute("data-render", "button");
        script.setAttribute("data-public-key", CONFIG.WOMPI_PUBLIC_KEY);
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
      <div className="container">
        <div className="card">
          <p className="loading-text">Cargando información...</p>
        </div>
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
          {isDataConfirmed && (
            <div className="bg-light p-3 rounded mb-4">
              <div className="row g-2">
                <div className="col-sm-6">
                  <div className="text-start">
                    <small className="text-muted d-block">ID del espacio</small>
                    <span className="fw-medium">{formData.workspace_id}</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="text-start">
                    <small className="text-muted d-block">
                      Espacio de trabajo
                    </small>
                    <span className="fw-medium">{formData.workspace_name}</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="text-start">
                    <small className="text-muted d-block">Propietario</small>
                    <span className="fw-medium">{formData.owner_name}</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="text-start">
                    <small className="text-muted d-block">Email</small>
                    <span className="fw-medium">{formData.owner_email}</span>
                  </div>
                </div>
                <div className="col-12">
                  <div className="text-start">
                    <small className="text-muted d-block">Teléfono</small>
                    <span className="fw-medium">{formData.phone_number}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                {plan.name}
              </option>
            ))}
          </select>

          {selectedPlan && isDataConfirmed && (
            <div className="mt-4">
              <div className="card bg-light border-0 mb-4">
                <div className="card-body">
                  <h5 style={{ color: "#009ee3" }} className="card-title mb-3">
                    Resumen del Plan
                  </h5>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Plan:</span>
                    <span className="fw-medium">{selectedPlan.name}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Precio en USD:</span>
                    <span className="fw-medium">${selectedPlan.priceUSD}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Precio en COP:</span>
                    <span style={{ color: "#009ee3" }} className="fw-bold">
                      $
                      {Math.round(
                        convertUSDtoCOPCents(selectedPlan.priceUSD) / 100
                      ).toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>
              </div>

              <div id="wompi-button-container"></div>
            </div>
          )}
        </div>
      </div>
      {/* Modal para datos faltantes */}
      <Modal show={showModal} backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Confirmar Información</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>ID del Espacio *</Form.Label>
              <Form.Control
                type="text"
                value={formData.workspace_id}
                onChange={(e) => {
                  setFormData({ ...formData, workspace_id: e.target.value });
                  setFormErrors({ ...formErrors, workspace_id: null });
                }}
                isInvalid={!!formErrors.workspace_id}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.workspace_id}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nombre del Espacio *</Form.Label>
              <Form.Control
                type="text"
                value={formData.workspace_name}
                onChange={(e) => {
                  setFormData({ ...formData, workspace_name: e.target.value });
                  setFormErrors({ ...formErrors, workspace_name: null });
                }}
                isInvalid={!!formErrors.workspace_name}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.workspace_name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nombre del Dueño *</Form.Label>
              <Form.Control
                type="text"
                value={formData.owner_name}
                onChange={(e) => {
                  setFormData({ ...formData, owner_name: e.target.value });
                  setFormErrors({ ...formErrors, owner_name: null });
                }}
                isInvalid={!!formErrors.owner_name}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.owner_name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email del Dueño *</Form.Label>
              <Form.Control
                type="email"
                value={formData.owner_email}
                onChange={(e) => {
                  setFormData({ ...formData, owner_email: e.target.value });
                  setFormErrors({ ...formErrors, owner_email: null });
                }}
                isInvalid={!!formErrors.owner_email}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.owner_email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Número de Teléfono *</Form.Label>
              <Form.Control
                type="tel"
                value={formData.phone_number}
                onChange={(e) => {
                  setFormData({ ...formData, phone_number: e.target.value });
                  setFormErrors({ ...formErrors, phone_number: null });
                }}
                isInvalid={!!formErrors.phone_number}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.phone_number}
              </Form.Control.Feedback>
            </Form.Group>

            <p className="text-muted small mb-3">* Campos obligatorios</p>

            <Button variant="primary" type="submit" className="w-100">
              Confirmar Información
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default WompiPayment;
