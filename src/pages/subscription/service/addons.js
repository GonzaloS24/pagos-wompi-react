import axiosInstance from "./index";

/**
 * Obtiene todos los addons/complementos disponibles
 * @returns {Promise<Array>} Lista de addons con estructura:
 * [{
 *   product: {
 *     id: number,
 *     name: string,
 *     cost: number
 *   },
 *   discounts: []
 * }]
 */
export const getAllAddons = async () => {
  try {
    const response = await axiosInstance.get("/addons");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
