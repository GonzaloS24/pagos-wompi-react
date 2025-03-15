export const WOMPI_CONFIG = {
  PUBLIC_KEY: "pub_test_oRPBRklN6tpD4bJoRrkkd3X5l7kwzpF3",
  INTEGRITY_SECRET: "test_integrity_RMUwn1SSLmR31OFgXOdgJcV2VkcaaDVL",
  // PUBLIC_KEY: "pub_prod_mUzoGd0TQzkIWZwMamDL3ADjEYCO93N7",
  // INTEGRITY_SECRET: "prod_integrity_KZkk9BdR7yGH9jDspvfhWud8IdUBnMQw",
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
