/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { fetchWorkspaceAssistants } from "../api/wompiConfig";
import Swal from "sweetalert2";
import { PuffLoader } from "react-spinners";

const AIAssistants = ({
  selectedAssistants,
  onAssistantChange,
  isStandalone,
  workspaceId,
}) => {
  const [existingAssistants, setExistingAssistants] = useState([]);
  const [loading, setLoading] = useState(false);

  const assistantMapping = {
    "Whatsapp IA": "ventas",
    Logistica: "logistica",
    "Comentarios IA": "comentarios",
    "Carritos IA": "carritos",
    Marketing: "marketing",
  };

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
    // {
    //   id: "marketing",
    //   type: "asistente de Marketing",
    //   label: "Asistente de Marketing",
    // },
  ];

  // Determinar cuál es el primer asistente seleccionado (gratis)
  const freeAssistant =
    !isStandalone && selectedAssistants.length > 0
      ? selectedAssistants[0]
      : null;

  // Cargar asistentes existentes del workspace
  useEffect(() => {
    const loadExistingAssistants = async () => {
      if (isStandalone && workspaceId) {
        setLoading(true);
        try {
          const data = await fetchWorkspaceAssistants(workspaceId);
          if (data && data.assistants_names) {
            const existingIds = data.assistants_names
              .filter((name) => name !== "Logistica")
              .map((name) => assistantMapping[name])
              .filter((id) => id);

            setExistingAssistants(existingIds);
          }
        } catch (error) {
          console.error("Error loading workspace assistants:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los asistentes del espacio de trabajo",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadExistingAssistants();
  }, [isStandalone, workspaceId]);

  // Determinar si un asistente ya existe en el workspace
  const isAssistantExisting = (assistantId) => {
    return existingAssistants.includes(assistantId);
  };

  // Handler para cambiar selección (evita seleccionar asistentes existentes)
  const handleAssistantChange = (assistantId) => {
    if (isStandalone && isAssistantExisting(assistantId)) {
      return;
    }
    onAssistantChange(assistantId);
  };

  return (
    <div className="assistants-section p-2 bg-white rounded">
      <h5 style={{ color: "#009ee3" }} className="mb-3">
        Asistentes de IA Disponibles
      </h5>

      {loading ? (
        <div className="assistant-loading">
          <PuffLoader
            color="#009ee3"
            loading={true}
            size={50}
            margin={2}
            speedMultiplier={4}
          />
        </div>
      ) : (
        <>
          <p className="text-muted mb-3">
            {!isStandalone
              ? "Tu plan incluye un asistente gratuito. Asistentes adicionales tienen un costo de $20 USD cada uno."
              : "Cada asistente tiene un costo adicional de $20 USD"}
          </p>

          {isStandalone && existingAssistants.length > 0 && (
            <div className="alert alert-info mb-3 buy-assistant-alert">
              <small>
                Los asistentes marcados ya están activos en tu espacio de
                trabajo.
              </small>
            </div>
          )}

          {!isStandalone && selectedAssistants.length === 0 && (
            <div
              className="alert alert-warning mb-3 free-assistant-alert"
              role="alert"
            >
              Selecciona al menos un asistente para continuar.
            </div>
          )}

          <div className="assistants-grid">
            {assistantsData.map((assistant) => {
              const isExisting =
                isStandalone && isAssistantExisting(assistant.id);

              return (
                <div key={assistant.id} className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={assistant.id}
                    checked={selectedAssistants.includes(assistant.id)}
                    onChange={() => handleAssistantChange(assistant.id)}
                    disabled={isExisting}
                  />
                  <label
                    className={`form-check-label ${
                      isExisting ? "text-muted" : ""
                    }`}
                    htmlFor={assistant.id}
                  >
                    {assistant.label}
                    {assistant.id === freeAssistant && !isStandalone && (
                      <span className="ms-2 badge bg-success">Gratis</span>
                    )}
                    {isExisting && (
                      <span className="ms-2 badge acquired-assistant">
                        Ya adquirido
                      </span>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AIAssistants;
