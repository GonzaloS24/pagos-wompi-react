import {
  WOMPI_RECURRING_CONFIG,
  WOMPI_RECURRING_ENDPOINTS,
} from "./wompiRecurringConfig";

export class WompiRecurringService {
  constructor() {
    this.config = WOMPI_RECURRING_CONFIG;
  }

  // Paso 1: Tokenizar la tarjeta
  async tokenizeCard(cardData) {
    try {
      const response = await fetch(WOMPI_RECURRING_ENDPOINTS.TOKENIZE_CARD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.PUBLIC_KEY}`,
        },
        body: JSON.stringify({
          number: cardData.number.replace(/\s/g, ""),
          exp_month: cardData.exp_month,
          exp_year: cardData.exp_year,
          cvc: cardData.cvc,
          card_holder: cardData.card_holder,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error tokenizing card: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        token: data.data.id,
        card_info: {
          last_four: data.data.last_four,
          brand: data.data.brand,
          card_type: data.data.card_type,
        },
      };
    } catch (error) {
      console.error("Error tokenizing card:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Obtener token de aceptación
  async getAcceptanceToken() {
    try {
      const url = WOMPI_RECURRING_ENDPOINTS.ACCEPTANCE_TOKEN.replace(
        "{public_key}",
        this.config.PUBLIC_KEY
      );

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error getting acceptance token: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        acceptance_token: data.data.presigned_acceptance.acceptance_token,
      };
    } catch (error) {
      console.error("Error getting acceptance token:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Preparar datos para enviar al backend
  preparePaymentData(
    tokenizeResult,
    acceptanceTokenResult,
    paymentCalculations,
    formData
  ) {
    return {
      // Datos de la tarjeta tokenizada
      card_token: tokenizeResult.token,
      card_info: tokenizeResult.card_info,

      // Token de aceptación
      acceptance_token: acceptanceTokenResult.acceptance_token,

      // Datos del pago
      amount_in_cents: paymentCalculations.priceCOPCents,
      currency: "COP",
      reference: paymentCalculations.reference,
      customer_email: formData.owner_email,

      // Datos del cliente
      customer_data: {
        name: formData.owner_name,
        email: formData.owner_email,
        phone: formData.phone_number,
        workspace_id: formData.workspace_id,
        workspace_name: formData.workspace_name,
      },

      // Configuración de pago recurrente
      is_recurring: true,
      payment_method: {
        installments: 1,
      },
    };
  }

  async createPaymentSource(tokenData, customerEmail, acceptanceToken) {
    const response = await fetch(WOMPI_RECURRING_ENDPOINTS.PAYMENT_SOURCES, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        type: "CARD",
        token: tokenData.token,
        customer_email: customerEmail,
        acceptance_token: acceptanceToken,
      }),
    });

    return await response.json();
  }

  async createTransaction(paymentData, signature) {
    const response = await fetch(WOMPI_RECURRING_ENDPOINTS.TRANSACTIONS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        amount_in_cents: paymentData.amount_in_cents,
        currency: paymentData.currency,
        customer_email: paymentData.customer_email,
        payment_source_id: paymentData.payment_source_id,
        reference: paymentData.reference,
        signature: signature,
        payment_method: paymentData.payment_method,
      }),
    });

    return await response.json();
  }

  // Procesar pago completo (coordinará entre frontend y backend)
  async processRecurringPayment(cardData, paymentCalculations, formData) {
    try {
      // Paso 1: Tokenizar tarjeta (Frontend)
      const tokenizeResult = await this.tokenizeCard(cardData);
      if (!tokenizeResult.success) {
        throw new Error(tokenizeResult.error);
      }

      // Paso 2: Obtener token de aceptación (Frontend)
      const acceptanceResult = await this.getAcceptanceToken();
      if (!acceptanceResult.success) {
        throw new Error(acceptanceResult.error);
      }

      // Paso 3: Preparar datos para backend
      const backendData = this.preparePaymentData(
        tokenizeResult,
        acceptanceResult,
        paymentCalculations,
        formData
      );

      return {
        success: true,
        data: backendData,
        message: "Datos preparados para procesar pago recurrente",
      };
    } catch (error) {
      console.error("Error processing recurring payment:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  async sendToBackend(paymentData) {
    console.log("Data to send to backend:", paymentData);
    return { success: true };
  }

  isConfigured() {
    return Boolean(this.config.PUBLIC_KEY && this.config.INTEGRITY_SECRET);
  }
}

export const wompiRecurringService = new WompiRecurringService();
