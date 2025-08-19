import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import chateaLogo from "../../assets/chatea.png";
import CreditCardForm from "../../components/payments/wompi/CreditCardForm";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { fetchAssistants, fetchComplements } from "../../services/dataService";
import { createSubscription } from "../../services/newApi/subscriptions";
import { useSubscriptionPolling } from "../../hooks/useSubscriptionPolling";
import Swal from "sweetalert2";
import "../../styles/components/RecurringPaymentPage.css";

const RecurringPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [assistantsData, setAssistantsData] = useState([]);
  const [complementsData, setComplementsData] = useState([]);
  const [createdWorkspaceId, setCreatedWorkspaceId] = useState(null);

  // Datos pasados desde la página anterior (ya en IDs numéricos)
  const {
    paymentCalculations,
    formData,
    selectedPlan,
    selectedAssistants, // IDs numéricos
    selectedComplements, // IDs numéricos con estructura de API
    purchaseType,
    originalUrlParams,
  } = location.state || {};

  const buildUrlWithOriginalParams = () => {
    if (!originalUrlParams) return "/";

    const params = new URLSearchParams();

    // Agregar parámetros relevantes que existen
    [
      "workspace_id",
      "workspace_name",
      "owner_name",
      "owner_email",
      "phone_number",
      "plan_id",
      "period",
    ].forEach((key) => {
      if (originalUrlParams[key]) {
        params.set(key, originalUrlParams[key]);
      }
    });

    const paramString = params.toString();
    return paramString ? `/?${paramString}` : "/";
  };

  // Hook de polling - se activa cuando createdWorkspaceId existe
  // eslint-disable-next-line no-unused-vars
  const { isPolling, pollingCount } = useSubscriptionPolling(
    createdWorkspaceId,
    !!createdWorkspaceId,
    originalUrlParams
  );

  useEffect(() => {
    // Si no hay datos, redirigir al inicio
    if (!paymentCalculations || !formData) {
      navigate("/", { replace: true });
      return;
    }

    // Cargar datos de asistentes y complementos para mostrar nombres
    const loadData = async () => {
      try {
        const [assistants, complements] = await Promise.all([
          fetchAssistants(),
          fetchComplements(),
        ]);
        setAssistantsData(assistants);
        setComplementsData(complements);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [paymentCalculations, formData, navigate]);

  // Función para obtener el nombre del asistente por ID numérico
  const getAssistantNameById = (id) => {
    const assistant = assistantsData.find((a) => a.apiId === id);
    return assistant ? assistant.label : `Asistente ${id}`;
  };

  // Función para obtener el nombre del complemento por ID numérico
  const getComplementNameById = (id) => {
    const complement = complementsData.find((c) => c.apiId === id);
    return complement ? complement.name : `Complemento ${id}`;
  };

  const handleCardSubmit = async (cardData) => {
    setLoading(true);

    try {
      // Mapear asistentes separando gratis vs pagados
      const isAssistantsOnly = !selectedPlan;

      const freeAssistantId =
        selectedAssistants.length > 0 && !isAssistantsOnly
          ? selectedAssistants[0]
          : null;
      const paidAssistantIds =
        selectedAssistants.length > 1 && !isAssistantsOnly
          ? selectedAssistants.slice(1)
          : isAssistantsOnly
          ? selectedAssistants
          : [];

      // Procesar complementos para que todos tengan botFlowNs
      const processedComplements =
        selectedComplements?.map((complement) => ({
          id: complement.id,
          quantity: complement.quantity || 1,
          botFlowNs:
            complement.bot_flow_ns || complement.selectedBot?.flow_ns || "",
        })) || [];

      // Crear el JSON con la estructura requerida usando IDs numéricos
      const subscriptionData = {
        workspace_id: parseInt(formData.workspace_id) || 0,
        workspace_name: formData.workspace_name || "",
        owner_email: formData.owner_email || "",
        phone: formData.phone_number || "",
        document_type: formData.document_type || "",
        document_number: formData.document_number || "",
        assistants_only: isAssistantsOnly,
        plan_id: selectedPlan?.id || null,
        free_assistant_id: freeAssistantId,
        paid_assistant_ids: paidAssistantIds,
        addons: processedComplements,
        card_details: {
          exp_date: {
            year: parseInt(cardData.exp_year.toString().slice(-2)),
            month: parseInt(cardData.exp_month),
          },
          card_holder: cardData.card_holder,
          card_number: cardData.number,
          cvv: cardData.cvc,
        },
      };

      const response = await createSubscription(subscriptionData);
      console.log(response);

      // Mostrar mensaje de procesamiento
      await Swal.fire({
        icon: "info",
        title: "Procesando Suscripción",
        html: `
          <div style="text-align: center;">
            <p><strong>Tu suscripción está siendo procesada.</strong></p>
            <br>
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <p style="color: #856404; margin: 0;">⏳ <strong>Tiempo estimado:</strong> 1-2 minutos</p>
              <p style="color: #856404; margin: 10px 0 0 0;">🔄 Verificaremos automáticamente el estado.</p>
            </div>
          </div>
        `,
        confirmButtonText: "Continuar",
        confirmButtonColor: "#009ee3",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      // Establecer el workspace ID para activar el polling
      setCreatedWorkspaceId(formData.workspace_id);
    } catch (error) {
      console.error("Error creating subscription:", error);

      // Función para procesar errores de validación
      const getErrorMessage = (error) => {
        // Si hay errores de validación específicos
        if (error.response?.data && Array.isArray(error.response.data)) {
          const validationErrors = error.response.data;

          // Mapear errores comunes a mensajes amigables
          const errorMessages = validationErrors.map((err) => {
            const fieldPath = err.path?.join(".");

            switch (fieldPath) {
              case "cardDetails.expDate.year":
              case "card_details.exp_date.year":
                return "El año de vencimiento de la tarjeta no es válido";
              case "cardDetails.expDate.month":
              case "card_details.exp_date.month":
                return "El mes de vencimiento de la tarjeta no es válido";
              case "cardDetails.cardNumber":
              case "card_details.card_number":
                return "El número de tarjeta no es válido";
              case "cardDetails.cvv":
              case "card_details.cvv":
                return "El código CVV no es válido";
              case "cardDetails.cardHolder":
              case "card_details.card_holder":
                return "El nombre del titular no es válido";
              case "workspace_id":
                return "El ID del workspace no es válido";
              case "onwer_email":
                return "El email del propietario no es válido";
              default:
                // Manejar errores de addons/complementos
                if (
                  fieldPath?.includes("addons") &&
                  fieldPath?.includes("botFlowNs")
                ) {
                  return "Hay un problema con la configuración de los complementos";
                }
                if (fieldPath?.includes("addons")) {
                  return "Los datos de complementos no son válidos";
                }
                return err.message || "Error en los datos enviados";
            }
          });

          return errorMessages.join("\n");
        }

        // Otros tipos de errores
        if (error.response?.data?.message) {
          return error.response.data.message;
        }

        if (error.message) {
          return error.message;
        }

        return "Hubo un problema al crear tu suscripción. Por favor intenta nuevamente.";
      };

      const errorMessage = getErrorMessage(error);

      await Swal.fire({
        icon: "error",
        title: "Error al Crear Suscripción",
        text: errorMessage,
        confirmButtonText: "Reintentar",
        confirmButtonColor: "#009ee3",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading || isPolling) return; // Prevenir cancelación durante procesamiento o polling
    // Redirigir con parámetros originales
    const urlWithParams = buildUrlWithOriginalParams();
    navigate(urlWithParams);
  };

  if (!paymentCalculations || !formData) {
    return null;
  }

  // Mostrar overlay de polling cuando está verificando
  if (isPolling) {
    return (
      <div className="stripe-checkout-page">
        <Container>
          <Row className="justify-content-center">
            <Col xl={6} lg={8}>
              <div className="processing-overlay">
                <LoadingSpinner
                  loading={true}
                  message={`Verificando tu suscripción...`}
                  size={60}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="stripe-checkout-page">
      <Container>
        <Row className="justify-content-center">
          <Col xl={10} lg={11}>
            <div className="checkout-content">
              <Row>
                {/* Resumen de compra - contenedor derecho */}
                <Col lg={5} className="order-lg-2">
                  <div className="order-summary">
                    <div className="order-details">
                      <div className="detail-section">
                        <img
                          className="mb-3"
                          src={chateaLogo}
                          width={150}
                          alt="Chatea Logo"
                        />
                        <h5 className="detail-title">
                          Detalles de la suscripción
                        </h5>

                        {selectedPlan && (
                          <div className="detail-item">
                            <span className="detail-label">Plan:</span>
                            <span className="detail-value">
                              {selectedPlan.name}
                            </span>
                          </div>
                        )}

                        <div className="detail-item">
                          <span className="detail-label">Workspace:</span>
                          <span className="detail-value">
                            {formData.workspace_name} (ID:{" "}
                            {formData.workspace_id})
                          </span>
                        </div>

                        <div className="detail-item">
                          <span className="detail-label">Propietario:</span>
                          <span className="detail-value">
                            {formData.owner_name}
                          </span>
                        </div>

                        <div className="detail-item">
                          <span className="detail-label">Documento:</span>
                          <span className="detail-value">
                            {formData.document_type}
                            {formData.document_number}
                          </span>
                        </div>

                        {selectedAssistants &&
                          selectedAssistants.length > 0 && (
                            <div className="detail-section">
                              <div className="detail-item">
                                <span className="detail-label">
                                  Asistentes:
                                </span>
                              </div>
                              {selectedAssistants.map((assistantId, index) => (
                                <div
                                  key={`assistant-${assistantId}-${index}`}
                                  className="detail-sub-item"
                                >
                                  <span className="detail-value">
                                    {getAssistantNameById(assistantId)}
                                    {index === 0 &&
                                      !purchaseType === "assistants" && (
                                        <span className="badge bg-success ms-2">
                                          Gratis
                                        </span>
                                      )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                        {selectedComplements &&
                          selectedComplements.length > 0 && (
                            <div className="detail-section">
                              <div className="detail-item">
                                <span className="detail-label">
                                  Complementos:
                                </span>
                              </div>
                              {selectedComplements.map((complement, index) => (
                                <div
                                  key={`complement-${complement.id}-${index}`}
                                  className="detail-sub-item complement-item"
                                >
                                  <span className="detail-value complement-info">
                                    <span className="complement-name">
                                      {getComplementNameById(complement.id)}
                                    </span>
                                    <span className="complement-details">
                                      {complement.quantity &&
                                        complement.quantity > 1 && (
                                          <span className="quantity-badge">
                                            x{complement.quantity}
                                          </span>
                                        )}
                                    </span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>

                      <div className="recurring-info">
                        <div className="recurring-badge">
                          <i className="bx bx-refresh"></i>
                          <span>Pago recurrente mensual</span>
                        </div>
                      </div>

                      <div className="order-total">
                        <div
                          style={{
                            background: "#edf4ff",
                            border: "1px solid rgba(0, 158, 227, 0.2)",
                          }}
                          className="total-section"
                        >
                          <div className="total-row">
                            <span>Subtotal mensual</span>
                            <span className="total-amount">
                              ${paymentCalculations.totalUSD.toFixed(2)} USD
                            </span>
                          </div>
                          <div className="total-row secondary">
                            <span>En pesos colombianos</span>
                            <span className="total-amount-cop">
                              $
                              {Math.round(
                                paymentCalculations.priceInCOP
                              ).toLocaleString()}{" "}
                              COP
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Formulario de pago - contenedor izquierdo */}
                <Col lg={6} className="order-lg-1">
                  <div className="payment-section">
                    <div className="payment-header">
                      <h4 className="payment-title">Información de pago</h4>
                      <div className="secure-badge">
                        <i className="bx bx-lock-alt"></i>
                        <span>Información segura y encriptada</span>
                      </div>
                    </div>

                    {loading && (
                      <div className="processing-overlay">
                        <LoadingSpinner
                          loading={true}
                          message="Procesando tu suscripción..."
                          size={50}
                        />
                      </div>
                    )}

                    <div
                      className={`payment-form ${
                        loading ? "form-disabled" : ""
                      }`}
                    >
                      <CreditCardForm
                        onSubmit={handleCardSubmit}
                        loading={loading}
                        onCancel={handleCancel}
                      />
                    </div>

                    <div className="payment-footer">
                      <div className="footer-note">
                        <i className="bx bx-info-circle"></i>
                        <span>
                          Puedes cancelar tu suscripción en cualquier momento
                          desde tu panel de control
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RecurringPaymentPage;
