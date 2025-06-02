import { API_CONFIG, fetchWithRetry } from "./index";

export const fetchPlans = async () => {
  try {
    const response = await fetchWithRetry(
      `${API_CONFIG.BASE_URL}/metrics/workspaces/plans`
    );

    const data = await response.json();

    const plansData = data
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
