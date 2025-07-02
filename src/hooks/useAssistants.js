import { useState, useEffect } from "react";
import { getAllAssistants } from "../pages/subscription/service/assistants";

// Configuración visual y descripción de asistentes (esto se mantiene para el UI)
const ASSISTANTS_UI_CONFIG = {
  ventas: {
    label: "🔥Asistente de ventas por WhatsApp🔥",
    description: "Logra CPAs hasta de 5.000",
    icon: "bx bxl-whatsapp",
    type: "Asistente de ventas por WhatsApp",
  },
  carritos: {
    label: "🛒Asistente de carritos abandonados🛒",
    description: "Recupera hasta el 50% de los carritos abandonados.",
    icon: "bx-cart",
    type: "asistente de carritos abandonados",
  },
  comentarios: {
    label: "💬Asistente de comentarios💬",
    description: "Convierte en ventas los comentarios de Facebook.",
    icon: "bx-message-rounded-dots",
    type: "asistente de comentarios",
  },
  remarketing: {
    label: "Asistente de Remarketing",
    description: "Aumenta tus ventas usando tu base de datos.",
    icon: "bx-line-chart",
    type: "asistente de Remarketing",
    comingSoon: true,
  },
  voz: {
    label: "Asistente de Voz con IA",
    description: "Contacta al cliente con un agente de voz IA",
    icon: "bx-microphone",
    type: "asistente de Voz con IA",
    comingSoon: true,
  },
};

export const useAssistants = () => {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        setLoading(true);
        const apiData = await getAllAssistants();

        // Transformar datos de la API al formato que usa la app
        const transformedAssistants = apiData.map((item) => {
          const assistantName = item.product.name;
          const uiConfig = ASSISTANTS_UI_CONFIG[assistantName];

          return {
            // Para compatibilidad con el sistema actual
            id: assistantName, // Para referencias y flujo normal (string)
            apiId: item.product.id, // Para suscripciones y credit card (number)

            // Datos de la API
            name: assistantName,
            cost: item.product.cost,
            discounts: item.discounts,

            // Configuración visual (del objeto local)
            label: uiConfig?.label || assistantName,
            description: uiConfig?.description || "",
            icon: uiConfig?.icon || "bx-bot",
            type: uiConfig?.type || assistantName,
            comingSoon: uiConfig?.comingSoon || false,
          };
        });

        setAssistants(transformedAssistants);
        setError(null);
      } catch (err) {
        console.error("Error fetching assistants:", err);
        setError(err);
        // Fallback a asistentes por defecto si falla la API
        setAssistants(getDefaultAssistants());
      } finally {
        setLoading(false);
      }
    };

    fetchAssistants();
  }, []);

  // Función para obtener asistente por nombre (para el flujo actual)
  const getAssistantByName = (name) => {
    return assistants.find((assistant) => assistant.id === name);
  };

  // Función para obtener asistente por API ID (para suscripciones)
  const getAssistantByApiId = (apiId) => {
    return assistants.find((assistant) => assistant.apiId === apiId);
  };

  // Función para mapear nombres a API IDs
  const mapNamesToApiIds = (assistantNames) => {
    return assistantNames
      .map((name) => {
        const assistant = getAssistantByName(name);
        return assistant ? assistant.apiId : null;
      })
      .filter(Boolean);
  };

  // Función para mapear API IDs a nombres
  const mapApiIdsToNames = (apiIds) => {
    return apiIds
      .map((apiId) => {
        const assistant = getAssistantByApiId(apiId);
        return assistant ? assistant.id : null;
      })
      .filter(Boolean);
  };

  // Obtener asistentes disponibles (no coming soon)
  const getAvailableAssistants = () => {
    return assistants.filter((assistant) => !assistant.comingSoon);
  };

  return {
    assistants,
    loading,
    error,
    getAssistantByName,
    getAssistantByApiId,
    mapNamesToApiIds,
    mapApiIdsToNames,
    getAvailableAssistants,
  };
};

// Fallback en caso de error de API
const getDefaultAssistants = () => {
  return [
    {
      id: "ventas",
      apiId: 1,
      name: "ventas",
      cost: 30,
      discounts: [],
      label: "🔥Asistente de ventas por WhatsApp🔥",
      description: "Logra CPAs hasta de 5.000",
      icon: "bx bxl-whatsapp",
      type: "Asistente de ventas por WhatsApp",
      comingSoon: false,
    },
    {
      id: "carritos",
      apiId: 2,
      name: "carritos",
      cost: 30,
      discounts: [],
      label: "🛒Asistente de carritos abandonados🛒",
      description: "Recupera hasta el 50% de los carritos abandonados.",
      icon: "bx-cart",
      type: "asistente de carritos abandonados",
      comingSoon: false,
    },
    {
      id: "comentarios",
      apiId: 3,
      name: "comentarios",
      cost: 30,
      discounts: [],
      label: "💬Asistente de comentarios💬",
      description: "Convierte en ventas los comentarios de Facebook.",
      icon: "bx-message-rounded-dots",
      type: "asistente de comentarios",
      comingSoon: false,
    },
  ];
};
