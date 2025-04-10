import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PuffLoader } from "react-spinners";
import chatea from "../../assets/chatea.png";
import "./Confirmation.css";

const StripeConfirmation = () => {
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollingCount, setPollingCount] = useState(0);
  const [pollingTimer, setPollingTimer] = useState(null);
  const location = useLocation();

  // Función para obtener detalles de la transacción desde Stripe
  const fetchTransactionDetails = async (sessionId) => {
    try {
      if (!sessionId) {
        setLoading(false);
        return null;
      }

      const response = await fetch(
        `http://localhost:4000/checkout-session/${sessionId}`
      );
      const session = await response.json();

      if (!session) {
        return null;
      }

      // Parsear la referencia desde los metadatos
      const reference = session.metadata?.reference || "";
      const referenceData = parseReferenceString(reference);

      // Calcular el total en COP y USD
      let amountCOP = session.amount_total / 100;
      let amountUSD = amountCOP / 4000;

      // Si tenemos el total en USD en la referencia, usarlo
      if (referenceData.totalUSD) {
        amountUSD = parseFloat(referenceData.totalUSD);
      }

      // Procesar status
      const status = getSessionStatus(session);

      // Procesar asistentes y complementos de la referencia
      const assistantsProcessed = processAssistants(
        referenceData.assistants || []
      );
      const complementsProcessed = processComplements(
        referenceData.complements || []
      );

      // Determinar método de pago
      const paymentMethod =
        session.payment_method_types && session.payment_method_types[0]
          ? session.payment_method_types[0].toUpperCase()
          : "CARD";

      // Información de tarjeta si está disponible
      let cardDetails = null;
      if (session.payment_intent && session.payment_intent.payment_method) {
        const paymentMethodDetails = session.payment_intent.payment_method.card;
        if (paymentMethodDetails) {
          cardDetails = {
            brand: paymentMethodDetails.brand,
            last4: paymentMethodDetails.last4,
            funding: paymentMethodDetails.funding,
          };
        }
      }

      return {
        id: session.id,
        status: status.code,
        statusMessage: status.message,
        reference: reference,
        amountUSD: amountUSD,
        amountCOP: amountCOP,
        currency: session.currency?.toUpperCase() || "COP",
        createdAt: new Date(session.created * 1000).toLocaleString(),
        paymentMethod: paymentMethod,
        paymentMethodName: getPaymentMethodName(paymentMethod),
        cardType: cardDetails?.funding === "credit" ? "CREDIT" : "DEBIT",
        cardBrand: cardDetails?.brand ? cardDetails.brand.toUpperCase() : null,
        cardLastFour: cardDetails?.last4 || null,
        assistants: assistantsProcessed,
        complements: complementsProcessed,
        plan_id: referenceData.plan_id,
        workspace_id: referenceData.workspace_id,
        recurring: referenceData.recurring,
      };
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      return null;
    }
  };

  useEffect(() => {
    const startPolling = async () => {
      try {
        // Obtener ID de sesión en la URL
        const params = new URLSearchParams(location.search);
        const sessionId = params.get("id");
        const status = params.get("status");
        console.log("104  >>>>>>>>> ", status, sessionId);

        if (!sessionId) {
          setLoading(false);
          return;
        }

        const transactionResult = await fetchTransactionDetails(sessionId);

        if (transactionResult) {
          setTransactionData(transactionResult);

          // Si la transacción está pendiente, configurar polling
          if (transactionResult.status === "PENDING") {
            const timer = setTimeout(() => {
              setPollingCount((prev) => prev + 1);
            }, 3000);
            setPollingTimer(timer);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in polling:", error);
        setLoading(false);
      }
    };

    startPolling();

    return () => {
      if (pollingTimer) {
        clearTimeout(pollingTimer);
      }
    };
  }, [location]);

  // Efecto para manejar el polling
  useEffect(() => {
    const handlePolling = async () => {
      if (pollingCount > 0 && pollingCount <= 20) {
        try {
          const params = new URLSearchParams(location.search);
          const sessionId = params.get("id");

          const updatedTransaction = await fetchTransactionDetails(sessionId);

          if (updatedTransaction) {
            setTransactionData(updatedTransaction);

            // Si la transacción ya no está pendiente o alcanzamos el límite, detenerla
            if (updatedTransaction.status !== "PENDING" || pollingCount >= 20) {
              setLoading(false);
            } else {
              const timer = setTimeout(() => {
                setPollingCount((prev) => prev + 1);
              }, 3000);
              setPollingTimer(timer);
            }
          } else {
            setLoading(false);
          }
        } catch (error) {
          console.error("Error in polling:", error);
          setLoading(false);
        }
      } else if (pollingCount > 20) {
        setLoading(false);
      }
    };

    if (pollingCount > 0) {
      handlePolling();
    }
  }, [pollingCount, location]);

  // Función para determinar el estado de la sesión de Stripe
  const getSessionStatus = (session) => {
    // Determinar el estado basado en session.status y payment_status
    if (session.status === "complete" && session.payment_status === "paid") {
      return { code: "APPROVED", message: "¡Transacción Exitosa!" };
    } else if (
      session.status === "complete" &&
      session.payment_status === "unpaid"
    ) {
      return { code: "DECLINED", message: "Transacción Rechazada" };
    } else if (session.status === "expired") {
      return { code: "VOIDED", message: "Transacción Expirada" };
    } else if (session.status === "open") {
      return { code: "PENDING", message: "Transacción en Proceso" };
    } else {
      return { code: "ERROR", message: "Error en la Transacción" };
    }
  };

  // parsear la referencia
  const parseReferenceString = (reference) => {
    try {
      const result = {
        assistants: [],
        complements: [],
      };

      const parts = reference.split("-");

      for (const part of parts) {
        if (part.includes("=")) {
          const [key, value] = part.split("=");

          if (key === "assistants") {
            if (value) {
              result.assistants = value.split("+");
            }
          } else if (key === "complements") {
            if (value) {
              result.complements = value.split("+");
            }
          } else if (key === "recurring" && value === "true") {
            result.recurring = true;
          } else if (key && value) {
            result[key] = value;
          }
        }
      }

      return result;
    } catch (e) {
      console.error("Error parsing reference:", e);
      return {
        assistants: [],
        complements: [],
      };
    }
  };

  // Función para procesar asistentes
  const processAssistants = (assistants) => {
    const assistantMap = {
      ventas: {
        name: "Asistente de ventas por WhatsApp",
        icon: "bx bxl-whatsapp",
      },
      comentarios: {
        name: "Asistente de comentarios",
        icon: "bx-message-rounded-dots",
      },
      carritos: { name: "Asistente de carritos abandonados", icon: "bx-cart" },
      marketing: { name: "Asistente de Marketing", icon: "bx-line-chart" },
    };

    return assistants.map((id) => ({
      id,
      name: assistantMap[id]?.name || id,
      icon: assistantMap[id]?.icon || "bx-bot",
    }));
  };

  // Función para procesar complementos
  const processComplements = (complements) => {
    return complements.map((comp) => {
      const parts = comp.split("_");
      const type = parts[0];

      if (type === "bot") {
        const quantity = parts[1] || "1";
        return {
          id: comp,
          type: "bot",
          name: "Bot Adicional",
          icon: "bx-bot",
          quantity: parseInt(quantity, 10),
          description: `${quantity} Bot${quantity > 1 ? "s" : ""} adicional${
            quantity > 1 ? "es" : ""
          }`,
        };
      } else if (type === "member") {
        const quantity = parts[1] || "1";
        return {
          id: comp,
          type: "member",
          name: "Miembro Adicional",
          icon: "bx-user-plus",
          quantity: parseInt(quantity, 10),
          description: `${quantity} Miembro${
            quantity > 1 ? "s" : ""
          } adicional${quantity > 1 ? "es" : ""}`,
        };
      } else if (type === "webhooks") {
        const quantity = parts[1] || "1";
        const flowNs = parts[2] || "";
        return {
          id: comp,
          type: "webhooks",
          name: "Webhooks Diarios",
          icon: "bx-link",
          quantity: parseInt(quantity, 10),
          flowNs,
          description: `${quantity * 1000} Webhooks diarios${
            flowNs ? ` para bot ${flowNs}` : ""
          }`,
        };
      }

      return {
        id: comp,
        type: "unknown",
        name: comp,
        icon: "bx-package",
        description: comp,
      };
    });
  };

  const getPaymentMethodName = (methodType) => {
    switch (methodType) {
      case "CARD":
        return "";
      case "NEQUI":
        return "Nequi";
      case "PSE":
        return "PSE";
      case "BANCOLOMBIA_TRANSFER":
        return "Transferencia Bancolombia";
      case "BANCOLOMBIA_COLLECT":
        return "Recaudo Bancolombia";
      case "DAVIPLATA":
        return "Daviplata";
      default:
        return methodType;
    }
  };

  useEffect(() => {
    const originalTitle = document.title;

    return () => {
      document.title = originalTitle;
    };
  }, [transactionData]);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Recibo de Pago - ${transactionData?.id || ""}`;

    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  const isRecurringValid = (data) => {
    return data.recurring && data.paymentMethod === "CARD";
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
        {pollingCount > 0 && (
          <p className="polling-message">
            Verificando el estado de tu pago...
            {pollingCount > 5 && " Esto puede tomar unos momentos."}
          </p>
        )}
      </div>
    );
  }

  const isSuccessful = transactionData?.status === "APPROVED";
  const isPending = transactionData?.status === "PENDING";

  const getCurrentDateFormatted = () => {
    const now = new Date();
    return now.toLocaleDateString() + " " + now.toLocaleTimeString();
  };

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <img
          src={chatea}
          alt="Chatea Logo"
          className="img-fluid chatea-logo"
          style={{ maxWidth: "220px" }}
        />
      </div>

      {!transactionData ? (
        <div className="confirmation-card p-4 bg-white rounded">
          <div className="error-icon-container">
            <i className="bx bx-error-circle error-icon"></i>
          </div>
          <h2 className="text-center">Información No Disponible</h2>
          <p className="text-center text-muted">
            No se pudieron obtener los detalles de la transacción
          </p>
          <div className="text-center mt-4">
            <button
              className="btn-primary"
              onClick={() => (window.location.href = "/")}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      ) : (
        <div className="confirmation-card p-4 bg-white rounded">
          <div className="text-center mb-4">
            {isSuccessful ? (
              <>
                <div className="success-icon-container">
                  <i className="bx bx-check-circle success-icon"></i>
                </div>
                <h2 className="confirmation-title">
                  {transactionData.statusMessage}
                </h2>
                <p className="text-muted">
                  Tu pago ha sido procesado correctamente
                </p>
              </>
            ) : isPending ? (
              <>
                <div className="pending-icon-container">
                  <i className="bx bx-time pending-icon"></i>
                </div>
                <h2 className="confirmation-title pending-title">
                  {transactionData.statusMessage}
                </h2>
                <p className="text-muted">
                  Tu pago está siendo procesado. Esto puede tomar unos minutos.
                </p>
                <p className="refresh-hint">
                  <i className="bx bx-refresh"></i> Puedes actualizar esta
                  página en unos momentos para ver el estado actualizado.
                </p>
              </>
            ) : (
              <>
                <div className="error-icon-container">
                  <i className="bx bx-x-circle error-icon"></i>
                </div>
                <h2 className="confirmation-title">
                  {transactionData.statusMessage}
                </h2>
                <p className="text-muted">Hubo un problema con tu pago</p>
              </>
            )}
          </div>

          {/* Alerta de pago recurrente inválido solo si no es tarjeta */}
          {isSuccessful &&
            transactionData.recurring &&
            transactionData.paymentMethod !== "CARD" && (
              <div className="recurring-payment-alert">
                <span>
                  <strong>Nota importante:</strong> Has solicitado un pago
                  recurrente, pero el método de pago utilizado (
                  {transactionData.paymentMethodName}) no es compatible con esta
                  función. Los pagos recurrentes solo son posibles con tarjetas.
                </span>
              </div>
            )}

          <div
            className="transaction-details"
            data-print-date={getCurrentDateFormatted()}
          >
            <h4 className="details-title">Detalles de la transacción</h4>

            <div className="transaction-info-grid">
              <div className="transaction-info-item">
                <div className="info-label">ID de Transacción</div>
                <div className="info-value">{transactionData.id}</div>
              </div>

              <div className="transaction-info-item">
                <div className="info-label">Estado</div>
                <div className="info-value">
                  <span
                    className={`status-badge ${
                      isSuccessful ? "success" : isPending ? "pending" : "error"
                    }`}
                  >
                    {transactionData.status}
                  </span>
                </div>
              </div>

              <div className="transaction-info-item">
                <div className="info-label">Fecha</div>
                <div className="info-value">{transactionData.createdAt}</div>
              </div>

              <div className="transaction-info-item">
                <div className="info-label">Monto</div>
                <div className="info-value amount-display">
                  <div className="amount-value">
                    <span>${transactionData.amountUSD.toFixed(2)}</span>
                    <span className="currency-label">USD</span>
                  </div>
                  <div className="amount-divider">-</div>
                  <div className="amount-value">
                    <span>
                      ${Math.round(transactionData.amountCOP).toLocaleString()}
                    </span>
                    <span className="currency-label">COP</span>
                  </div>
                </div>
              </div>

              {/* Método de pago con detalles adicionales para tarjetas */}
              <div className="transaction-info-item">
                <div className="info-label">Método de Pago</div>
                <div className="info-value">
                  {transactionData.paymentMethodName}
                  {transactionData.paymentMethod === "CARD" && (
                    <div className="card-details">
                      {transactionData.cardBrand && (
                        <span className="card-brand">
                          {transactionData.cardBrand}
                        </span>
                      )}
                      {transactionData.cardLastFour && (
                        <span className="card-last-four">
                          **** {transactionData.cardLastFour}
                        </span>
                      )}
                      {transactionData.cardType && (
                        <span className="card-type-badge">
                          {transactionData.cardType === "CREDIT"
                            ? "Crédito"
                            : "Débito"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {transactionData.plan_id && (
                <div className="transaction-info-item">
                  <div className="info-label">Plan</div>
                  <div className="info-value">{transactionData.plan_id}</div>
                </div>
              )}

              {transactionData.workspace_id && (
                <div className="transaction-info-item">
                  <div className="info-label">ID del Espacio</div>
                  <div className="info-value">
                    {transactionData.workspace_id}
                  </div>
                </div>
              )}

              {/* Estatus de pago recurrente */}
              <div className="transaction-info-item">
                <div className="info-label">Pago Recurrente</div>
                <div className="info-value">
                  {isRecurringValid(transactionData) ? (
                    <span className="recurring-badge active">
                      Activo
                      {transactionData.cardType && (
                        <span className="ms-1 card-type-small">
                          (Tarjeta{" "}
                          {transactionData.cardType === "CREDIT"
                            ? "Crédito"
                            : "Débito"}
                          )
                        </span>
                      )}
                    </span>
                  ) : transactionData.recurring ? (
                    <span className="recurring-badge inactive">
                      No disponible con {transactionData.paymentMethodName}
                    </span>
                  ) : (
                    <span className="recurring-badge inactive">Inactivo</span>
                  )}
                </div>
              </div>
            </div>

            {/* Asistentes */}
            {transactionData.assistants &&
              transactionData.assistants.length > 0 && (
                <div className="features-panel">
                  <h5 className="panel-title">
                    <i className="bx bx-bot panel-icon"></i>
                    Asistentes Adquiridos
                  </h5>
                  <div className="feature-cards">
                    {transactionData.assistants.map((assistant, idx) => (
                      <div key={idx} className="feature-card">
                        <div className="feature-icon">
                          <i className={`bx ${assistant.icon}`}></i>
                        </div>
                        <div className="feature-content">
                          <h6 className="feature-name">{assistant.name}</h6>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Complementos */}
            {transactionData.complements &&
              transactionData.complements.length > 0 && (
                <div className="features-panel">
                  <h5 className="panel-title">
                    <i className="bx bx-package panel-icon"></i>
                    Complementos Adquiridos
                  </h5>
                  <div className="feature-cards">
                    {transactionData.complements.map((complement, idx) => (
                      <div key={idx} className="feature-card">
                        <div className="feature-icon">
                          <i className={`bx ${complement.icon}`}></i>
                        </div>
                        <div className="feature-content">
                          <h6 className="feature-name">{complement.name}</h6>
                          <p className="feature-desc">
                            {complement.description}
                          </p>
                        </div>
                        {complement.quantity > 1 && (
                          <div className="feature-quantity">
                            {complement.quantity}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="action-buttons">
              <button
                className="btn-primary"
                onClick={() => (window.location.href = "/")}
              >
                Volver al inicio
              </button>

              {isSuccessful && (
                <button className="btn-outline" onClick={handlePrint}>
                  <i className="bx bx-printer me-2"></i>
                  Imprimir recibo
                </button>
              )}

              {isPending && (
                <button
                  className="btn-outline"
                  onClick={() => window.location.reload()}
                >
                  <i className="bx bx-refresh me-2"></i>
                  Actualizar estado
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StripeConfirmation;
