/* eslint-disable react/prop-types */
import { ASSISTANTS_CONFIG, PRICING } from "../../utils/constants";

const AIAssistants = ({
  selectedAssistants,
  onAssistantChange,
  isStandalone,
}) => {
  // Determinar cuál es el primer asistente seleccionado (gratis)
  const freeAssistant =
    !isStandalone && selectedAssistants.length > 0
      ? selectedAssistants[0]
      : null;

  // Handler para cambiar selección
  const handleAssistantChange = (assistantId) => {
    onAssistantChange(assistantId);
  };

  return (
    <div className="assistants-section p-2 bg-white rounded">
      <h5 style={{ color: "#009ee3" }} className="mb-3">
        Asistentes de IA Disponibles
      </h5>

      <p className="text-muted mb-3">
        {!isStandalone
          ? `Tu plan incluye un asistente gratuito. Asistentes adicionales tienen un costo de $${PRICING.ASSISTANT_PRICE_USD} USD cada uno.`
          : "Cada asistente tiene un costo adicional de $20 USD"}
      </p>

      {!isStandalone && selectedAssistants.length === 0 && (
        <div
          className="alert alert-warning mb-3 free-assistant-alert"
          role="alert"
        >
          Selecciona al menos un asistente para continuar.
        </div>
      )}

      <div className="assistants-grid">
        {ASSISTANTS_CONFIG.map((assistant) => {
          const isComingSoon = assistant.comingSoon === true;

          return (
            <div
              key={assistant.id}
              className="form-check mb-2 d-flex align-items-center"
            >
              <input
                className="form-check-input"
                type="checkbox"
                id={assistant.id}
                checked={selectedAssistants.includes(assistant.id)}
                onChange={() => handleAssistantChange(assistant.id)}
                disabled={isComingSoon}
              />
              <label
                className={`form-check-label ${
                  isComingSoon ? "text-muted" : ""
                }`}
                htmlFor={assistant.id}
              >
                {assistant.label}&nbsp;
                <span className="assistant-description">
                  {assistant.description}
                </span>
                {assistant.id === freeAssistant && !isStandalone && (
                  <span className="ms-2 badge bg-success">Gratis</span>
                )}
              </label>  
              {isComingSoon && (
                <span className="badge badge-coming-soon">Próximamente</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIAssistants;
