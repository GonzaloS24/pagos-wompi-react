export const RECURRING_PLANS_URLS = {
  'business': 'https://links.paymentsway.com.co/quv9be',      // Chatea Pro Start - 1000 usuarios
  'business_lite': 'https://links.paymentsway.com.co/h25q95', // Chatea Pro Advanced - 10000 usuarios  
  'custom_plan3': 'https://links.paymentsway.com.co/q6r2gm',  // Chatea Pro Plus - 20000 usuarios
  'business_large': 'https://links.paymentsway.com.co/auqtbs' // Chatea Pro Master - 50000 usuarios
};

// Función para obtener la URL de pago recurrente según el plan
export const getRecurringPlanUrl = (planId) => {
  console.log('Buscando URL para plan:', planId);
  const url = RECURRING_PLANS_URLS[planId];
  console.log('URL encontrada:', url);
  return url || null;
};

// Función para verificar si un plan tiene pago recurrente disponible
export const hasRecurringPlan = (planId) => {
  const result = Boolean(RECURRING_PLANS_URLS[planId]);
  console.log(`Plan ${planId} tiene pago recurrente:`, result);
  return result;
};