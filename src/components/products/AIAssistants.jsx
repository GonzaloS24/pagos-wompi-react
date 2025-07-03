/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { fetchAssistants } from "../../services/dataService";
import { PRICING } from "../../utils/constants";

const AIAssistants = ({
  selectedAssistants,
  onAssistantChange,
  isStandalone,
}) => {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssistants = async () => {
      try {
        const assistantsData = await fetchAssistants();
        setAssistants(assistantsData);
      } catch (error) {
        console.error("Error loading assistants:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAssistants();
  }, []);

  // Determinar cuál es el primer asistente seleccionado (gratis)
  const freeAssistant =
    !isStandalone && selectedAssistants.length > 0
      ? selectedAssistants[0]
      : null;

  // Handler para cambiar selección
  const handleAssistantChange = (assistantId) => {
    onAssistantChange(assistantId);
  };

  if (loading) {
    return (
      <div className="assistants-section p-2 bg-white rounded">
        <h5 style={{ color: "#009ee3" }} className="mb-3">
          Cargando asistentes...
        </h5>
      </div>
    );
  }

  return (
    <div className="assistants-section p-2 bg-white rounded">
      <h5 style={{ color: "#009ee3" }} className="mb-3">
        Asistentes de IA Disponibles
      </h5>

      {/* Mensaje sobre asistente gratuito para planes */}
      {!isStandalone && (
        <div className="free-assistant-info mb-3">
          <div
            className="alert alert-info d-flex align-items-center"
            style={{
              background: "#edf4ff",
              border: "1px solid rgba(0, 158, 227, 0.2)",
              borderRadius: "8px",
              padding: "1rem",
              margin: "0 0 1rem 0",
            }}
          >
            <div className="me-3" style={{ fontSize: "2rem" }}>
              🎁
            </div>
            <div>
              <strong style={{ color: "#009ee3" }}>
                ¡Tu plan incluye 1 asistente GRATIS!
              </strong>
              <br />
              <small className="text-muted">
                Asistentes adicionales cuestan $
                {PRICING.ASSISTANT_PRICE_USD || 20} USD cada uno.
              </small>
            </div>
          </div>
        </div>
      )}

      <p className="text-muted mb-3">
        Selecciona tus asistentes. Puedes elegir uno de forma gratuita.
      </p>

      <div className="assistants-grid">
        {assistants.map((assistant) => {
          const isComingSoon = assistant.comingSoon === true;
          const isSelected = selectedAssistants.includes(assistant.id);
          const isFreeAssistant = assistant.id === freeAssistant;

          return (
            <div
              key={assistant.id}
              className="form-check mb-2 d-flex align-items-center"
            >
              <input
                className="form-check-input"
                type="checkbox"
                id={assistant.id}
                checked={isSelected}
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
                {/* Badge para asistente gratuito */}
                {isFreeAssistant && !isStandalone && (
                  <span className="ms-2 badge bg-success">Gratis</span>
                )}
              </label>

              {isComingSoon && (
                <span className="badge badge-coming-soon">Próximamente</span>
              )}
            </div>
          );
        })}
        {!isStandalone && selectedAssistants.length === 0 && (
          <span className="text-warning d-block mt-1">
            <small>
              Sin asistentes seleccionados perderás el asistente gratuito
              incluido en tu plan.
            </small>
          </span>
        )}
      </div>
    </div>
  );
};

export default AIAssistants;
