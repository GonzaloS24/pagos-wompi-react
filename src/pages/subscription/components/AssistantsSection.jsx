/* eslint-disable react/prop-types */
const AssistantsSection = ({
  subscription,
  selectedAssistants,
  onAssistantChange,
  assistants = [], // NUEVO: Recibir asistentes de la API
}) => {
  // Si no hay asistentes de la API, mostrar loading
  if (!assistants || assistants.length === 0) {
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
        {assistants
          .filter((assistant) => !assistant.comingSoon)
          .map((assistant) => {
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
                  onChange={() => onAssistantChange(assistant.id)}
                />
                <label className="form-check-label" htmlFor={assistant.id}>
                  <div className="assistant-info">
                    <span>{assistant.label}</span>
                    {isCurrentlyActive && (
                      <span className="current-badge">Actual</span>
                    )}
                    {/* Mostrar precio de la API si está disponible */}
                    {assistant.cost && (
                      <small className="text-muted ms-2">
                        (${assistant.cost} USD - API ID: {assistant.apiId})
                      </small>
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
