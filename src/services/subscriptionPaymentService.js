import { updateSubscriptionPayment } from "./newApi/subscriptions";

/**
 * Servicio para manejar actualizaciones de tarjetas de suscripciones
 */
export const subscriptionPaymentService = {
  /**
   * Actualiza los datos de la tarjeta de una suscripción
   * @param {number} workspaceId - ID del workspace
   * @param {Object} cardData - Datos de la tarjeta del formulario
   * @param {string} ownerEmail - Email del propietario
   * @returns {Promise<Object>} Resultado de la operación
   */
  async updatePaymentMethod(workspaceId, cardData, ownerEmail) {
    try {
      const paymentData = {
        owner_email: ownerEmail,
        card_details: {
          card_holder: cardData.card_holder,
          card_number: cardData.number,
          cvv: cardData.cvc,
          exp_date: {
            year: parseInt(cardData.exp_year.toString().slice(-2)),
            month: parseInt(cardData.exp_month),
          },
        },
      };

      console.log(JSON.stringify(paymentData, null, 2));

      const result = await updateSubscriptionPayment(workspaceId, paymentData);

      return {
        success: true,
        data: result,
        message: "Método de pago actualizado exitosamente",
      };
    } catch (error) {
      console.error("Error updating payment method:", error);
      return {
        success: false,
        error: error.message || "Error al actualizar el método de pago",
      };
    }
  },
};
