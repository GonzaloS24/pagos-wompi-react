// src/hooks/useProducts.js
import { useState, useEffect } from "react";
import { getAllPlans } from "../pages/subscription/service/plans";
import { getAllAssistants } from "../pages/subscription/service/assistants";
// import { getAllAddons } from "../pages/subscription/service/addons";
import { fetchPlans } from "../services/api/plansApi";

// Configuración visual y descripción de asistentes (mantener para UI)
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

// Simulación temporal de complementos (mientras se arregla la API)
const SIMULATED_ADDONS = [
  {
    product: {
      id: "1",
      name: "🤖 1 Bot Adicional 🤖",
      cost: 10
    },
    discounts: []
  },
  {
    product: {
      id: "2", 
      name: "🙋‍♀️1 Miembro Adicional 🙋‍♀️",
      cost: 10
    },
    discounts: []
  },
  {
    product: {
      id: "3",
      name: "1.000 Webhooks Diarios 🔗", 
      cost: 20
    },
    discounts: []
  }
];

export const useProducts = () => {
  const [plans, setPlans] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        
        // Obtener datos con discounts (para suscripciones)
        const [plansWithDiscounts, assistantsWithDiscounts] = await Promise.all([
          getAllPlans(),
          getAllAssistants(),
          // getAllAddons(), // Comentado hasta que la API esté lista
        ]);

        // Obtener planes básicos (para flujo normal sin discounts)
        const basicPlans = await fetchPlans();

        // Procesar planes
        const processedPlans = plansWithDiscounts
          .filter(plan => plan.product?.id && basicPlans.find(bp => bp.id === plan.product.id))
          .map(plan => {
            const basicPlan = basicPlans.find(bp => bp.id === plan.product.id);
            return {
              // Datos básicos (para flujo normal)
              id: plan.product.id,
              name: basicPlan.name,
              priceUSD: basicPlan.priceUSD,
              bot_users: basicPlan.bot_users,
              
              // Datos con discounts (para suscripciones)
              apiData: {
                id: plan.product.id,
                name: plan.product.name,
                cost: plan.product.cost,
                discounts: plan.discounts || []
              }
            };
          });

        // Procesar asistentes
        const processedAssistants = assistantsWithDiscounts.map(item => {
          const assistantName = item.product.name;
          const uiConfig = ASSISTANTS_UI_CONFIG[assistantName];

          return {
            // Para compatibilidad con el sistema actual
            id: assistantName, // Para referencias y flujo normal (string)
            
            // Datos de la API con discounts (para suscripciones)
            apiId: item.product.id, // Para suscripciones (number)
            name: assistantName,
            cost: item.product.cost,
            discounts: item.discounts || [],

            // Configuración visual (del objeto local)
            label: uiConfig?.label || assistantName,
            description: uiConfig?.description || "",
            icon: uiConfig?.icon || "bx-bot",
            type: uiConfig?.type || assistantName,
            comingSoon: uiConfig?.comingSoon || false,
          };
        });

        // Procesar addons (usar simulación temporal)
        const processedAddons = SIMULATED_ADDONS.map(item => ({
          // Para compatibilidad con constantes actuales
          id: getAddonIdByName(item.product.name),
          name: item.product.name,
          priceUSD: item.product.cost,
          
          // Datos de la API con discounts (para suscripciones)
          apiId: item.product.id,
          cost: item.product.cost,
          discounts: item.discounts || []
        }));

        setPlans(processedPlans);
        setAssistants(processedAssistants);
        setAddons(processedAddons);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err);
        // Fallback a datos por defecto
        setPlans([]);
        setAssistants(getDefaultAssistants());
        setAddons(getDefaultAddons());
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // Funciones helper para obtener datos según el contexto
  const getPlansForNormalFlow = () => {
    return plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      priceUSD: plan.priceUSD,
      bot_users: plan.bot_users
    }));
  };

  const getPlansForSubscriptions = () => {
    return plans.map(plan => plan.apiData);
  };

  const getAssistantsForNormalFlow = () => {
    return assistants.filter(assistant => !assistant.comingSoon);
  };

  const getAssistantsForSubscriptions = () => {
    return assistants.map(assistant => ({
      id: assistant.apiId,
      name: assistant.name,
      cost: assistant.cost,
      discounts: assistant.discounts
    }));
  };

  const getAddonsForNormalFlow = () => {
    return addons.map(addon => ({
      id: addon.id,
      name: addon.name,
      priceUSD: addon.priceUSD,
      description: getAddonDescription(addon.id)
    }));
  };

  const getAddonsForSubscriptions = () => {
    return addons.map(addon => ({
      id: addon.apiId,
      name: addon.name,
      cost: addon.cost,
      discounts: addon.discounts
    }));
  };

  // Mapeo entre nombres de API y IDs locales para addons
  const mapAssistantNamesToApiIds = (assistantNames) => {
    return assistantNames
      .map(name => {
        const assistant = assistants.find(a => a.id === name);
        return assistant ? assistant.apiId : null;
      })
      .filter(Boolean);
  };

  const mapApiIdsToAssistantNames = (apiIds) => {
    return apiIds
      .map(apiId => {
        const assistant = assistants.find(a => a.apiId === apiId);
        return assistant ? assistant.id : null;
      })
      .filter(Boolean);
  };

  return {
    // Datos cargados
    plans,
    assistants,
    addons,
    loading,
    error,

    // Para flujo normal (sin discounts)
    getPlansForNormalFlow,
    getAssistantsForNormalFlow,
    getAddonsForNormalFlow,

    // Para suscripciones (con discounts)
    getPlansForSubscriptions,
    getAssistantsForSubscriptions,
    getAddonsForSubscriptions,

    // Mapeo entre sistemas
    mapAssistantNamesToApiIds,
    mapApiIdsToAssistantNames,

    // Funciones de búsqueda
    getAssistantByName: (name) => assistants.find(a => a.id === name),
    getAssistantByApiId: (apiId) => assistants.find(a => a.apiId === apiId),
    getPlanById: (id) => plans.find(p => p.id === id),
    getAddonById: (id) => addons.find(a => a.id === id),
    getAddonByApiId: (apiId) => addons.find(a => a.apiId === apiId)
  };
};

// Helpers para mapeo de addons
function getAddonIdByName(name) {
  const mapping = {
    "🤖 1 Bot Adicional 🤖": "bot",
    "🙋‍♀️1 Miembro Adicional 🙋‍♀️": "member", 
    "1.000 Webhooks Diarios 🔗": "webhooks"
  };
  return mapping[name] || "unknown";
}

function getAddonDescription(id) {
  const descriptions = {
    "bot": "(Permite agregar un nuevo canal como FB, IG o WP)",
    "member": "(Permite agregar un nuevo asesor)",
    "webhooks": ""
  };
  return descriptions[id] || "";
}

// Fallbacks
function getDefaultAssistants() {
  return [
    {
      id: "ventas",
      apiId: 1,
      name: "ventas",
      cost: 20,
      discounts: [],
      label: "🔥Asistente de ventas por WhatsApp🔥",
      description: "Logra CPAs hasta de 5.000",
      icon: "bx bxl-whatsapp",
      type: "Asistente de ventas por WhatsApp",
      comingSoon: false,
    }
  ];
}

function getDefaultAddons() {
  return [
    {
      id: "bot",
      apiId: "1",
      name: "🤖 1 Bot Adicional 🤖",
      priceUSD: 10,
      cost: 10,
      discounts: []
    }
  ];
}