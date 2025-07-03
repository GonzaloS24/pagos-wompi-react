import axiosInstance from "./index";

/**
 * Obtiene todos los planes disponibles desde UChat
 * @returns {Promise<Array>} Lista de planes con estructura:
 * [{
 *   product: {
 *     id: string,
 *     displayPrice: string,
 *     name: string,
 *     price: number,
 *     bots: number,
 *     botUsers: number,
 *     members: number
 *   },
 *   discounts: []
 * }]
 */
export const getAllPlans = async () => {
  try {
    const response = await axiosInstance.get("/plans");
    console.log('22  >>>>>>>>> ', response.data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
