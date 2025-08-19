// Re-exportar todos los servicios de API
// export * from "./plansApi";
export * from "./assistantsApi";
export * from "./exchangeRateApi";

// Configuración base de la API
export const API_CONFIG = {
  BASE_URL:
    "https://apimetricasplanes-service-26551171030.us-east1.run.app/api",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Utilidad para hacer peticiones con reintentos
export const fetchWithRetry = async (
  url,
  options = {},
  retries = API_CONFIG.RETRY_ATTEMPTS
) => {
  try {
    const response = await fetch(url, {
      timeout: API_CONFIG.TIMEOUT,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Request failed, retrying... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};
