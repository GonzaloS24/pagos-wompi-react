export const STRIPE_CONFIG = {
  PUBLIC_KEY: "pk_test_TU_CLAVE_PUBLICA_DE_STRIPE",
  EXCHANGE_RATE_API: "https://api.exchangerate-api.com/v4/latest/USD",
  DEFAULT_WORKSPACE_ID: null,
};
import axios from "axios";

let plansData = [];

// obtener asistentes de un espacio de trabajo
export const fetchWorkspaceAssistants = async (workspaceId) => {
  try {
    const response = await axios.get(
      `https://apimetricasplanes-service-26551171030.us-east1.run.app/api/metrics/templates/usage/${workspaceId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching workspace assistants:", error);
    return null;
  }
};

// Obtener lista de planes
export const fetchPlans = async () => {
  try {
    const response = await axios.get(
      "https://apimetricasplanes-service-26551171030.us-east1.run.app/api/metrics/workspaces/plans"
    );

    plansData = response.data
      .filter((plan) => plan.status === "active" && plan.id !== "free")
      .map((plan) => ({
        id: plan.id,
        name: plan.name,
        priceUSD: parseFloat(plan.display_price) || 0,
        bot_users: plan.bot_users,
      }));
    return plansData;
  } catch (error) {
    console.error("Error fetching plans:", error);
    return [];
  }
};

export const PLANS = plansData;

// Obtener bots de un workspace
export const fetchWorkspaceBots = async (workspaceId) => {
  try {
    const response = await axios.get(
      `https://apimetricasplanes-service-26551171030.us-east1.run.app/api/metrics/workspaces/${workspaceId}/bots`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching bots:", error);
    return [];
  }
};
