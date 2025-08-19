/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { fetchAssistants } from "../../../services/dataService";

const AssistantsSection = ({
  subscription,
  selectedAssistants,
  onAssistantChange,
}) => {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssistants = async () => {
      try {
        const assistantsData = await fetchAssistants();
        // Filtrar solo los que no son "coming soon"
        const availableAssistants = assistantsData.filter(
          (assistant) => !assistant.comingSoon
        );
        setAssistants(availableAssistants);
      } catch (error) {
        console.error("Error loading assistants:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAssistants();
  }, []);

  if (loading) {
    return (
      <div className="current-assistants-section">
        <h5 style={{ color: "#009ee3" }}>Cargando asistentes...</h5>
      </div>
    );
  }

  return (
    <div className="current-assistants-section">
      <h5 style={{ color: "#009ee3" }}>Asistentes</h5>
      <div className="assistants-list">
        {assistants.map((assistant) => {
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
