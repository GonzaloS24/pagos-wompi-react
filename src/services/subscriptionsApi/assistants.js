import axiosInstance from "./index";

/**
 * Obtiene todos los asistentes disponibles
 * @returns {Promise<Array>} Lista de asistentes con estructura:
 * [{
 *   product: {
 *     id: number,
 *     name: string,
 *     cost: number
 *   },
 *   discounts: []
 * }]
 */
export const getAllAssistants = async () => {
  try {
    const response = await axiosInstance.get("/assistants");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
