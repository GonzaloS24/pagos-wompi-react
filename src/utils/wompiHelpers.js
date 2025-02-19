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
    const message = `${reference}${amountInCents}${currency}${WOMPI_CONFIG.INTEGRITY_SECRET}`;
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch (error) {
    console.error("Error generando firma:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error al generar la firma de seguridad",
    });
    return null;
  }
};

export const convertUSDtoCOPCents = (usdAmount, usdToCopRate) => {
  if (!usdAmount || !usdToCopRate) return 0;
  const copAmount = Math.round(usdAmount * usdToCopRate);
  return copAmount * 100;
};
