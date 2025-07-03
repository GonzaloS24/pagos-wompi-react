// import { getAllPlans } from "./newApi/plans";
// import { getAllAssistants } from "./newApi/assistants";
// import { getAllAddons } from "./newApi/addons";
import {
  ASSISTANT_DISPLAY_INFO,
  COMING_SOON_ASSISTANTS,
  getAssistantReference,
  getComplementReference,
} from "../utils/constants";

// ===== DATOS SIMULADOS TEMPORALES =====
const SIMULATED_PLANS = [
  {
    product: {
      id: "business",
      displayPrice: "49 USD",
      name: "Chatea Pro Start",
      price: 49,
      bots: 1,
      botUsers: 1000,
      members: 5,
      status: "active",
    },
    discounts: [],
  },
  {
    product: {
      id: "business_lite",
      displayPrice: "109 USD",
      name: "Chatea Pro Advanced",
      price: 109,
      bots: 1,
      botUsers: 10000,
      members: 5,
      status: "active",
    },
    discounts: [],
  },
  {
    product: {
      id: "custom_plan3",
      displayPrice: "189 USD",
      name: "Chatea Pro Plus",
      price: 189,
      bots: 1,
      botUsers: 20000,
      members: 5,
      status: "active",
    },
    discounts: [],
  },
  {
    product: {
      id: "business_large",
      displayPrice: "399 USD",
      name: "Chatea Pro Master",
      price: 399,
      bots: 5,
      botUsers: 50000,
      members: 10,
      status: "active",
    },
    discounts: [],
  },
];

const SIMULATED_ASSISTANTS = [
  {
    product: {
      id: 1,
      name: "ventas",
      cost: 20,
    },
    discounts: [],
  },
  {
    product: {
      id: 2,
      name: "carritos",
      cost: 20,
    },
    discounts: [],
  },
  {
    product: {
      id: 3,
      name: "comentarios",
      cost: 20,
    },
    discounts: [],
  },
];

const SIMULATED_COMPLEMENTS = [
  {
    product: {
      id: 1,
      name: "🤖 1 Bot Adicional 🤖",
      cost: 10,
    },
    discounts: [],
  },
  {
    product: {
      id: 2,
      name: "🙋‍♀️1 Miembro Adicional 🙋‍♀️",
      cost: 10,
    },
    discounts: [],
  },
  {
    product: {
      id: 3,
      name: "1.000 Webhooks Diarios 🔗",
      cost: 20,
    },
    discounts: [],
  },
];

/**
 * Obtiene todos los planes activos (excluyendo el free)
 */
export const fetchPlans = async () => {
  try {
    // TODO: Descomentar cuando la API esté lista
    // const response = await getAllPlans();

    // Simulación temporal
    await new Promise((resolve) => setTimeout(resolve, 500));
    const response = SIMULATED_PLANS;

    return response
      .filter(
        (plan) => plan.product.status === "active" && plan.product.id !== "free"
      )
      .map((plan) => ({
        id: plan.product.id,
        name: plan.product.name,
        priceUSD: plan.product.price,
        bot_users: plan.product.botUsers,
        bots: plan.product.bots,
        members: plan.product.members,
        displayPrice: plan.product.displayPrice,
      }));
  } catch (error) {
    console.error("Error fetching plans:", error);
    return [];
  }
};

/**
 * Obtiene todos los asistentes disponibles y los combina con los de "próximamente"
 */
