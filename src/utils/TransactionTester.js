// Constantes para modos de prueba
export const TEST_MODES = {
  PENDING_TO_APPROVED: "pending-to-approved",
  ALWAYS_PENDING: "always-pending",
  ERROR: "error",
};

/**
 * Inicia una prueba de transacción simulada
 * @param {string} mode - Modo de prueba (usar constantes TEST_MODES)
 */

export const startTransactionTest = (mode = TEST_MODES.PENDING_TO_APPROVED) => {
  // Crear un ID de transacción ficticio
  const testTransactionId = "TEST-" + Date.now();

  // Guardar el modo de prueba en localStorage
  localStorage.setItem("testMode", mode);
  localStorage.setItem("testStartTime", Date.now().toString());

  // Redireccionar a la página de resumen con parámetros de prueba
  window.location.href = `/transaction-summary?id=${testTransactionId}&env=test&simulatedTest=true`;
};

/**
 * Verifica si la transacción actual es una prueba simulada
 * @param {string} searchParams - String de parámetros de búsqueda de URL
 * @returns {boolean}
 */

export const isSimulatedTest = (searchParams) => {
  return new URLSearchParams(searchParams).get("simulatedTest") === "true";
};

/**
 * Obtiene datos de transacción simulados basados en el modo y tiempo
 * @param {string} transactionId - ID de transacción
 * @param {Function} processAssistants - Función para procesar asistentes
 * @returns {Object} Datos simulados de transacción
 */
export const getSimulatedTransactionData = (
  transactionId,
  processAssistants
) => {
  // Obtener datos de prueba de localStorage
  const testMode =
    localStorage.getItem("testMode") || TEST_MODES.PENDING_TO_APPROVED;
  const testStartTime = parseInt(localStorage.getItem("testStartTime") || "0");
  const elapsedTime = Date.now() - testStartTime;

  console.log(`[SIMULACIÓN] Modo: ${testMode}, Tiempo: ${elapsedTime / 1000}s`);

  // Determinar estado según tiempo transcurrido y modo
  let status = "PENDING";

  if (testMode === TEST_MODES.PENDING_TO_APPROVED && elapsedTime > 9000) {
    status = "APPROVED";
  } else if (testMode === TEST_MODES.ERROR) {
    status = "DECLINED";
  }

  // Retornar datos simulados
  return {
    id: transactionId,
    status: status,
    reference: "plan_id=business-workspace_id=12345-assistants=carritos",
    amountUSD: 49.99,
    amountCOP: 199960,
    currency: "COP",
    createdAt: new Date().toLocaleString(),
    paymentMethod: "PSE",
    paymentMethodName: "PSE",
    cardType: null,
    cardBrand: null,
    cardLastFour: null,
    assistants: processAssistants(["carritos"]),
    complements: [],
    plan_id: "business",
    workspace_id: "12345",
    recurring: false,
  };
};
