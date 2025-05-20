const PLAN_IDS = {
  BUSINESS: "business",
  BUSINESS_LITE: "business_lite",
  CUSTOM_PLAN3: "custom_plan3",
  BUSINESS_LARGE: "business_large",
};

const PLAN_NAMES = {
  [PLAN_IDS.BUSINESS]: "Chatea Pro Start (1000 usuarios)",
  [PLAN_IDS.BUSINESS_LITE]: "Chatea Pro Advanced (10000 usuarios)",
  [PLAN_IDS.CUSTOM_PLAN3]: "Chatea Pro Plus (20000 usuarios)",
  [PLAN_IDS.BUSINESS_LARGE]: "Chatea Pro Master (50000 usuarios)",
};

export const RECURRING_PLANS_URLS = {
  // Chatea Pro Start (1000 usuarios)
  [`${PLAN_IDS.BUSINESS}_0`]: "https://links.paymentsway.com.co/czyf0a", // Solo asistente gratuito
  // [`${PLAN_IDS.BUSINESS}_0`]: "https://links.paymentsway.com.co/phh6ym", // Solo asistente gratuito
  [`${PLAN_IDS.BUSINESS}_1`]: "https://links.paymentsway.com.co/l1eril", // 1 asistente adicional (total 2)
  [`${PLAN_IDS.BUSINESS}_2`]: "https://links.paymentsway.com.co/1c0l5b", // 2 asistentes adicionales (total 3)

  // Chatea Pro Advanced (10000 usuarios)
  [`${PLAN_IDS.BUSINESS_LITE}_0`]: "https://links.paymentsway.com.co/pr0tx9", // Solo asistente gratuito
  [`${PLAN_IDS.BUSINESS_LITE}_1`]: "https://links.paymentsway.com.co/5mxqyd", // 1 asistente adicional (total 2)
  [`${PLAN_IDS.BUSINESS_LITE}_2`]: "https://links.paymentsway.com.co/pscpao", // 2 asistentes adicionales (total 3)

  // Chatea Pro Plus (20000 usuarios)
  [`${PLAN_IDS.CUSTOM_PLAN3}_0`]: "https://links.paymentsway.com.co/6tghut", // Solo asistente gratuito
  [`${PLAN_IDS.CUSTOM_PLAN3}_1`]: "https://links.paymentsway.com.co/9sutww", // 1 asistente adicional (total 2)
  [`${PLAN_IDS.CUSTOM_PLAN3}_2`]: "https://links.paymentsway.com.co/qzvuct", // 2 asistentes adicionales (total 3)

  // Chatea Pro Master (50000 usuarios)
  [`${PLAN_IDS.BUSINESS_LARGE}_0`]: "https://links.paymentsway.com.co/4h0zdl", // Solo asistente gratuito
  [`${PLAN_IDS.BUSINESS_LARGE}_1`]: "https://links.paymentsway.com.co/enzthr", // 1 asistente adicional (total 2)
  [`${PLAN_IDS.BUSINESS_LARGE}_2`]: "https://links.paymentsway.com.co/xs0t9e", // 2 asistentes adicionales (total 3)
};

export const getRecurringPlanUrl = (planId, additionalAssistants = 0) => {
  const recurringPlanKey = `${planId}_${additionalAssistants}`;
  const url = RECURRING_PLANS_URLS[recurringPlanKey];
  return url;
};

export const hasRecurringPlan = (planId, additionalAssistants = 0) => {
  const result = Boolean(getRecurringPlanUrl(planId, additionalAssistants));
  console.log(
    `Combinación ${planId} con ${additionalAssistants} asistentes adicionales tiene pago recurrente:`,
    result
  );
  return result;
};

export const getPlanDescription = (planId, totalAssistants) => {
  const planName = PLAN_NAMES[planId] || planId;
  const additionalAssistants = Math.max(0, totalAssistants - 1);

  let description = `${planName} + 1 asistente gratuito`;

  if (additionalAssistants > 0) {
    description += ` + ${additionalAssistants} asistente${
      additionalAssistants > 1 ? "s" : ""
    } adicional${additionalAssistants > 1 ? "es" : ""}`;
  }

  return description;
};
