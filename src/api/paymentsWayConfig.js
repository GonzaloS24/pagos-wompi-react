export const PAYMENTS_WAY_CONFIG = {
  MERCHANT_ID: "3192",
  FORM_ID: "3263",
  TERMINAL_ID: "2372",
  COLOR_BASE: "#009ee3",
  RESPONSE_URL: window.location.origin + "/transaction-summary",
};

export const verifyPaymentsWayTransaction = async (transactionId) => {
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
};

export const getPaymentsWayTransactionStatus = async (transactionId) => {
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
};
