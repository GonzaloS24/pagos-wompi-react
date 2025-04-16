export const sanitizeString = (str) => {
  if (!str) return "";
  return str.replace(/[<>]/g, "");
};

export const validateForm = (formData) => {
  const errors = {};

  if (!formData.workspace_id.trim()) {
    errors.workspace_id = "El ID del espacio es requerido";
  } else if (!/^\d+$/.test(formData.workspace_id)) {
    errors.workspace_id = "El ID del espacio solo debe contener números";
  }

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
    !/^\+?\d{5,15}$/.test(formData.phone_number)
  ) {
    errors.phone_number = "Número de teléfono inválido";
  }

  return errors;
};

export const convertUSDtoCOPCents = (usdAmount, usdToCopRate) => {
  if (!usdAmount || !usdToCopRate) return 0;
  const copAmount = Math.round(usdAmount * usdToCopRate);
  return copAmount * 100;
};

// Genera una referencia formateada para Stripe igual a la que se enviaba a Wompi
export const generateStripeReference = (
  purchaseType,
  selectedPlan,
  workspaceId,
  workspaceName,
  ownerEmail,
  phoneNumber,
  selectedAssistants,
  selectedComplements,
  enableRecurringPayment,
  totalUSD
) => {
  const assistantsString =
    selectedAssistants && selectedAssistants.length > 0
      ? `-assistants=${selectedAssistants.join("+")}`
      : "";

  const complementsString =
    selectedComplements && selectedComplements.length > 0
      ? `-complements=${selectedComplements
          .map((c) => {
            if (c.id === "webhooks") {
              return `${c.id}_${c.quantity}_${c.selectedBot.flow_ns}`;
            }
            return `${c.id}_${c.quantity}`;
          })
          .join("+")}`
      : "";

  const recurringString = enableRecurringPayment ? "-recurring=true" : "";
  const gatewayString = "-gateway=stripe";
  const totalUSDString = `-totalUSD=${totalUSD}`;

  return purchaseType === "plan"
    ? `plan_id=${
        selectedPlan.id
      }-workspace_id=${workspaceId}-workspace_name=${workspaceName}-owner_email=${ownerEmail}-phone_number=${phoneNumber}${assistantsString}${complementsString}${recurringString}${gatewayString}${totalUSDString}-reference${Date.now()}`
    : `assistants_only=true-workspace_id=${workspaceId}-workspace_name=${workspaceName}-owner_email=${ownerEmail}-phone_number=${phoneNumber}${assistantsString}${complementsString}${recurringString}${gatewayString}${totalUSDString}-reference${Date.now()}`;
};
