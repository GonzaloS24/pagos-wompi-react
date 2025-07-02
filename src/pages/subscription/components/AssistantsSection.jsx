/* eslint-disable react/prop-types */
const AssistantsSection = ({
  subscription,
  selectedAssistants,
  onAssistantChange,
  assistantsWithDiscounts = [], // NUEVO: Recibir asistentes con discounts
}) => {
  // Si no hay asistentes de la API, mostrar loading
  if (!assistantsWithDiscounts || assistantsWithDiscounts.length === 0) {
    return (
      <div className="current-assistants-section">
        <h5 style={{ color: "#009ee3" }}>Asistentes</h5>
        <div className="text-center text-muted py-4">
          <p>Cargando asistentes disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="current-assistants-section">
      <h5 style={{ color: "#009ee3" }}>Asistentes</h5>
      <div className="assistants-list">
        {assistantsWithDiscounts.map((assistant) => {
          const isSelected = selectedAssistants.includes(assistant.name);
          const isCurrentlyActive = subscription.assistants.includes(
            assistant.name
          );

          return (
            <div key={assistant.id} className="form-check assistant-item">
              <input
                className="form-check-input"
                type="checkbox"
                id={assistant.name}
                checked={isSelected}
                onChange={() => onAssistantChange(assistant.name)}
              />
              <label className="form-check-label" htmlFor={assistant.name}>
                <div className="assistant-info">
                  <span>{assistant.name}</span>
                  {isCurrentlyActive && (
                    <span className="current-badge">Actual</span>
                  )}
                  {/* Mostrar precio de la API si está disponible */}
                  {assistant.cost && (
                    <small className="text-muted ms-2">
                      (${assistant.cost} USD - API ID: {assistant.id})
                    </small>
                  )}
                  {/* Mostrar descuentos si los hay */}
                  {assistant.discounts && assistant.discounts.length > 0 && (
                    <div className="discounts-info mt-1">
                      {assistant.discounts.map((discount, idx) => (
                        <small key={idx} className="discount-badge me-1">
                          {discount.type === 'percentage' 
                            ? `-${discount.value}%` 
                            : `-${discount.value}`}
                        </small>
                      ))}
                    </div>
                  )}
                </div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssistantsSection;