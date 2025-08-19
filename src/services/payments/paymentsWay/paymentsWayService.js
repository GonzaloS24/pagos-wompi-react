import {
  PAYMENTS_WAY_CONFIG,
  PAYMENTS_WAY_ENDPOINTS,
} from "./paymentsWayConfig";
import {
  getPlanDescription,
  getRecurringPlanUrl,
  hasRecurringPlan,
} from "./paymentsWayRecurringConfig";

export class PaymentsWayService {
  constructor() {
    this.config = PAYMENTS_WAY_CONFIG;
  }

  createPaymentForm(paymentData) {
    const {
      amount,
      orderDescription,
      reference,
      enableRecurring = false,
      formData = {},
    } = paymentData;

    const formattedAmount = Math.round(amount);
    const orderNumber = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const fullDescription = `${orderDescription}${
      enableRecurring ? " (Pago recurrente)" : ""
    }`;

    const additionalData = JSON.stringify({
      reference: reference,
    });

    return {
      action: PAYMENTS_WAY_ENDPOINTS.FORM_ACTION_URL,
      method: "post",
      fields: {
        merchant_id: this.config.MERCHANT_ID,
        form_id: this.config.FORM_ID,
        terminal_id: this.config.TERMINAL_ID,
        order_number: orderNumber,
        amount: formattedAmount,
        currency: "cop",
        order_description: fullDescription,
        color_base: this.config.COLOR_BASE,
        is_recurring: enableRecurring ? "true" : "false",
        client_email: formData.owner_email || "",
        client_phone: formData.phone_number || "",
        client_firstname: formData.owner_name || "",
        client_lastname: "",
        client_doctype: "4",
        client_numdoc: "",
        response_url: this.config.RESPONSE_URL,
        additional_data: additionalData,
      },
    };
  }

  getRecurringPaymentUrl(planId, additionalAssistants = 0) {
    return getRecurringPlanUrl(planId, additionalAssistants);
  }

  hasRecurringSupport(planId, additionalAssistants = 0) {
    return hasRecurringPlan(planId, additionalAssistants);
  }

  getPlanRecurringDescription(planId, totalAssistants) {
    return getPlanDescription(planId, totalAssistants);
  }

  redirectToRecurringPayment(planId, selectedAssistants) {
    const additionalAssistants = Math.max(0, selectedAssistants.length - 1);
    const url = this.getRecurringPaymentUrl(planId, additionalAssistants);

    if (url) {
      window.location.href = url;
      return true;
    } else {
      const description = this.getPlanRecurringDescription(
        planId,
        selectedAssistants.length
      );
      alert(
        `Lo sentimos, aún no tenemos configurado el pago recurrente para ${description}. Por favor, contacta a soporte para más información.`
      );
      return false;
    }
  }

  isConfigured() {
    return Boolean(
      this.config.MERCHANT_ID && this.config.FORM_ID && this.config.TERMINAL_ID
    );
  }

  // Método para verificar transacciones (placeholder para futuras implementaciones)
  async verifyTransaction(transactionId) {
    try {
      return {
        success: true,
        transaction: {
          id: transactionId,
          status: "APPROVED",
          amount: 0,
          reference: "",
        },
      };
    } catch (error) {
      console.error("Error verificando transacción de Payments Way:", error);
      return {
        success: false,
        error: "No se pudo verificar la transacción",
      };
    }
  }

  async getTransactionStatus(transactionId) {
    try {
      return {
        success: true,
        status: "APPROVED",
        transaction: {
          id: transactionId,
          amount: 0,
          currency: "COP",
          reference: "",
        },
      };
    } catch (error) {
      console.error(
        "Error obteniendo estado de transacción de Payments Way:",
        error
      );
      return {
        success: false,
        error: "No se pudo obtener el estado de la transacción",
      };
    }
  }
}

export const paymentsWayService = new PaymentsWayService();
