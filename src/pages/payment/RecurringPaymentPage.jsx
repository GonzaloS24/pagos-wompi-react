import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import chateaLogo from "../../assets/chatea.png";
import CreditCardForm from "../../components/payments/wompi/CreditCardForm";
import Swal from "sweetalert2";
import "../../styles/components/RecurringPaymentPage.css";

const RecurringPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Datos pasados desde la página anterior
  const {
    paymentCalculations,
    formData,
    selectedPlan,
    selectedAssistants,
    selectedComplements,
  } = location.state || {};

  useEffect(() => {
    // Si no hay datos, redirigir al inicio
    if (!paymentCalculations || !formData) {
      navigate("/", { replace: true });
    }
  }, [
    paymentCalculations,
    formData,
    selectedAssistants,
    selectedComplements,
    navigate,
  ]);

  const handleCardSubmit = async (cardData) => {
    setLoading(true);

    try {
      // Crear JSON con información de la tarjeta
      const cardInfo = {
        numero: `**** **** **** ${cardData.number.slice(-4)}`,
        numeroCompleto: cardData.number,
        nombreTitular: cardData.name,
        mesVencimiento: cardData.expiryMonth,
        añoVencimiento: cardData.expiryYear,
        codigoSeguridad: cardData.cvc,
        email: cardData.email || formData?.email,
        telefono: cardData.phone || formData?.phone,
        tipoDocumento: cardData.documentType || formData?.documentType,
        numeroDocumento: cardData.documentNumber || formData?.documentNumber,
        montoMensual: paymentCalculations.totalUSD,
        montoEnCOP: paymentCalculations.priceInCOP,
        fechaCreacion: new Date().toISOString(),
        planSeleccionado: selectedPlan?.name,
        asistentesSeleccionados: selectedAssistants?.map(
          (a) => a.name || `Asistente ${a.id}`
        ),
        complementosSeleccionados: selectedComplements?.map((c) => ({
          nombre: c.name || `Complemento ${c.id}`,
          cantidad: c.quantity || 1,
        })),
      };

      // Mostrar alert con el JSON
      await Swal.fire({
        icon: "info",
        title: "Información de la Tarjeta",
        html: `
          <div style="text-align: left; max-height: 400px; overflow-y: auto;">
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 12px; text-align: left;">
${JSON.stringify(cardInfo, null, 2)}
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
                              {selectedAssistants.map((assistant, index) => (
                                <div
                                  key={`assistant-${assistant.id}-${index}`}
                                  className="detail-sub-item"
                                >
                                  <span className="detail-value">
                                    {" "}
                                    {assistant.name ||
                                      `Asistente ${assistant.id || index + 1}`}
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
                                      {complement.name ||
                                        `Complemento ${
                                          complement.id || index + 1
                                        }`}
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