export const fetchAssistants = async () => {
  try {
    // TODO: Descomentar cuando la API esté lista
    // const response = await getAllAssistants();

    // Simulación temporal
    await new Promise((resolve) => setTimeout(resolve, 500));
    const response = SIMULATED_ASSISTANTS;

    // Convertir asistentes de API
    const apiAssistants = response.map((assistant) => {
      const reference = getAssistantReference(assistant.product.id);
      const displayInfo = ASSISTANT_DISPLAY_INFO[reference];

      return {
        id: reference, // Usamos el nombre de referencia como ID
        apiId: assistant.product.id, // Guardamos el ID numérico para credit card
        name: assistant.product.name,
        cost: assistant.product.cost,
        label: displayInfo?.label || assistant.product.name,
        description: displayInfo?.description || "",
        icon: displayInfo?.icon || "bx-bot",
        comingSoon: false,
      };
    });

    // Combinar con asistentes de "próximamente"
    return [...apiAssistants, ...COMING_SOON_ASSISTANTS];
  } catch (error) {
    console.error("Error fetching assistants:", error);
    return COMING_SOON_ASSISTANTS; // Retornar al menos los de próximamente
  }
};

/**
 * Obtiene todos los complementos disponibles
 */
export const fetchComplements = async () => {
  try {
    // TODO: Descomentar cuando la API esté lista
    // const response = await getAllAddons();

    // Simulación temporal
    await new Promise((resolve) => setTimeout(resolve, 500));
    const response = SIMULATED_COMPLEMENTS;

    return response.map((complement) => {
      const reference = getComplementReference(complement.product.id);

      return {
        id: reference, // Usamos el nombre de referencia como ID
        apiId: complement.product.id, // Guardamos el ID numérico para credit card
        name: complement.product.name,
        priceUSD: complement.product.cost,
        description: complement.product.name.includes("Bot")
          ? "(Permite agregar un nuevo canal como FB, IG o WP)"
          : complement.product.name.includes("Miembro")
          ? "(Permite agregar un nuevo asesor)"
          : "",
      };
    });
  } catch (error) {
    console.error("Error fetching complements:", error);
    return [];
  }
};

/**
 * Obtiene la información de un asistente por su ID de referencia
 */
export const getAssistantById = async (id) => {
  const assistants = await fetchAssistants();
  return assistants.find((assistant) => assistant.id === id);
};

/**
 * Obtiene la información de un complemento por su ID de referencia
 */
export const getComplementById = async (id) => {
  const complements = await fetchComplements();
  return complements.find((complement) => complement.id === id);
};

/**
 * Convierte asistentes seleccionados a formato para referencia de pago normal
 */
export const formatAssistantsForReference = (selectedAssistants) => {
  return selectedAssistants.map((assistant) => {
    if (typeof assistant === "string") {
      return assistant; // Ya es nombre de referencia
    }
    return assistant.id || assistant.name;
  });
};

/**
 * Convierte asistentes seleccionados a formato para credit card (IDs numéricos)
 */
export const formatAssistantsForCreditCard = async (selectedAssistants) => {
  const assistants = await fetchAssistants();

  return selectedAssistants
    .map((assistantId) => {
      const assistant = assistants.find((a) => a.id === assistantId);
      return assistant?.apiId || assistantId;
    })
    .filter((id) => id !== undefined);
};

/**
 * Convierte complementos seleccionados a formato para referencia de pago normal
 */
export const formatComplementsForReference = (selectedComplements) => {
  return selectedComplements.map((complement) => {
    if (typeof complement === "string") {
      return complement; // Ya es nombre de referencia
    }

    const reference = complement.id || complement.name;
    if (complement.quantity > 1) {
      return `${reference}_${complement.quantity}`;
    }

    if (complement.selectedBot) {
      return `${reference}_${complement.quantity}_${complement.selectedBot.flow_ns}`;
    }

    return reference;
  });
};

/**
 * Convierte complementos seleccionados a formato para credit card (IDs numéricos)
 */
export const formatComplementsForCreditCard = async (selectedComplements) => {
  const complements = await fetchComplements();

  return selectedComplements
    .map((complement) => {
      const comp = complements.find((c) => c.id === complement.id);
      return {
        id: comp?.apiId || complement.id,
        quantity: complement.quantity || 1,
        ...(complement.id === "webhooks" && complement.selectedBot
          ? {
              bot_flow_ns: complement.selectedBot.flow_ns,
            }
          : {}),
      };
    })
    .filter((comp) => comp.id !== undefined);
};
