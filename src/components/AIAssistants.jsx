/* eslint-disable react/prop-types */
const AIAssistants = ({ selectedAssistants, onAssistantChange }) => {
  const assistantsData = [
    {
      id: "ventas",
      type: "Asistente de ventas por WhatsApp",
      label: "Asistente de ventas por WhatsApp",
    },
    {
      id: "comentarios",
      type: "asistente de comentarios",
      label: "Asistente de comentarios",
    },
    {
      id: "carritos",
      type: "asistente de carritos abandonados",
      label: "Asistente de carritos abandonados",
    },
    {
      id: "marketing",
      type: "asistente de Marketing",
      label: "Asistente de Marketing",
    },
  ];

  return (
    <div className="assistants-section p-2 bg-white rounded">
      <h5 style={{ color: "#009ee3" }} className="mb-3">
        Asistentes de IA Disponibles
      </h5>
      <p className="text-muted mb-3">
        Cada asistente tiene un costo adicional de $20 USD
      </p>
      <div className="assistants-grid">
        {assistantsData.map((assistant) => (
          <div key={assistant.id} className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id={assistant.id}
              checked={selectedAssistants.includes(assistant.id)}
              onChange={() => onAssistantChange(assistant.id)}
            />
            <label className="form-check-label" htmlFor={assistant.id}>
              {assistant.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIAssistants;
