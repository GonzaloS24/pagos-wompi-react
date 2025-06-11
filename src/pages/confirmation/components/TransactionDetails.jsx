/* eslint-disable react/prop-types */
export const TransactionDetails = ({ transactionData, onPrint }) => {
  const isSuccessful = transactionData?.status === "APPROVED";
  const isPending = transactionData?.status === "PENDING";

  const getCurrentDateFormatted = () => {
    const now = new Date();
    return now.toLocaleDateString() + " " + now.toLocaleTimeString();
  };

  //   const isRecurringValid = (data) => {
  //     return data.recurring && data.paymentMethod === "CARD";
  //   };

  return (
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
            <div className="info-value">{transactionData.workspace_id}</div>
          </div>
        )}

        {/* Estatus de pago recurrente */}
        {/* <div className="transaction-info-item">
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
        </div> */}
      </div>

      {/* Asistentes */}
      {transactionData.assistants && transactionData.assistants.length > 0 && (
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
                    <p className="feature-desc">{complement.description}</p>
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
          <button className="btn-outline" onClick={onPrint}>
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
  );
};
