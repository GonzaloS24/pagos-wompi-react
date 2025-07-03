import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import chateaLogo from "../../assets/chatea.png";
import CreditCardForm from "../../components/payments/wompi/CreditCardForm";
import { fetchAssistants, fetchComplements } from "../../services/dataService";
import Swal from "sweetalert2";
import "../../styles/components/RecurringPaymentPage.css";

const RecurringPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [assistantsData, setAssistantsData] = useState([]);
  const [complementsData, setComplementsData] = useState([]);

  // Datos pasados desde la página anterior (ya en IDs numéricos)
  const {
    paymentCalculations,
    formData,
    selectedPlan,
    selectedAssistants, // IDs numéricos
    selectedComplements, // IDs numéricos con estructura de API
  } = location.state || {};

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

      // Crear el JSON con la estructura requerida usando IDs numéricos
      const paymentData = {
        workspace_id: parseInt(formData.workspace_id) || 0,
        phone: formData.phone_number || "",
        plan_id: selectedPlan?.id || null,
        workspace_name: formData.workspace_name || "",
        owner_email: formData.owner_email || "",
        free_assistant_id: freeAssistantId,
        paid_assistant_ids: paidAssistantIds,
        assistants_only: !selectedPlan,
        addons: selectedComplements || [],
        card_details: {
          exp_date: {
            year: parseInt(cardData.exp_year),
            month: parseInt(cardData.exp_month),
          },
          card_holder: cardData.card_holder,
          card_number: cardData.number,
          cvv: cardData.cvc,
        },
      };

      // Mostrar el JSON estructurado
      await Swal.fire({
        icon: "info",
        title: "Datos del Pago Recurrente",
        html: `
          <div style="text-align: left; max-height: 400px; overflow-y: auto;">
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 12px; text-align: left;">
${JSON.stringify(paymentData, null, 2)}
            </pre>
          </div>
        `,
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#009ee3",
        width: "600px",
        customClass: {
          htmlContainer: "text-left",
        },
      });
    } catch (error) {
      console.error("Error processing payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!paymentCalculations || !formData) {
    return null;
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
                        <img className="mb-3" src={chateaLogo} width={150} />
                        <h5 className="detail-title">Detalles de la compra</h5>

                        {selectedPlan && (
                          <div className="detail-item">
                            <span className="detail-label">Plan:</span>
                            <span className="detail-value">
                              {selectedPlan.name}
                            </span>
                          </div>
                        )}

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
                          <div className="recurring-text">
                            Próximo cobro:{" "}
                            {new Date(
                              Date.now() + 30 * 24 * 60 * 60 * 1000
                            ).toLocaleDateString("es-CO")}
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

                    <div className="payment-form">
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
