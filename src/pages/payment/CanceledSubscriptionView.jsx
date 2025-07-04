/* eslint-disable no-misleading-character-class */
/* eslint-disable react/prop-types */
import { ASSISTANT_DISPLAY_INFO } from "../../utils/constants";

const CanceledSubscriptionView = ({ subscription }) => {
  // Función para obtener el emoji del asistente
  const getAssistantEmoji = (assistantId) => {
    const emojiMap = {
      ventas: "🔥",
      carritos: "🛒",
      comentarios: "💬",
      marketing: "📈",
      remarketing: "🎯",
      voz: "🎤",
    };
    return emojiMap[assistantId] || "🤖";
  };

  // Función para obtener el nombre del asistente
  const getAssistantName = (assistantId) => {
    const displayInfo = ASSISTANT_DISPLAY_INFO[assistantId];
    if (displayInfo) {
      // Quitar emojis del label original
      return displayInfo.label.replace(/[🔥🛒💬📈🎯🎤🤖]/g, "").trim();
    }
    return assistantId;
  };

  // Función para obtener el emoji del complemento
  const getComplementEmoji = (complementId) => {
    const emojiMap = {
      bot: "🤖",
      member: "🙋‍♀️",
      webhooks: "🔗",
    };
    return emojiMap[complementId] || "📦";
  };

  // Función para obtener el nombre del complemento
  const getComplementName = (complement) => {
    // Quitar emojis del nombre original
    return complement.name.replace(/[🤖🙋‍♀️🔗📦]/g, "").trim();
  };

  return (
    <div className="canceled-subscription-simple">
      <div className="subscription-card">
        <div className="subscription-status">
          <h4 style={{ color: "#009ee3" }}>
            Tu Suscripción {subscription.isExpired ? "Expirada" : "Cancelada"}
          </h4>
          <div
            className={`status-badge ${
              subscription.isExpired ? "expired" : "canceled"
            }`}
          >
            {subscription.isExpired
              ? `⏰ Expiró el ${subscription.nextPaymentDate}`
              : `📅 Activa hasta el ${subscription.nextPaymentDate}`}
          </div>
        </div>

        <div className="subscription-summary">
          <h5 style={{ color: "#009ee3" }}>Resumen de tu Suscripción</h5>

          <div className="summary-content">
            {/* Plan */}
            <div className="summary-row">
              <span className="summary-label">
                Plan: {subscription.planName}
              </span>
              <span className="summary-value">
                ${subscription.monthlyAmount} USD
              </span>
            </div>

            {/* Asistentes */}
            {subscription.assistants.length > 0 && (
              <div className="summary-section">
                <hr
                  style={{
                    margin: "0.75rem 0",
                    borderColor: "rgba(0, 158, 227)",
                  }}
                />
                {subscription.assistants.map((assistantId, index) => (
                  <div key={assistantId} className="summary-row item-row">
                    <span className="summary-label">
                      <span className="item-emoji">
                        {getAssistantEmoji(assistantId)}
                      </span>
                      {getAssistantName(assistantId)}
                      {index === 0 && <span className="free-tag">Gratis</span>}
                    </span>
                    <span className="summary-value">
                      {index === 0 ? "$0 USD" : "$20 USD"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Complementos */}
            {subscription.complements.length > 0 && (
              <div className="summary-section">
                <hr
                  style={{
                    margin: "0.75rem 0",
                    borderColor: "rgba(0, 158, 227)",
                  }}
                />
                {subscription.complements.map((complement, index) => (
                  <div key={index} className="summary-row item-row">
                    <span className="summary-label">
                      <span className="item-emoji">
                        {getComplementEmoji(complement.id)}
                      </span>
                      {getComplementName(complement)}
                      {complement.quantity > 1 && (
                        <span className="quantity-tag">
                          x{complement.quantity}
                        </span>
                      )}
                      {complement.selectedBot && (
                        <span className="bot-tag">
                          ({complement.selectedBot.name})
                        </span>
                      )}
                    </span>
                    <span className="summary-value">
                      ${complement.totalPrice} USD
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            {/* <div className="summary-row total-row">
              <span className="summary-label">Total mensual:</span>
              <span className="summary-value total-value">
                ${subscription.monthlyAmount} USD
              </span>
            </div> */}
          </div>

          {/* <div className="reactivation-actions">
            <button
              className="btn-reactivate-simple"
              onClick={handleReactivate}
              disabled={loading}
              title="Funcionalidad próximamente disponible"
            >
              {loading ? "Procesando..." : "🔄 Reactivar Suscripción"}
            </button>
            
            <p className="reactivation-note">
              <small>⚠️ La reactivación estará disponible próximamente</small>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CanceledSubscriptionView;
