import {
  isSimulatedTest,
  getSimulatedTransactionData,
} from "../../../utils/TransactionTester";
import { WOMPI_CONFIG } from "../../../services/payments/wompi/wompiConfig";

export const transactionService = {
  async fetchTransactionDetails(transactionId, env, searchParams) {
    try {
      // Verificar si estamos en modo de prueba simulada
      if (isSimulatedTest(searchParams)) {
        return getSimulatedTransactionData(
          transactionId,
          this.processAssistants
        );
      }

      if (!transactionId) {
        return null;
      }

      const apiUrl =
        env === "test"
          ? `https://sandbox.wompi.co/v1/transactions/${transactionId}`
          : `https://production.wompi.co/v1/transactions/${transactionId}`;

      const response = await fetch(apiUrl);
      const responseData = await response.json();

      if (responseData.data) {
        const transaction = responseData.data;
        const referenceData = this.parseReferenceString(transaction.reference);

        let cardType = null;
        if (
          transaction.payment_method_type === "CARD" &&
          transaction.payment_method?.extra?.card_type
        ) {
          cardType = transaction.payment_method.extra.card_type;
        }

        let amountUSD, amountCOP;

        if (transaction.currency === "COP") {
          amountCOP = transaction.amount_in_cents / 100;

          amountUSD = this.calculateOriginalUSDFromReference(referenceData);

          if (!amountUSD) {
            try {
              const exchangeResponse = await fetch(
                WOMPI_CONFIG.EXCHANGE_RATE_API
              );
              if (exchangeResponse.ok) {
                const exchangeData = await exchangeResponse.json();
                const copRate = exchangeData.rates.COP;
                amountUSD = amountCOP / copRate;
              } else {
                amountUSD = referenceData.totalUSD
                  ? parseFloat(referenceData.totalUSD)
                  : amountCOP / 4000;
              }
            } catch (error) {
              console.error("Error obteniendo tasa de cambio:", error);
              amountUSD = referenceData.totalUSD
                ? parseFloat(referenceData.totalUSD)
                : amountCOP / 4000;
            }
          }
        } else {
          amountUSD = transaction.amount_in_cents / 100;
          amountCOP = amountUSD * 4000;
        }

        const assistantsProcessed = this.processAssistants(
          referenceData.assistants || []
        );
        const complementsProcessed = this.processComplements(
          referenceData.complements || []
        );

        return {
          id: transaction.id,
          status: transaction.status,
          statusMessage: this.getStatusMessage(transaction.status),
          reference: transaction.reference,
          amountUSD: amountUSD,
          amountCOP: amountCOP,
          currency: transaction.currency,
          createdAt: new Date(transaction.created_at).toLocaleString(),
          paymentMethod: transaction.payment_method_type,
          paymentMethodName: this.getPaymentMethodName(
            transaction.payment_method_type
          ),
          cardType,
          cardBrand: transaction.payment_method?.extra?.brand || null,
          cardLastFour: transaction.payment_method?.extra?.last_four || null,
          assistants: assistantsProcessed,
          complements: complementsProcessed,
          plan_id: referenceData.plan_id,
          workspace_id: referenceData.workspace_id,
          recurring: referenceData.recurring,
          // Datos adicionales para el modal de Wallet
          workspaceData: {
            workspace_id: referenceData.workspace_id,
            workspace_name: referenceData.workspace_name,
            owner_email: referenceData.owner_email,
            owner_name: referenceData.owner_name,
            phone_number: referenceData.phone_number,
          },
          // Determinar si es plan anual basado en la referencia
          isAnnual: referenceData.period === "annual",
          period: referenceData.period || "monthly",
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      return null;
    }
  },

  calculateOriginalUSDFromReference(referenceData) {
    try {
      let totalUSD = 0;

      const PLAN_PRICES = {
        business: 49, // Chatea Pro Start
        business_lite: 109, // Chatea Pro Advanced
        custom_plan3: 189, // Chatea Pro Plus
        business_large: 399, // Chatea Pro Master
      };

      // Agregar precio del plan si existe
      if (referenceData.plan_id && PLAN_PRICES[referenceData.plan_id]) {
        let planPrice = PLAN_PRICES[referenceData.plan_id];

        // Si es plan anual, calcular precio anual con descuento
        if (referenceData.period === "annual") {
          const annualPrice = planPrice * 12;
          planPrice = annualPrice * 0.85;
        }

        totalUSD += planPrice;
      }

      if (referenceData.assistants && referenceData.assistants.length > 0) {
        const assistantPrice = 20;
        let assistantsTotal = 0;

        if (referenceData.plan_id) {
          const paidAssistants = Math.max(
            0,
            referenceData.assistants.length - 1
          );
          assistantsTotal = paidAssistants * assistantPrice;
        } else {
          assistantsTotal = referenceData.assistants.length * assistantPrice;
        }

        // Si es plan anual, calcular precio anual con descuento para asistentes
        if (referenceData.period === "annual" && referenceData.plan_id) {
          const annualAssistantsPrice = assistantsTotal * 12;
          assistantsTotal = annualAssistantsPrice * 0.85;
        }

        totalUSD += assistantsTotal;
      }

      // Agregar precio de complementos
      if (referenceData.complements && referenceData.complements.length > 0) {
        for (const complement of referenceData.complements) {
          const parts = complement.split("_");
          const type = parts[0];
          const quantity = parseInt(parts[1] || "1", 10);

          let complementPrice = 0;
          if (type === "bot" || type === "member") {
            complementPrice = 10 * quantity;
          } else if (type === "webhooks") {
            complementPrice = 20 * quantity;
          }

          // Si es plan anual, calcular precio anual con descuento para complementos
          if (referenceData.period === "annual" && referenceData.plan_id) {
            const annualComplementPrice = complementPrice * 12;
            complementPrice = annualComplementPrice * 0.85;
          }

          totalUSD += complementPrice;
        }
      }

      return totalUSD > 0 ? totalUSD : null;
    } catch (error) {
      console.error("Error calculando precio original USD:", error);
      return null;
    }
  },

  parseReferenceString(reference) {
    try {
      const result = {
        assistants: [],
        complements: [],
      };

      const parts = reference.split("-");

      for (const part of parts) {
        if (part.includes("=")) {
          const [key, value] = part.split("=");

          if (key === "assistants") {
            if (value) {
              result.assistants = value.split("+");
            }
          } else if (key === "complements") {
            if (value) {
              result.complements = value.split("+");
            }
          } else if (key === "recurring" && value === "true") {
            result.recurring = true;
          } else if (key && value) {
            result[key] = value;
          }
        }
      }

      return result;
    } catch (e) {
      console.error("Error parsing reference:", e);
      return {
        assistants: [],
        complements: [],
      };
    }
  },

  processAssistants(assistants) {
    const assistantMap = {
      ventas: {
        name: "Asistente de ventas por WhatsApp",
        icon: "bx bxl-whatsapp",
      },
      comentarios: {
        name: "Asistente de comentarios",
        icon: "bx-message-rounded-dots",
      },
      carritos: { name: "Asistente de carritos abandonados", icon: "bx-cart" },
      marketing: { name: "Asistente de Marketing", icon: "bx-line-chart" },
    };

    return assistants.map((id) => ({
      id,
      name: assistantMap[id]?.name || id,
      icon: assistantMap[id]?.icon || "bx-bot",
    }));
  },

  processComplements(complements) {
    return complements.map((comp) => {
      const parts = comp.split("_");
      const type = parts[0];

      if (type === "bot") {
        const quantity = parts[1] || "1";
        return {
          id: comp,
          type: "bot",
          name: "Bot Adicional",
          icon: "bx-bot",
          quantity: parseInt(quantity, 10),
          description: `${quantity} Bot${quantity > 1 ? "s" : ""} adicional${
            quantity > 1 ? "es" : ""
          }`,
        };
      } else if (type === "member") {
        const quantity = parts[1] || "1";
        return {
          id: comp,
          type: "member",
          name: "Miembro Adicional",
          icon: "bx-user-plus",
          quantity: parseInt(quantity, 10),
          description: `${quantity} Miembro${
            quantity > 1 ? "s" : ""
          } adicional${quantity > 1 ? "es" : ""}`,
        };
      } else if (type === "webhooks") {
        const quantity = parts[1] || "1";
        const flowNs = parts[2] || "";
        return {
          id: comp,
          type: "webhooks",
          name: "Webhooks Diarios",
          icon: "bx-link",
          quantity: parseInt(quantity, 10),
          flowNs,
          description: `${quantity * 1000} Webhooks diarios${
            flowNs ? ` para bot ${flowNs}` : ""
          }`,
        };
      }

      return {
        id: comp,
        type: "unknown",
        name: comp,
        icon: "bx-package",
        description: comp,
      };
    });
  },

  getStatusMessage(status) {
    switch (status) {
      case "APPROVED":
        return "¡Transacción Exitosa!";
      case "DECLINED":
        return "Transacción Rechazada";
      case "VOIDED":
        return "Transacción Anulada";
      case "ERROR":
        return "Error en la Transacción";
      case "PENDING":
        return "Transacción en Proceso";
      default:
        return "Estado Desconocido";
    }
  },

  getPaymentMethodName(methodType) {
    switch (methodType) {
      case "CARD":
        return "";
      case "NEQUI":
        return "Nequi";
      case "PSE":
        return "PSE";
      case "BANCOLOMBIA_TRANSFER":
        return "Transferencia Bancolombia";
      case "BANCOLOMBIA_COLLECT":
        return "Recaudo Bancolombia";
      case "DAVIPLATA":
        return "Daviplata";
      default:
        return methodType;
    }
  },

  // verificar si un pago falló
  isFailedPayment(status) {
    const failedStatuses = ["DECLINED", "ERROR", "VOIDED"];
    return failedStatuses.includes(status);
  },
};
