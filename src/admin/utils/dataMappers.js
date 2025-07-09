import {
  ASSISTANT_REFERENCE_MAPPING,
  COMPLEMENT_REFERENCE_MAPPING,
  ASSISTANT_DISPLAY_INFO,
} from "../../utils/constants";

export const getAssistantInfo = (assistantId) => {
  const reference = ASSISTANT_REFERENCE_MAPPING[assistantId];
  const displayInfo = ASSISTANT_DISPLAY_INFO[reference];
  return {
    name:
      displayInfo?.label?.replace(/🔥|🛒|💬/g, "").trim() ||
      `Asistente ${assistantId}`,
  };
};

export const getComplementInfo = (complementId) => {
  const reference = COMPLEMENT_REFERENCE_MAPPING[complementId];
  const names = {
    bot: "Bot Adicional",
    member: "Miembro Adicional",
    webhooks: "Webhooks",
  };
  return { name: names[reference] || `Complemento ${complementId}` };
};