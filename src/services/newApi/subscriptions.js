import axiosInstance from "./index";

/**
 * Obtiene lista paginada de suscripciones
 * @param {number} page - Número de página (default: 1)
 * @param {number} limit - Límite por página (default: 10, max: 100)
 * @returns {Promise<Array>} Lista de suscripciones
 */
export const getSubscriptions = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get("/subscriptions", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

/**
 * Obtiene una suscripción específica por workspace ID
 * @param {number} workspaceId - ID del workspace
 * @returns {Promise<Object>} Datos de la suscripción
 */
export const getSubscriptionByWorkspace = async (workspaceId) => {
  try {
    const response = await axiosInstance.get(`/subscriptions/${workspaceId}`);
    return response.data;
    
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

/**
 * Crea una nueva suscripción
 * @param {Object} subscriptionData - Datos de la suscripción
 * @param {number} subscriptionData.workspace_id - ID del workspace
 * @param {string} subscriptionData.workspace_name - Nombre del workspace
 * @param {string} subscriptionData.onwer_email - Email del propietario
 * @param {string} subscriptionData.phone - Teléfono
 * @param {boolean} subscriptionData.assistants_only - Solo asistentes
 * @param {string} subscriptionData.plan_id - ID del plan
 * @param {number} subscriptionData.free_assistant_id - ID del asistente gratuito
 * @param {Array<number>} subscriptionData.paid_assistant_ids - IDs de asistentes pagos
 * @param {Array} subscriptionData.addons - Lista de addons
 * @param {Object} subscriptionData.card_details - Datos de la tarjeta
 * @returns {Promise<Object>} Respuesta de creación (status 202)
 */
export const createSubscription = async (subscriptionData) => {
  try {
    const response = await axiosInstance.post(
      "/subscriptions",
      subscriptionData
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

/**
 * Actualiza una suscripción existente
 * @param {number} workspaceId - ID del workspace
 * @param {Object} updateData - Datos a actualizar (campos opcionales)
 * @param {string} updateData.plan_id - Nuevo ID del plan
 * @param {Array<number>} updateData.paid_assistants_ids - Nuevos asistentes pagos
 * @param {number} updateData.free_assistant_id - Nuevo asistente gratuito
 * @param {Array} updateData.addons - Nuevos addons
 * @param {string} updateData.onwer_email - Nuevo email
 * @param {Object} updateData.card_details - Nuevos datos de tarjeta
 * @returns {Promise<Object>} Suscripción actualizada
 */
export const updateSubscription = async (workspaceId, updateData) => {
  try {
    const response = await axiosInstance.patch(
      `/subscriptions/${workspaceId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

/**
 * Actualiza los datos de la tarjeta de una suscripción
 * @param {number} workspaceId - ID del workspace
 * @param {Object} paymentData - Datos de la tarjeta
 * @param {string} paymentData.owner_email - Email del propietario
 * @param {Object} paymentData.card_details - Datos de la tarjeta
 * @returns {Promise<Object>} Respuesta de actualización
 */
export const updateSubscriptionPayment = async (workspaceId, paymentData) => {
  try {
    const response = await axiosInstance.patch(
      `/subscriptions/${workspaceId}/payment`,
      paymentData
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

/**
 * Cancela una suscripción
 * @param {number} workspaceId - ID del workspace
 * @returns {Promise<void>} Respuesta vacía (status 204)
 */
export const cancelSubscription = async (workspaceId) => {
  try {
    const response = await axiosInstance.patch(
      `/subscriptions/${workspaceId}/cancel`
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
