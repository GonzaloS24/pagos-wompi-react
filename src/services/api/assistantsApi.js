import { API_CONFIG, fetchWithRetry } from "./index";

export const fetchWorkspaceAssistants = async (workspaceId) => {
  try {
    const response = await fetchWithRetry(
      `${API_CONFIG.BASE_URL}/metrics/templates/usage/${workspaceId}`
    );

    return await response.json();
  } catch (error) {
    console.error("Error fetching workspace assistants:", error);
    return null;
  }
};

export const fetchWorkspaceBots = async (workspaceId) => {
  try {
    const response = await fetchWithRetry(
      `${API_CONFIG.BASE_URL}/metrics/workspaces/${workspaceId}/bots`
    );

    return await response.json();
  } catch (error) {
    console.error("Error fetching bots:", error);
    return [];
  }
};
