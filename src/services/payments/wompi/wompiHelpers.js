import { WOMPI_CONFIG } from "./wompiConfig";
import Swal from "sweetalert2";

export const generateIntegritySignature = async (
  reference,
  amountInCents,
  currency
) => {
  try {
    if (!reference || !amountInCents || !currency) {
      console.error("Parámetros inválidos:", {
        reference,
        amountInCents,
        currency,
      });
      throw new Error("Parámetros incompletos para generar la firma");
    }

    // Asegurar que el mensaje esté correctamente formateado
    const message = `${reference}${amountInCents}${currency}${WOMPI_CONFIG.INTEGRITY_SECRET}`;

    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (!signature) {
      throw new Error("No se pudo generar la firma");
    }

    return signature;
  } catch (error) {
    console.error("Error detallado al generar firma:", error);

    Swal.fire({
      icon: "error",
      title: "Error de Procesamiento",
      text: "Hubo un problema al procesar tu solicitud. Por favor, intenta nuevamente o contacta soporte.",
      confirmButtonColor: "#009ee3",
    });

    return null;
  }
};

export const convertUSDtoCOPCents = (usdAmount, usdToCopRate) => {
  if (!usdAmount || !usdToCopRate) return 0;
  const copAmount = Math.round(usdAmount * usdToCopRate);
  return copAmount * 100;
};

export const getPaymentMethodName = (methodType) => {
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
};
