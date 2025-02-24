import { WOMPI_CONFIG } from "../api/wompiConfig";
import Swal from "sweetalert2";

export const sanitizeString = (str) => {
  if (!str) return "";
  return str.replace(/[<>]/g, "");
};

export const validateForm = (formData) => {
  const errors = {};
  if (!formData.workspace_id.trim())
    errors.workspace_id = "El ID del espacio es requerido";
  if (!formData.workspace_name.trim())
    errors.workspace_name = "El nombre del espacio es requerido";
  if (!formData.owner_name.trim())
    errors.owner_name = "El nombre del dueño es requerido";
  if (
    !formData.owner_email.trim() ||
    !/\S+@\S+\.\S+/.test(formData.owner_email)
  ) {
    errors.owner_email = "Email inválido";
  }
  if (
    !formData.phone_number.trim() ||
    !/^\d{10}$/.test(formData.phone_number)
  ) {
    errors.phone_number = "Número de teléfono inválido (10 dígitos)";
  }
  return errors;
};

export const generateIntegritySignature = async (
  reference,
  amountInCents,
  currency
) => {
  try {
    // Validar que los parámetros no sean undefined o null
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
