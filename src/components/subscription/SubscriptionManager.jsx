/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { ASSISTANTS_CONFIG } from "../../utils/constants";
import LoadingSpinner from "../common/LoadingSpinner";
import CreditCardForm from "../payments/wompi/CreditCardForm";
import Swal from "sweetalert2";
import "../../styles/components/SubscriptionManager.css";
import { MdOutlineUpgrade } from "react-icons/md";
import { IoIosRemove, IoMdAdd } from "react-icons/io";

const SubscriptionManager = ({ workspaceId, onSubscriptionCanceled }) => {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modifying, setModifying] = useState(false);
  const [selectedAssistants, setSelectedAssistants] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [changesSummary, setChangesSummary] = useState(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, [workspaceId]);

  useEffect(() => {
    calculateChanges();
  }, [selectedAssistants, selectedPlan, subscription]);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      const [subscriptionData, plansData] = await Promise.all([
        simulateGetSubscription(workspaceId),
        simulateGetPlans(),
      ]);

      setSubscription(subscriptionData);
      setPlans(plansData);

      if (subscriptionData) {
        setSelectedAssistants(subscriptionData.assistants || []);
        setSelectedPlan(
          plansData.find((p) => p.id === subscriptionData.planId) || null
        );
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateChanges = () => {
    if (!subscription) return;

    const currentAssistants = subscription.assistants || [];
    const currentPlan = subscription.planId;

    const assistantsToAdd = selectedAssistants.filter(
      (id) => !currentAssistants.includes(id)
    );
    const assistantsToRemove = currentAssistants.filter(
      (id) => !selectedAssistants.includes(id)
    );
    const planChange = selectedPlan?.id !== currentPlan ? selectedPlan : null;

    // Simular respuesta del backend con precios y descuentos
    const summary = simulateCalculateChanges({
      assistantsToAdd,
      assistantsToRemove,
      planChange,
      currentPlan: subscription.planId,
    });

    setChangesSummary(summary);
  };

  const handleAssistantChange = (assistantId) => {
    setSelectedAssistants((prev) => {
      if (prev.includes(assistantId)) {
        return prev.filter((id) => id !== assistantId);
      } else {
        return [...prev, assistantId];
      }
    });
  };

  const handlePlanChange = (e) => {
    const planId = e.target.value;
    const plan = plans.find((p) => p.id === planId);
    setSelectedPlan(plan);
  };

  const handleProceedToPayment = () => {
    if (!changesSummary || changesSummary.totalAmount <= 0) {
      handleSaveChanges();
      return;
    }
    setShowPaymentForm(true);
  };

  const handleSaveChanges = async (paymentData = null) => {
    setModifying(true);
    try {
      await simulateUpdateSubscription(workspaceId, {
        assistants: selectedAssistants,
        planId: selectedPlan?.id,
        paymentData,
      });

      Swal.fire({
        icon: "success",
        title: "¡Suscripción Actualizada!",
        text: "Los cambios han sido aplicados exitosamente",
        confirmButtonColor: "#009ee3",
      });

      setShowPaymentForm(false);
      fetchSubscriptionData();
    } catch (error) {
      console.error("Error updating subscription:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron guardar los cambios. Intenta nuevamente.",
        confirmButtonColor: "#009ee3",
      });
    } finally {
      setModifying(false);
    }
  };

  const handleCardSubmit = async (cardData) => {
    await handleSaveChanges(cardData);
  };

  const handleCancelSubscription = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Cancelar Suscripción",
      html: `
        <p>¿Estás seguro de que quieres cancelar tu suscripción?</p>
        <p><strong>Esta acción no se puede deshacer.</strong></p>
        <p><small>Tu acceso continuará hasta el final del período pagado.</small></p>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar suscripción",
      cancelButtonText: "No, mantener",
      confirmButtonColor: "#dc3545",
    });

    if (result.isConfirmed) {
      setModifying(true);
      try {
        await simulateCancelSubscription(workspaceId);

        Swal.fire({
          icon: "info",
          title: "Suscripción Cancelada",
          text: "Tu suscripción ha sido cancelada. Tendrás acceso hasta el final del período pagado.",
          confirmButtonColor: "#009ee3",
        });

        onSubscriptionCanceled?.();
      } catch (error) {
        console.error("Error canceling subscription:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cancelar la suscripción. Intenta nuevamente.",
          confirmButtonColor: "#009ee3",
        });
      } finally {
        setModifying(false);
      }
    }
  };

  const hasChanges = () => {
    if (!subscription) return false;
    const currentAssistants = subscription.assistants || [];
    const assistantsChanged =
      JSON.stringify(selectedAssistants.sort()) !==
      JSON.stringify(currentAssistants.sort());
    const planChanged = selectedPlan?.id !== subscription.planId;
    return assistantsChanged || planChanged;
  };

  if (loading) {
    return <LoadingSpinner message="Cargando tu suscripción..." />;
  }

  if (!subscription) {
    return (
      <div className="no-subscription">
        <div className="text-center">
          <i
            className="bx bx-info-circle"
            style={{ fontSize: "3rem", color: "#009ee3" }}
          ></i>
          <h4>No tienes una suscripción activa</h4>
          <p className="text-muted">
            Puedes crear una nueva suscripción desde la página principal.
          </p>
        </div>
      </div>
    );
  }

  if (showPaymentForm) {
    return (
      <div className="subscription-payment">
        <div className="payment-header">
          <button
            className="btn-back"
            onClick={() => setShowPaymentForm(false)}
            disabled={modifying}
          >
            ← Volver
          </button>
          <h3 style={{ color: "#009ee3" }}>Procesar Pago</h3>
        </div>

        <div className="payment-content">
          <div className="payment-summary">
            <h5>Resumen del Pago</h5>
            <div className="summary-details">
              {changesSummary?.items?.map((item, index) => (
                <div key={index} className="summary-item">
                  <span>{item.description}</span>
                  <span>${item.amount.toFixed(2)} USD</span>
                </div>
              ))}
              <div className="summary-total">
                <span>
                  <strong>Total a pagar:</strong>
                </span>
                <span>
                  <strong>
                    ${changesSummary?.totalAmount?.toFixed(2)} USD
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <CreditCardForm
            onSubmit={handleCardSubmit}
            loading={modifying}
            onCancel={() => setShowPaymentForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-manager">
      <div className="subscription-header">
        <h3 style={{ color: "#009ee3" }}>Gestionar mi suscripción</h3>
        <p className="text-muted">Administra tu plan y asistentes activos</p>
      </div>

      <div className="subscription-content">
        {/* Columna Izquierda - Configuración Actual y Modificaciones */}
        <div className="subscription-left">
          {/* Plan Actual */}
          <div className="current-plan-section">
            <h5 style={{ color: "#009ee3" }}>Plan Actual</h5>
            <div className="current-plan-info">
              <div className="plan-details">
                <span className="plan-name">{subscription.planName}</span>
                <span className="plan-status">
                  Estado:{" "}
                  <span
                    className={`status ${subscription.status.toLowerCase()}`}
                  >
                    {subscription.status === "ACTIVE"
                      ? "Activa"
                      : subscription.status}
                  </span>
                </span>
                <span className="plan-next-payment">
                  Próximo pago: {subscription.nextPaymentDate}
                </span>
                {/* Botón Cancelar Suscripción */}
                <div className="cancel-section">
                  <button
                    className="btn-cancel-subscription"
                    onClick={handleCancelSubscription}
                    disabled={modifying}
                  >
                    Cancelar Suscripción
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Selector de Plan */}
          <div className="plan-selector-section">
            <h6>Cambiar Plan</h6>
            <select
              className="form-select"
              value={selectedPlan?.id || ""}
              onChange={handlePlanChange}
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.priceUSD} USD/mes
                </option>
              ))}
            </select>
          </div>

          {/* Asistentes Actuales */}
          <div className="current-assistants-section">
            <h5 style={{ color: "#009ee3" }}>Asistentes</h5>
            <div className="assistants-list">
              {ASSISTANTS_CONFIG.filter(
                (assistant) => !assistant.comingSoon
              ).map((assistant) => {
                const isSelected = selectedAssistants.includes(assistant.id);
                const isCurrentlyActive = subscription.assistants.includes(
                  assistant.id
                );

                return (
                  <div key={assistant.id} className="form-check assistant-item">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={assistant.id}
                      checked={isSelected}
                      onChange={() => handleAssistantChange(assistant.id)}
                    />
                    <label className="form-check-label" htmlFor={assistant.id}>
                      <div className="assistant-info">
                        <span>{assistant.label}</span>

                        {isCurrentlyActive && (
                          <span className="current-badge">Actual</span>
                        )}
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Columna Derecha - Resumen de Cambios */}
        <div className="subscription-right">
          <div className="changes-summary">
            <h5 style={{ color: "#009ee3" }}>Resumen de Cambios</h5>

            {!hasChanges() ? (
              <div className="no-changes">
                <p className="text-muted">No hay cambios pendientes</p>
              </div>
            ) : (
              <div className="changes-content">
                {changesSummary?.items?.map((item, index) => (
                  <div key={index} className="change-item">
                    <div className="change-description">
                      <span className={`change-type ${item.type}`}>
                        {item.type === "add" ? (
                          <IoMdAdd style={{ fontSize: "25px" }} />
                        ) : item.type === "remove" ? (
                          <IoIosRemove style={{ fontSize: "25px" }} />
                        ) : (
                          <MdOutlineUpgrade style={{ fontSize: "25px" }} />
                        )}
                      </span>
                      <span>{item.description}</span>
                    </div>
                    <div className="change-amount">
                      {item.amount > 0 ? `$0.00` : "$0.00"}
                    </div>
                  </div>
                ))}

                {changesSummary?.totalAmount > 0 && (
                  <div className="total-amount">
                    <p>Total a pagar: $0.00 USD</p>
                    {/* <p>${changesSummary.totalAmount.toFixed(2)} </p> */}
                  </div>
                )}

                <button
                  className="btn-apply-changes"
                  onClick={handleProceedToPayment}
                  disabled={modifying}
                >
                  {changesSummary?.totalAmount > 0
                    ? "Proceder al Pago"
                    : "Aplicar Cambios"}
                </button>
              </div>
            )}

            {hasChanges() && (
              <div className="changes-notice">
                <span>Los cambios se aplicarán inmediatamente</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// === FUNCIONES SIMULADAS DE API ===

const simulateGetSubscription = async (workspaceId) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (workspaceId === "123456789") {
    return {
      id: "sub_123456",
      planId: "business",
      planName: "Chatea Pro Start",
      status: "ACTIVE",
      assistants: ["ventas", "carritos"],
      monthlyAmount: 69.0,
      nextPaymentDate: "15 de Agosto, 2025",
      createdAt: "2025-07-15",
      workspaceId: workspaceId,
    };
  }

  return null;
};

const simulateGetPlans = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    { id: "business", name: "Chatea Pro Start", priceUSD: 49 },
    { id: "business_lite", name: "Chatea Pro Advanced", priceUSD: 109 },
    { id: "custom_plan3", name: "Chatea Pro Plus", priceUSD: 189 },
    { id: "business_large", name: "Chatea Pro Master", priceUSD: 399 },
  ];
};

const simulateCalculateChanges = ({
  assistantsToAdd,
  assistantsToRemove,
  planChange,
  currentPlan,
}) => {
  const items = [];
  let totalAmount = 0;

  // Cambio de plan
  if (planChange) {
    const plans = {
      business: { name: "Chatea Pro Start", price: 49 },
      business_lite: { name: "Chatea Pro Advanced", price: 109 },
      custom_plan3: { name: "Chatea Pro Plus", price: 189 },
      business_large: { name: "Chatea Pro Master", price: 399 },
    };

    const currentPlanData = plans[currentPlan];
    const newPlanData = plans[planChange.id];
    const priceDiff = newPlanData.price - currentPlanData.price;

    if (priceDiff > 0) {
      // Upgrade - se cobra la diferencia prorrateada
      const proratedAmount = priceDiff * 0.5;
      items.push({
        type: "upgrade",
        description: `Upgrade a ${newPlanData.name}`,
        amount: proratedAmount,
        discount: {
          description: `Prorrateado por 15 días restantes`,
          originalAmount: priceDiff,
        },
      });
      totalAmount += proratedAmount;
    } else if (priceDiff < 0) {
      // Downgrade - no se cobra ni se devuelve dinero
      items.push({
        type: "downgrade",
        description: `Downgrade a ${newPlanData.name}`,
        amount: 0,
        discount: {
          description: `Cambio aplicado sin costo adicional`,
        },
      });
    }
  }

  // Asistentes a agregar
  assistantsToAdd.forEach((assistantId) => {
    const assistant = ASSISTANTS_CONFIG.find((a) => a.id === assistantId);
    const assistantPrice = 20 * 0.5; // Prorrateado
    items.push({
      type: "add",
      description: `Agregar ${assistant?.label || assistantId}`,
      amount: assistantPrice,
      discount: {
        description: `Prorrateado por 15 días restantes`,
        originalAmount: 20,
      },
    });
    totalAmount += assistantPrice;
  });

  // Asistentes a remover
  assistantsToRemove.forEach((assistantId) => {
    const assistant = ASSISTANTS_CONFIG.find((a) => a.id === assistantId);
    items.push({
      type: "remove",
      description: `Remover ${assistant?.label || assistantId}`,
      amount: 0,
      discount: {
        description: `Removido sin reembolso`,
      },
    });
  });

  return {
    items,
    totalAmount: Math.max(0, totalAmount), // No permitir montos negativos
  };
};

const simulateUpdateSubscription = async (workspaceId, data) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (Math.random() > 0.1) {
    console.log("Subscription updated:", { workspaceId, data });
    return { success: true };
  } else {
    throw new Error("API Error");
  }
};

const simulateCancelSubscription = async (workspaceId) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (Math.random() > 0.05) {
    console.log("Subscription canceled:", workspaceId);
    return { success: true };
  } else {
    throw new Error("API Error");
  }
};

export default SubscriptionManager;
