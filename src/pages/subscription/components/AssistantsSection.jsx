/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { ASSISTANTS_CONFIG } from "../../../utils/constants";
import { getAllAssistants } from "../service/assistants";

const AssistantsSection = ({
  subscription,
  selectedAssistants,
  onAssistantChange,
}) => {
  const getAssistants = async () => {
    try {
      const asistants = await getAllAssistants();
      console.log("14  >>>>>>>>> ", asistants);
    } catch (error) {
      console.error("Error al cargar las estadísticas:", error);
    }
  };

  useEffect(() => {
    getAssistants();
  }, []);

  return (
    <div className="current-assistants-section">
      <h5 style={{ color: "#009ee3" }}>Asistentes</h5>
      <div className="assistants-list">
        {ASSISTANTS_CONFIG.filter((assistant) => !assistant.comingSoon).map(
          (assistant) => {
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
          }
        )}
      </div>
    </div>
  );
};

export default AssistantsSection;
