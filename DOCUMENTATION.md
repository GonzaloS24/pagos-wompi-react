# Documentación Técnica - Sistema de Pagos con Wompi

## Tabla de Contenidos
1. [Arquitectura General](#arquitectura-general)
2. [Integración con Wompi](#integración-con-wompi)
3. [Flujos de Pago](#flujos-de-pago)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Componentes Principales](#componentes-principales)
6. [Hooks Personalizados](#hooks-personalizados)
7. [Servicios y APIs](#servicios-y-apis)
8. [Gestión de Suscripciones](#gestión-de-suscripciones)
9. [Guía de Extensión](#guía-de-extensión)

---

## Arquitectura General

Este proyecto es una aplicación React que implementa un sistema completo de pagos y suscripciones integrado con **Wompi** (pasarela de pagos colombiana). El sistema permite:

- **Pagos únicos** (one-time payments)
- **Pagos recurrentes** (suscripciones mensuales)
- **Gestión de suscripciones activas**
- **Múltiples métodos de pago** (Wompi, PaymentsWay, Wallet)

### Stack Tecnológico

- **Frontend**: React 19 + Vite
- **UI**: Bootstrap 5 + React Bootstrap + Tailwind CSS
- **Enrutamiento**: React Router DOM v7
- **Formularios**: Formik
- **HTTP Client**: Axios
- **Notificaciones**: SweetAlert2 + React Toastify
- **Validación**: Validación personalizada

### Backend API

- **Base URL**: `https://apimetricasplanes-service-26551171030.us-east1.run.app/api`
- **Endpoints principales**:
  - `/subscriptions` - CRUD de suscripciones
  - `/plans` - Obtener planes disponibles
  - `/assistants` - Obtener asistentes de IA
  - `/addons` - Obtener complementos

---

## Integración con Wompi

### Configuración

La configuración de Wompi se encuentra en:
```
src/services/payments/wompi/wompiConfig.js
```

```javascript
export const WOMPI_CONFIG = {
  PUBLIC_KEY: "pub_prod_mUzoGd0TQzkIWZwMamDL3ADjEYCO93N7",
  INTEGRITY_SECRET: "prod_integrity_KZkk9BdR7yGH9jDspvfhWud8IdUBnMQw",
  EXCHANGE_RATE_API: "https://api.exchangerate-api.com/v4/latest/USD",
};
```

### Tipos de Integración

#### 1. Pago Único (Widget de Wompi)

**Archivo**: `src/services/payments/wompi/wompiService.js`

Este método utiliza el widget oficial de Wompi que se inyecta dinámicamente en la página.

**Flujo**:
1. Se genera una firma de integridad usando SHA-256
2. Se crea un script dinámico con los parámetros del pago
3. Se inyecta el script en el DOM
4. El usuario interactúa con el widget de Wompi
5. Wompi redirige a la página de confirmación

**Código clave**:
```javascript
// src/services/payments/wompi/wompiService.js:9-49
async createPaymentWidget(container, paymentData) {
  const { priceCOPCents, reference } = paymentData;

  // Generar firma de integridad
  const signature = await generateIntegritySignature(
    reference,
    priceCOPCents,
    "COP"
  );

  // Crear script del widget
  const script = this.createWompiScript({
    priceCOPCents,
    reference,
    signature,
    redirectUrl: `${window.location.origin}/transaction-summary`,
  });

  container.appendChild(script);
}
```

**Firma de Integridad** (`src/services/payments/wompi/wompiHelpers.js:4-46`):
```javascript
const message = `${reference}${amountInCents}${currency}${WOMPI_CONFIG.INTEGRITY_SECRET}`;
const msgBuffer = new TextEncoder().encode(message);
const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
const signature = Array.from(new Uint8Array(hashBuffer))
  .map((b) => b.toString(16).padStart(2, "0"))
  .join("");
```

#### 2. Pago Recurrente (API de Wompi)

**Archivo**: `src/services/payments/wompi/wompiRecurringService.js`

Este método usa la API REST de Wompi para tokenizar tarjetas y crear suscripciones.

**Flujo**:
1. **Tokenización** - Convertir datos de tarjeta a token seguro
2. **Token de Aceptación** - Obtener aceptación de términos
3. **Envío al Backend** - El backend crea la fuente de pago y transacción

**Endpoints Wompi**:
```javascript
export const WOMPI_RECURRING_ENDPOINTS = {
  TOKENIZE_CARD: "https://production.wompi.co/v1/tokens/cards",
  PAYMENT_SOURCES: "https://production.wompi.co/v1/payment_sources",
  TRANSACTIONS: "https://production.wompi.co/v1/transactions",
  ACCEPTANCE_TOKEN: "https://production.wompi.co/v1/merchants/{public_key}",
};
```

**Paso 1 - Tokenizar Tarjeta** (`wompiRecurringService.js:12-50`):
```javascript
async tokenizeCard(cardData) {
  const response = await fetch(WOMPI_RECURRING_ENDPOINTS.TOKENIZE_CARD, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.PUBLIC_KEY}`,
    },
    body: JSON.stringify({
      number: cardData.number.replace(/\s/g, ""),
      exp_month: cardData.exp_month,
      exp_year: cardData.exp_year,
      cvc: cardData.cvc,
      card_holder: cardData.card_holder,
    }),
  });

  return { success: true, token: data.data.id, card_info: {...} };
}
```

**Paso 2 - Obtener Token de Aceptación** (`wompiRecurringService.js:53-78`):
```javascript
async getAcceptanceToken() {
  const url = WOMPI_RECURRING_ENDPOINTS.ACCEPTANCE_TOKEN
    .replace("{public_key}", this.config.PUBLIC_KEY);

  const response = await fetch(url);
  const data = await response.json();

  return {
    success: true,
    acceptance_token: data.data.presigned_acceptance.acceptance_token,
  };
}
```

---

## Flujos de Pago

### Flujo 1: Pago Único con Widget

```mermaid
Usuario → PaymentContainer → WompiPaymentButton → WompiWidget → Wompi API → TransactionConfirmation
```

**Descripción detallada**:

1. **Inicio** (`src/pages/payment/PaymentContainer.jsx:236-250`):
   - Usuario selecciona plan/asistentes
   - Usuario hace clic en "Pagar con Wompi"
   - Se activa `handleWompiPaymentClick()`

2. **Generación de Widget** (`src/components/payments/wompi/WompiWidget.jsx:14-47`):
   - Se calcula el total en COP
   - Se genera referencia única
   - Se crea firma de integridad
   - Se inyecta widget de Wompi

3. **Procesamiento**:
   - Usuario completa pago en widget de Wompi
   - Wompi procesa el pago
   - Redirige a `/transaction-summary?id={transaction_id}`

4. **Confirmación** (`src/pages/confirmation/TransactionConfirmation.jsx`):
   - Se consulta la transacción a la API de Wompi
   - Se muestra estado del pago
   - Se parsea la referencia para extraer datos

### Flujo 2: Suscripción Recurrente

```mermaid
Usuario → PaymentContainer → RecurringPaymentPage → WompiRecurringService → Backend API → Polling → Confirmación
```

**Descripción detallada**:

1. **Inicio** (`PaymentContainer.jsx:252-275`):
   - Usuario selecciona plan/asistentes
   - Usuario activa "Pago Recurrente"
   - Hace clic en "Pagar con Wompi (Recurrente)"
   - Navega a `/recurring-payment`

2. **Formulario de Tarjeta** (`src/pages/payment/RecurringPaymentPage.jsx`):
   - Se muestra `CreditCardForm`
   - Usuario ingresa datos de tarjeta
   - Se validan campos en tiempo real

3. **Tokenización** (`RecurringPaymentPage.jsx:100-151`):
   ```javascript
   // Se tokeniza la tarjeta
   const tokenizeResult = await wompiRecurringService.tokenizeCard(cardData);

   // Se obtiene token de aceptación
   const acceptanceResult = await wompiRecurringService.getAcceptanceToken();

   // Se preparan datos para backend
   const subscriptionData = {
     workspace_id: formData.workspace_id,
     plan_id: selectedPlan?.id,
     free_assistant_id: selectedAssistants[0],
     paid_assistant_ids: selectedAssistants.slice(1),
     addons: processedComplements,
     card_details: {
       exp_date: { year, month },
       card_holder,
       card_number,
       cvv,
     },
   };
   ```

4. **Creación en Backend**:
   - Se envía a `POST /subscriptions`
   - Backend crea payment source en Wompi
   - Backend crea transacción
   - Retorna status 202 (Processing)

5. **Polling** (`src/hooks/useSubscriptionPolling.js:57-148`):
   ```javascript
   const checkSubscription = async () => {
     const subscription = await getSubscriptionByWorkspace(workspaceId);

     if (subscription.status === "ACTIVE") {
       // Éxito - redirigir
       window.location.href = buildRedirectUrl();
     } else if (pollingCount >= 24) {
       // Timeout después de 2 minutos
       showWarning();
     }
   };

   // Polling cada 5 segundos
   setInterval(checkSubscription, 5000);
   ```

6. **Confirmación**:
   - Se muestra mensaje de éxito
   - Se redirige a página principal
   - Usuario puede gestionar suscripción

---

## Estructura del Proyecto

```
src/
├── admin/                    # Panel administrativo
│   ├── AdminDashboard.jsx   # Dashboard principal
│   ├── auth/login/          # Autenticación admin
│   ├── charts/              # Gráficas de métricas
│   ├── components/          # Componentes de admin
│   └── hooks/               # Hooks específicos de admin
│
├── components/
│   ├── common/              # Componentes reutilizables
│   │   ├── ConfirmationModal.jsx    # Modal de confirmación de datos
│   │   ├── ConfirmedInfo.jsx        # Info confirmada del usuario
│   │   └── LoadingSpinner.jsx       # Spinner de carga
│   │
│   ├── forms/
│   │   └── PurchaseTypeSelector.jsx # Selector plan/asistentes
│   │
│   ├── payments/
│   │   ├── PaymentGatewaySelector.jsx  # Selector de pasarela
│   │   ├── PaymentSummary.jsx          # Resumen de pago
│   │   │
│   │   ├── wompi/
│   │   │   ├── WompiWidget.jsx           # Widget de pago único
│   │   │   ├── WompiPaymentButton.jsx    # Botón pago único
│   │   │   ├── WompiRecurringButton.jsx  # Botón pago recurrente
│   │   │   ├── WompiRecurringModal.jsx   # Modal recurrente
│   │   │   └── CreditCardForm.jsx        # Formulario de tarjeta
│   │   │
│   │   └── paymentsWay/     # Integración PaymentsWay
│   │
│   └── products/
│       ├── PlanSelector.jsx     # Selector de planes
│       ├── AIAssistants.jsx     # Selector de asistentes IA
│       └── Complements.jsx      # Selector de complementos
│
├── context/
│   └── auth/                # Contexto de autenticación
│
├── hooks/
│   ├── useWompiPayment.js          # Hook principal de Wompi
│   ├── usePaymentCalculations.js   # Cálculos de precios
│   ├── usePaymentMethods.js        # Gestión métodos de pago
│   └── useSubscriptionPolling.js   # Polling de suscripciones
│
├── pages/
│   ├── payment/
│   │   ├── PaymentContainer.jsx        # Contenedor principal
│   │   ├── RecurringPaymentPage.jsx    # Página pago recurrente
│   │   └── CanceledSubscriptionView.jsx
│   │
│   ├── confirmation/
│   │   ├── TransactionConfirmation.jsx # Confirmación de pago
│   │   ├── hooks/useTransactionData.js
│   │   └── services/transactionService.js
│   │
│   ├── subscription/
│   │   └── SubscriptionManager.jsx  # Gestión de suscripciones
│   │
│   └── wallet/              # Integración Wallet
│
├── services/
│   ├── payments/
│   │   ├── wompi/
│   │   │   ├── wompiService.js          # Servicio pago único
│   │   │   ├── wompiRecurringService.js # Servicio recurrente
│   │   │   ├── wompiConfig.js           # Configuración
│   │   │   ├── wompiRecurringConfig.js  # Config recurrente
│   │   │   └── wompiHelpers.js          # Funciones auxiliares
│   │   │
│   │   ├── paymentsWay/     # Servicios PaymentsWay
│   │   └── wallet/          # Servicios Wallet
│   │
│   ├── api/
│   │   ├── index.js         # Config base API
│   │   ├── exchangeRateApi.js
│   │   └── assistantsApi.js
│   │
│   ├── subscriptionsApi/
│   │   ├── index.js         # Instancia Axios
│   │   ├── subscriptions.js # CRUD suscripciones
│   │   ├── plans.js
│   │   ├── assistants.js
│   │   └── addons.js
│   │
│   ├── subscriptionService.js  # Lógica de negocio
│   ├── dataService.js          # Servicios de datos
│   └── validation/
│       └── formValidation.js   # Validaciones
│
└── utils/
    ├── constants.js        # Constantes globales
    ├── calculations.js     # Cálculos generales
    ├── discounts.js        # Lógica de descuentos
    └── formatters.js       # Formateadores
```

---

## Componentes Principales

### 1. PaymentContainer

**Ubicación**: `src/pages/payment/PaymentContainer.jsx`

**Responsabilidades**:
- Orquestar todo el flujo de pago
- Gestionar estado de plan, asistentes y complementos
- Manejar selección de pasarela de pago
- Controlar modo recurrente/único

**Props Principales**: Ninguna (obtiene datos de URL params)

**Estados Clave**:
```javascript
const [selectedPlan, setSelectedPlan] = useState(null);
const [selectedAssistants, setSelectedAssistants] = useState([]);
const [selectedComplements, setSelectedComplements] = useState([]);
const [purchaseType, setPurchaseType] = useState(null); // "plan" | "assistants" | "subscription"
const [showWompiWidget, setShowWompiWidget] = useState(false);
const [subscription, setSubscription] = useState(null);
```

**Hooks Utilizados**:
- `useWompiPayment()` - Gestión de datos de pago
- `usePaymentCalculations()` - Cálculos de precios
- `usePaymentMethods()` - Métodos de pago

### 2. RecurringPaymentPage

**Ubicación**: `src/pages/payment/RecurringPaymentPage.jsx`

**Responsabilidades**:
- Mostrar formulario de tarjeta de crédito
- Tokenizar tarjeta con Wompi
- Enviar suscripción al backend
- Iniciar polling de estado

**Datos recibidos** (vía `location.state`):
```javascript
{
  paymentCalculations,   // Cálculos de precio
  formData,             // Datos del cliente
  selectedPlan,         // Plan seleccionado
  selectedAssistants,   // IDs numéricos de asistentes
  selectedComplements,  // Complementos con bot_flow_ns
  purchaseType,         // Tipo de compra
  originalUrlParams,    // Parámetros URL originales
}
```

**Flujo Principal** (`RecurringPaymentPage.jsx:100-176`):
```javascript
const handleCardSubmit = async (cardData) => {
  // 1. Mapear asistentes
  const freeAssistantId = selectedAssistants[0];
  const paidAssistantIds = selectedAssistants.slice(1);

  // 2. Procesar complementos
  const processedComplements = selectedComplements.map(c => ({
    id: c.id,
    quantity: c.quantity || 1,
    botFlowNs: c.bot_flow_ns || c.selectedBot?.flow_ns || "",
  }));

  // 3. Crear payload
  const subscriptionData = {
    workspace_id: parseInt(formData.workspace_id),
    plan_id: selectedPlan?.id,
    free_assistant_id: freeAssistantId,
    paid_assistant_ids: paidAssistantIds,
    addons: processedComplements,
    card_details: { ... },
  };

  // 4. Enviar a backend
  await createSubscription(subscriptionData);

  // 5. Activar polling
  setCreatedWorkspaceId(formData.workspace_id);
};
```

### 3. TransactionConfirmation

**Ubicación**: `src/pages/confirmation/TransactionConfirmation.jsx`

**Responsabilidades**:
- Consultar transacción en Wompi API
- Parsear referencia para extraer datos
- Mostrar resumen de pago
- Permitir pago alternativo si falló

**Servicio de Transacciones** (`transactionService.js:8-120`):
```javascript
async fetchTransactionDetails(transactionId, env) {
  const apiUrl = env === "test"
    ? `https://sandbox.wompi.co/v1/transactions/${transactionId}`
    : `https://production.wompi.co/v1/transactions/${transactionId}`;

  const response = await fetch(apiUrl);
  const transaction = responseData.data;

  // Parsear referencia
  const referenceData = this.parseReferenceString(transaction.reference);

  return {
    id: transaction.id,
    status: transaction.status,
    amountCOP: transaction.amount_in_cents / 100,
    assistants: referenceData.assistants,
    plan_id: referenceData.plan_id,
    workspace_id: referenceData.workspace_id,
    recurring: referenceData.recurring,
  };
}
```

**Parseo de Referencia** (`transactionService.js:201-238`):
```javascript
parseReferenceString(reference) {
  // Formato: plan_id=business-workspace_id=123-assistants=ventas+marketing-reference123
  const parts = reference.split("-");

  for (const part of parts) {
    if (part.includes("=")) {
      const [key, value] = part.split("=");

      if (key === "assistants") {
        result.assistants = value.split("+");
      } else if (key === "complements") {
        result.complements = value.split("+");
      } else if (key === "recurring" && value === "true") {
        result.recurring = true;
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}
```

### 4. SubscriptionManager

**Ubicación**: `src/pages/subscription/SubscriptionManager.jsx`

**Responsabilidades**:
- Mostrar suscripción activa
- Permitir cambios de plan/asistentes
- Actualizar suscripción
- Cancelar suscripción

**Hook de Suscripción** (`src/pages/subscription/hooks/useSubscription.js`):
Gestiona el estado completo de la suscripción activa.

---

## Hooks Personalizados

### 1. useWompiPayment

**Ubicación**: `src/hooks/useWompiPayment.js`

**Propósito**: Hook principal que inicializa y gestiona el estado de pago.

**Retorna**:
```javascript
{
  plans,              // Lista de planes disponibles
  selectedPlan,       // Plan seleccionado
  setSelectedPlan,
  usdToCopRate,       // Tasa de cambio USD->COP
  urlParams,          // Parámetros de URL parseados
  loading,            // Estado de carga
  showModal,          // Mostrar modal de confirmación
  formData,           // Datos del formulario
  setFormData,
  formErrors,         // Errores de validación
  isDataConfirmed,    // Si datos fueron confirmados
  paymentPeriod,      // "monthly" | "annual"
  setPaymentPeriod,
}
```

**Inicialización** (`useWompiPayment.js:89-140`):
```javascript
useEffect(() => {
  const initializeData = async () => {
    // 1. Cargar tasa de cambio y planes en paralelo
    const [exchangeRate, fetchedPlans] = await Promise.all([
      fetchUSDtoCOPRate(),
      fetchPlans(),
    ]);

    setUsdToCopRate(exchangeRate || 4200);
    setPlans(fetchedPlans);

    // 2. Buscar plan desde URL
    const params = new URLSearchParams(window.location.search);
    const planId = params.get("plan_id");

    if (planId) {
      const plan = fetchedPlans.find((p) => p.id === planId);
      setSelectedPlan(plan);
    }
  };

  initializeData();
}, []);
```

### 2. usePaymentCalculations

**Ubicación**: `src/hooks/usePaymentCalculations.js`

**Propósito**: Calcular precios, descuentos y generar referencias.

**Parámetros**:
```javascript
{
  purchaseType,        // Tipo de compra
  selectedPlan,        // Plan seleccionado
  selectedAssistants,  // Asistentes seleccionados
  selectedComplements, // Complementos
  usdToCopRate,        // Tasa de cambio
  urlParams,           // Parámetros URL
  enableRecurring,     // Si es pago recurrente
  paymentPeriod,       // Periodo de pago
  freeAssistant,       // ID del asistente gratis
}
```

**Retorna**:
```javascript
{
  totalUSD,              // Total en USD
  priceInCOP,            // Total en COP
  priceCOPCents,         // Total en centavos COP
  planPrice,             // Precio del plan (con descuento si aplica)
  totalAssistantsPrice,  // Precio total asistentes
  totalComplementsPrice, // Precio total complementos
  reference,             // Referencia única generada
  orderDescription,      // Descripción de la orden
  isAnnual,              // Si es pago anual
  totalAnnualSavings,    // Ahorro anual total
  discountApplied,       // Descuento aplicado
}
```

**Cálculo de Precios** (`usePaymentCalculations.js:22-145`):
```javascript
const calculations = useMemo(() => {
  // 1. Calcular precio de asistentes
  let paidAssistants = purchaseType === "plan"
    ? selectedAssistants.filter(id => id !== freeAssistant)
    : selectedAssistants;

  let totalAssistantsPrice = paidAssistants.length * PRICING.ASSISTANT_PRICE_USD;

  // 2. Precio base del plan
  const basePlanPrice = selectedPlan?.priceUSD || 0;

  // 3. Aplicar descuento anual (15%)
  const planPrice = calculateDiscountedPrice(basePlanPrice, paymentPeriod);
  const assistantsPriceWithPeriod = calculateDiscountedPrice(totalAssistantsPrice, paymentPeriod);

  // 4. Complementos
  const baseComplementsPrice = selectedComplements.reduce(
    (total, c) => total + (c.totalPrice || c.priceUSD || 0), 0
  );
  const complementsPriceWithPeriod = calculateDiscountedPrice(baseComplementsPrice, paymentPeriod);

  // 5. Total
  const totalUSD = planPrice + assistantsPriceWithPeriod + complementsPriceWithPeriod;
  const priceInCOP = Math.round(totalUSD * usdToCopRate);

  return { totalUSD, priceInCOP, priceCOPCents: priceInCOP * 100, ... };
}, [purchaseType, selectedPlan, selectedAssistants, paymentPeriod, ...]);
```

**Generación de Referencia** (`usePaymentCalculations.js:162-216`):
```javascript
const generateReference = useMemo(() => {
  const workspaceId = urlParams?.workspace_id;

  // Formatear asistentes: "ventas+marketing+carritos"
  const assistantsString = selectedAssistants.length > 0
    ? `-assistants=${selectedAssistants.join("+")}`
    : "";

  // Formatear complementos: "bot_1+member_2+webhooks_3_flow123"
  const complementsString = selectedComplements.length > 0
    ? `-complements=${selectedComplements.map(c => c.reference).join("+")}`
    : "";

  const periodString = isAnnual ? "-period=annual" : "";
  const recurringString = enableRecurring ? "-recurring=true" : "";

  // Documento (si existe)
  const documentString = urlParams?.document_type && urlParams?.document_number
    ? `-ssn=${urlParams.document_type}+${urlParams.document_number}`
    : "";

  if (purchaseType === "plan") {
    return `plan_id=${selectedPlan.id}-workspace_id=${workspaceId}` +
           `-workspace_name=${urlParams.workspace_name}` +
           `-owner_email=${urlParams.owner_email}` +
           `${assistantsString}${complementsString}${recurringString}` +
           `${periodString}${documentString}-reference${Date.now()}`;
  } else {
    return `assistants_only=true-workspace_id=${workspaceId}...`;
  }
}, [purchaseType, selectedPlan, selectedAssistants, enableRecurring, ...]);
```

### 3. useSubscriptionPolling

**Ubicación**: `src/hooks/useSubscriptionPolling.js`

**Propósito**: Verificar periódicamente el estado de una suscripción después de crearla.

**Parámetros**:
```javascript
useSubscriptionPolling(
  workspaceId,         // ID del workspace a verificar
  isEnabled,           // Si el polling está activo
  originalUrlParams    // Parámetros URL originales
)
```

**Retorna**:
```javascript
{
  isPolling,     // Si está en proceso de polling
  pollingCount,  // Número de intentos
  startPolling,  // Función para iniciar
  stopPolling,   // Función para detener
}
```

**Lógica de Polling** (`useSubscriptionPolling.js:63-143`):
```javascript
const checkSubscription = async () => {
  setPollingCount(prev => prev + 1);

  const subscription = await getSubscriptionByWorkspace(workspaceId);

  // ✅ Éxito
  if (subscription && subscription.status === "ACTIVE") {
    stopPolling();
    await Swal.fire({ icon: "success", title: "¡Suscripción Creada!" });
    window.location.href = buildRedirectUrl();
    return;
  }

  // ❌ Error
  if (subscription && subscription.status !== "PENDING") {
    stopPolling();
    await Swal.fire({ icon: "error", title: "Error en la Suscripción" });
    window.location.href = buildRedirectUrl();
    return;
  }

  // ⏱️ Timeout (2 minutos = 24 intentos)
  if (pollingCount >= 24) {
    stopPolling();
    await Swal.fire({
      icon: "warning",
      title: "Procesamiento en Curso",
      text: "Recibirás un email confirmando el estado."
    });
    window.location.href = buildRedirectUrl();
  }
};

// Polling cada 5 segundos
intervalRef.current = setInterval(checkSubscription, 5000);
```

---

## Servicios y APIs

### Instancia Axios Base

**Ubicación**: `src/services/subscriptionsApi/index.js`

```javascript
import axios from "axios";

const API_BASE_URL = "https://apimetricasplanes-service-26551171030.us-east1.run.app/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejo de errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### API de Suscripciones

**Ubicación**: `src/services/subscriptionsApi/subscriptions.js`

#### GET /subscriptions

**Descripción**: Obtener lista paginada de suscripciones (solo admin).

```javascript
export const getSubscriptions = async (page = 1, limit = 10) => {
  const response = await axiosInstance.get("/subscriptions", {
    params: { page, limit },
  });
  return response.data;
};
```

#### GET /subscriptions/:workspaceId

**Descripción**: Obtener suscripción de un workspace específico.

```javascript
export const getSubscriptionByWorkspace = async (workspaceId) => {
  const response = await axiosInstance.get(`/subscriptions/${workspaceId}`);
  return response.data;
};
```

**Respuesta**:
```json
{
  "workspace_id": 123,
  "workspace_name": "Mi Empresa",
  "status": "ACTIVE",
  "plan_id": "business",
  "free_assistant_id": 1,
  "paid_assistant_ids": [2, 3],
  "addons": [
    { "id": 1, "quantity": 2, "bot_flow_ns": "flow123" }
  ],
  "next_billing_at": "2025-12-23T00:00:00Z",
  "email": "user@example.com",
  "phone": "+57 300 000 0000"
}
```

#### POST /subscriptions

**Descripción**: Crear nueva suscripción.

```javascript
export const createSubscription = async (subscriptionData) => {
  const response = await axiosInstance.post("/subscriptions", subscriptionData);
  return response.data;
};
```

**Payload**:
```json
{
  "workspace_id": 123,
  "workspace_name": "Mi Empresa",
  "owner_email": "owner@example.com",
  "phone": "+57 300 000 0000",
  "document_type": "CC",
  "document_number": "1234567890",
  "assistants_only": false,
  "plan_id": "business",
  "free_assistant_id": 1,
  "paid_assistant_ids": [2, 3],
  "addons": [
    {
      "id": 1,
      "quantity": 2,
      "botFlowNs": "flow123"
    }
  ],
  "card_details": {
    "exp_date": {
      "year": 25,
      "month": 12
    },
    "card_holder": "JOHN DOE",
    "card_number": "4242424242424242",
    "cvv": "123"
  }
}
```

**Respuesta**: `202 Accepted` (la suscripción se procesa de forma asíncrona)

#### PATCH /subscriptions/:workspaceId

**Descripción**: Actualizar suscripción existente.

```javascript
export const updateSubscription = async (workspaceId, updateData) => {
  const response = await axiosInstance.patch(`/subscriptions/${workspaceId}`, updateData);
  return response.data;
};
```

**Payload** (todos los campos son opcionales):
```json
{
  "plan_id": "business_lite",
  "paid_assistant_ids": [2, 3, 4],
  "free_assistant_id": 1,
  "addons": [
    { "id": 1, "quantity": 3, "botFlowNs": "flow456" }
  ],
  "owner_email": "newemail@example.com",
  "card_details": { ... }
}
```

#### PATCH /subscriptions/:workspaceId/payment

**Descripción**: Actualizar método de pago de una suscripción.

```javascript
export const updateSubscriptionPayment = async (workspaceId, paymentData) => {
  const response = await axiosInstance.patch(
    `/subscriptions/${workspaceId}/payment`,
    paymentData
  );
  return response.data;
};
```

#### DELETE /subscriptions/:workspaceId/cancel

**Descripción**: Cancelar suscripción.

```javascript
export const cancelSubscription = async (workspaceId) => {
  const response = await axiosInstance.delete(`/subscriptions/${workspaceId}/cancel`);
  return response.data;
};
```

**Respuesta**: `204 No Content`

---

## Gestión de Suscripciones

### Servicio de Suscripción

**Ubicación**: `src/services/subscriptionService.js`

Este servicio actúa como capa intermedia entre la UI y la API, transformando y enriqueciendo los datos.

#### getSubscription(workspaceId)

**Descripción**: Obtiene y enriquece datos de suscripción.

```javascript
export const getSubscription = async (workspaceId) => {
  const response = await getSubscriptionByWorkspace(workspaceId);

  if (response && (response.status === "ACTIVE" || response.status === "CANCELED")) {
    const [plans, assistants, complements] = await Promise.all([
      fetchPlans(),
      fetchAssistants(),
      fetchComplements(),
    ]);

    const plan = plans.find(p => p.id === response.plan_id);

    // Mapear IDs numéricos a referencias string
    const allAssistantIds = [];
    if (response.free_assistant_id) {
      allAssistantIds.push(getAssistantReference(response.free_assistant_id));
    }
    if (response.paid_assistant_ids) {
      allAssistantIds.push(
        ...response.paid_assistant_ids.map(id => getAssistantReference(id))
      );
    }

    // Mapear complementos
    const mappedComplements = response.addons?.map(addon => {
      const complement = complements.find(c => c.apiId === addon.id);
      return {
        id: getComplementReference(addon.id),
        name: complement?.name,
        quantity: addon.quantity,
        priceUSD: complement?.priceUSD,
        totalPrice: complement?.priceUSD * addon.quantity,
        selectedBot: addon.bot_flow_ns ? { flow_ns: addon.bot_flow_ns } : null,
      };
    });

    return {
      id: `${response.workspace_id}`,
      planId: response.plan_id,
      planName: plan?.name,
      status: response.status,
      assistants: allAssistantIds,
      complements: mappedComplements,
      monthlyAmount: plan?.priceUSD,
      nextPaymentDate: new Date(response.next_billing_at).toLocaleDateString(),
      workspaceId: response.workspace_id.toString(),
      workspace_name: response.workspace_name,
      owner_email: response.email || response.owner_email,
      // ... más campos
    };
  }

  return null;
};
```

**Mapeo de IDs**:

El sistema usa dos tipos de IDs:
- **IDs numéricos** (API backend): `1, 2, 3, 4`
- **Referencias string** (Frontend): `"ventas", "comentarios", "carritos", "marketing"`

**Funciones de mapeo** (`src/utils/constants.js`):
```javascript
// Asistentes
export const ASSISTANT_ID_MAP = {
  ventas: 1,
  comentarios: 2,
  carritos: 3,
  marketing: 4,
};

export const getAssistantReference = (numericId) => {
  const entry = Object.entries(ASSISTANT_ID_MAP).find(([, id]) => id === numericId);
  return entry ? entry[0] : null;
};

// Complementos
export const COMPLEMENT_ID_MAP = {
  bot: 1,
  member: 2,
  webhooks: 3,
};

export const getComplementReference = (numericId) => {
  const entry = Object.entries(COMPLEMENT_ID_MAP).find(([, id]) => id === numericId);
  return entry ? entry[0] : null;
};
```

---

## Guía de Extensión

### Agregar un Nuevo Método de Pago

1. **Crear servicio** en `src/services/payments/nuevoMetodo/`:
```javascript
// nuevoMetodoService.js
export class NuevoMetodoService {
  async createPayment(paymentData) {
    // Lógica de integración
  }

  isConfigured() {
    return Boolean(API_KEY);
  }
}

export const nuevoMetodoService = new NuevoMetodoService();
```

2. **Crear componente de botón**:
```javascript
// NuevoMetodoButton.jsx
const NuevoMetodoButton = ({ onPaymentClick, disabled }) => {
  return (
    <button onClick={onPaymentClick} disabled={disabled}>
      Pagar con Nuevo Método
    </button>
  );
};
```

3. **Integrar en PaymentGatewaySelector**:
```javascript
// PaymentGatewaySelector.jsx
<option value="nuevoMetodo">Nuevo Método</option>
```

4. **Agregar lógica en PaymentContainer**:
```javascript
// PaymentContainer.jsx
{selectedGateway === "nuevoMetodo" && (
  <NuevoMetodoButton onPaymentClick={handleNuevoMetodoClick} />
)}
```

### Agregar un Nuevo Asistente

1. **Actualizar constantes**:
```javascript
// src/utils/constants.js
export const ASSISTANT_ID_MAP = {
  ventas: 1,
  comentarios: 2,
  carritos: 3,
  marketing: 4,
  nuevoAsistente: 5,  // ← Agregar aquí
};
```

2. **Actualizar servicio de datos**:
```javascript
// src/services/dataService.js
const assistantMap = {
  // ...existentes
  nuevoAsistente: {
    apiId: 5,
    name: "Nuevo Asistente",
    label: "Nuevo Asistente de IA",
    icon: "bx-robot",
  },
};
```

3. **Actualizar parseo de transacciones**:
```javascript
// src/pages/confirmation/services/transactionService.js
processAssistants(assistants) {
  const assistantMap = {
    // ...existentes
    nuevoAsistente: {
      name: "Nuevo Asistente",
      icon: "bx-robot",
    },
  };
}
```

### Agregar un Nuevo Complemento

1. **Actualizar constantes**:
```javascript
// src/utils/constants.js
export const COMPLEMENT_ID_MAP = {
  bot: 1,
  member: 2,
  webhooks: 3,
  nuevoComplemento: 4,  // ← Agregar aquí
};

export const PRICING = {
  // ...
  NUEVO_COMPLEMENTO_PRICE_USD: 15,
};
```

2. **Actualizar componente Complements**:
```javascript
// src/components/products/Complements.jsx
const complements = [
  // ...existentes
  {
    id: "nuevoComplemento",
    apiId: 4,
    name: "Nuevo Complemento",
    priceUSD: 15,
    description: "Descripción del complemento",
  },
];
```

3. **Actualizar formateo para backend**:
```javascript
// src/services/dataService.js
export const formatComplementsForCreditCard = async (complements) => {
  return complements.map(comp => {
    if (comp.id === "nuevoComplemento") {
      return {
        id: 4,  // API ID
        quantity: comp.quantity,
        botFlowNs: comp.selectedBot?.flow_ns || "",
      };
    }
    // ...
  });
};
```

### Agregar Descuento Especial

1. **Definir lógica de descuento**:
```javascript
// src/utils/discounts.js
export const calculatePromoDiscount = (basePrice, promoCode) => {
  if (promoCode === "PROMO2025") {
    return basePrice * 0.20; // 20% descuento
  }
  return 0;
};
```

2. **Integrar en cálculos**:
```javascript
// src/hooks/usePaymentCalculations.js
const [promoCode, setPromoCode] = useState("");

const calculations = useMemo(() => {
  let totalUSD = planPrice + assistantsPrice + complementsPrice;

  // Aplicar descuento promo
  const promoDiscount = calculatePromoDiscount(totalUSD, promoCode);
  totalUSD -= promoDiscount;

  return { totalUSD, promoDiscount, ... };
}, [..., promoCode]);
```

3. **Agregar input de código promo**:
```javascript
// En PaymentSummary.jsx
<input
  type="text"
  placeholder="Código promocional"
  value={promoCode}
  onChange={e => setPromoCode(e.target.value.toUpperCase())}
/>
```

### Implementar Webhooks de Wompi

Para recibir notificaciones en tiempo real de Wompi:

1. **Crear endpoint en backend**:
```javascript
// Backend: /api/webhooks/wompi
POST /webhooks/wompi
```

2. **Configurar en Wompi Dashboard**:
- URL: `https://your-backend.com/api/webhooks/wompi`
- Eventos: `transaction.updated`

3. **Procesar webhook**:
```javascript
app.post("/webhooks/wompi", async (req, res) => {
  const { event, data } = req.body;

  if (event === "transaction.updated") {
    const { id, status, reference } = data.transaction;

    // Actualizar estado en BD
    await updateTransactionStatus(id, status);

    // Si es suscripción, activarla
    if (status === "APPROVED" && reference.includes("recurring=true")) {
      const workspaceId = extractWorkspaceId(reference);
      await activateSubscription(workspaceId);
    }
  }

  res.status(200).send("OK");
});
```

### Agregar Métricas y Analytics

1. **Crear servicio de analytics**:
```javascript
// src/services/analyticsService.js
export const trackPayment = (eventName, data) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag("event", eventName, data);
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq("track", eventName, data);
  }
};
```

2. **Integrar en flujos**:
```javascript
// PaymentContainer.jsx
const handleWompiPaymentClick = () => {
  trackPayment("begin_checkout", {
    value: paymentCalculations.totalUSD,
    currency: "USD",
    items: [selectedPlan?.name],
  });

  setShowWompiWidget(true);
};

// TransactionConfirmation.jsx
useEffect(() => {
  if (transactionData?.status === "APPROVED") {
    trackPayment("purchase", {
      transaction_id: transactionData.id,
      value: transactionData.amountUSD,
      currency: "USD",
    });
  }
}, [transactionData]);
```

---

## Variables de Entorno

Aunque actualmente las claves están hardcodeadas, para producción se recomienda:

```env
# .env.production
VITE_WOMPI_PUBLIC_KEY=pub_prod_mUzoGd0TQzkIWZwMamDL3ADjEYCO93N7
VITE_WOMPI_INTEGRITY_SECRET=prod_integrity_KZkk9BdR7yGH9jDspvfhWud8IdUBnMQw
VITE_API_BASE_URL=https://apimetricasplanes-service-26551171030.us-east1.run.app/api
```

```javascript
// wompiConfig.js
export const WOMPI_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_WOMPI_PUBLIC_KEY,
  INTEGRITY_SECRET: import.meta.env.VITE_WOMPI_INTEGRITY_SECRET,
};
```

---

## Seguridad

### Validaciones Implementadas

1. **Validación de Formularios** (`src/services/validation/formValidation.js`):
   - Sanitización de inputs
   - Validación de email
   - Validación de teléfono
   - Validación de workspace ID

2. **Firma de Integridad**:
   - Todas las transacciones usan SHA-256
   - Previene manipulación de montos

3. **Tokenización de Tarjetas**:
   - Las tarjetas nunca se envían al backend directamente
   - Se usa tokenización de Wompi

### Recomendaciones de Seguridad

1. **Mover secrets a variables de entorno**
2. **Implementar rate limiting en backend**
3. **Validar webhooks de Wompi con firma**
4. **Implementar HTTPS en todos los endpoints**
5. **Agregar CORS específico en backend**

---

## Testing

### Datos de Prueba Wompi

**Tarjetas de prueba**:
```
Aprobada: 4242 4242 4242 4242
Rechazada: 4111 1111 1111 1111
CVV: cualquier 3 dígitos
Fecha: cualquier fecha futura
```

**URL de testing**:
```
?workspace_id=123&workspace_name=Test&owner_name=John&owner_email=test@test.com&phone_number=3001234567&plan_id=business&period=monthly
```

---

## Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                        INICIO - PaymentContainer                 │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ Modal Inicial │ → Confirmar datos del cliente
         └───────┬───────┘
                 │
                 ▼
         ┌───────────────────┐
         │ Verificar         │ → ¿Tiene suscripción activa?
         │ Suscripción       │
         └────┬──────────┬───┘
              │          │
      ┌───────┘          └───────┐
      │                          │
      ▼ ACTIVE                   ▼ null/CANCELED
┌──────────────────┐      ┌──────────────────────┐
│ SubscriptionManager│     │ Seleccionar Tipo     │
│ (Gestión)        │      │ - Plan               │
└──────────────────┘      │ - Asistentes         │
                          │ - Suscripción Cancel.│
                          └──────────┬───────────┘
                                     │
                ┌────────────────────┼────────────────────┐
                │                    │                    │
                ▼                    ▼                    ▼
         ┌────────────┐       ┌────────────┐      ┌──────────────┐
         │  Plan      │       │ Asistentes │      │ Reactivar    │
         │            │       │   Solo     │      │ Suscripción  │
         └─────┬──────┘       └─────┬──────┘      └──────────────┘
               │                    │
               └──────────┬─────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Seleccionar:    │
                 │ - Plan (si)     │
                 │ - Asistentes    │
                 │ - Complementos  │
                 │ - Periodo       │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────────┐
                 │ Seleccionar Pasarela│
                 │ - Wompi             │
                 │ - PaymentsWay       │
                 │ - Wallet            │
                 └────────┬────────────┘
                          │
                          ▼
                 ┌─────────────────────┐
                 │ ¿Pago Recurrente?   │
                 └────┬────────────┬───┘
                      │            │
              ┌───────┘            └───────┐
              │ NO                         │ SÍ
              ▼                            ▼
     ┌──────────────────┐        ┌────────────────────────┐
     │ WompiWidget      │        │ RecurringPaymentPage   │
     │ (Pago Único)     │        │                        │
     └────────┬─────────┘        └──────────┬─────────────┘
              │                             │
              │ Procesa en Wompi            │ 1. Formulario de Tarjeta
              │                             │ 2. Tokenizar
              │                             │ 3. Acceptance Token
              │                             │ 4. POST /subscriptions
              │                             │ 5. Polling (5s x 2min)
              │                             │
              └──────────┬──────────────────┘
                         │
                         ▼
              ┌──────────────────────────┐
              │ TransactionConfirmation  │
              │                          │
              │ - Consulta Wompi API     │
              │ - Parsea referencia      │
              │ - Muestra resumen        │
              │ - Opción pago alternativo│
              └──────────────────────────┘
```

---

## Contacto y Soporte

Para preguntas sobre el código o arquitectura, contactar al equipo de desarrollo.

**Documentos relacionados**:
- [API Backend Docs](#) (si existe)
- [Wompi API Docs](https://docs.wompi.co/)
- [React Router v7 Docs](https://reactrouter.com/)

---

**Versión**: 1.0
**Última actualización**: Noviembre 2025
**Autor**: Equipo de Desarrollo
