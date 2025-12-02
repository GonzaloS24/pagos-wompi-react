# Guía Rápida de Desarrollo - Pasarela de Pagos Wompi

## Inicio Rápido

### 1. Instalación

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 2. URLs de Prueba

**Flujo completo con parámetros**:
```
http://localhost:5173/?workspace_id=123&workspace_name=TestCompany&owner_name=John%20Doe&owner_email=test@example.com&phone_number=3001234567&plan_id=business&period=monthly&document_type=CC&document_number=123456789
```

**Solo workspace (muestra modal de confirmación)**:
```
http://localhost:5173/?workspace_id=123&workspace_name=TestCompany&owner_name=John&owner_email=test@test.com&phone_number=3001234567
```

---

## Flujos de Datos Clave

### Flujo de Datos: Pago Único

```
URL Params
    ↓
useWompiPayment (Hook)
    ↓ parse params
formData State
    ↓ user confirms
PaymentContainer
    ↓ selects plan/assistants
usePaymentCalculations (Hook)
    ↓ generates
{
  totalUSD,
  priceInCOP,
  priceCOPCents,
  reference: "plan_id=business-workspace_id=123-assistants=ventas+marketing-reference123..."
}
    ↓
WompiService.createPaymentWidget()
    ↓ generates integrity signature
wompiHelpers.generateIntegritySignature()
    SHA-256(reference + amountCents + currency + INTEGRITY_SECRET)
    ↓
Widget Script Injected in DOM
    ↓ user completes payment
Wompi API processes payment
    ↓ redirect
/transaction-summary?id={transaction_id}
    ↓
TransactionConfirmation
    ↓ fetch transaction
Wompi API: GET /v1/transactions/{id}
    ↓ parse reference
transactionService.parseReferenceString()
    ↓ extracts
{
  plan_id: "business",
  workspace_id: "123",
  assistants: ["ventas", "marketing"],
  recurring: false
}
    ↓
Display Transaction Summary
```

### Flujo de Datos: Suscripción Recurrente

```
PaymentContainer
    ↓ user clicks recurring
WompiRecurringButton
    ↓ navigate to
RecurringPaymentPage
    location.state = {
      paymentCalculations,
      formData,
      selectedPlan,
      selectedAssistants: [1, 2, 3],  // Numeric IDs
      selectedComplements: [{id: 1, quantity: 2, botFlowNs: "flow123"}]
    }
    ↓
CreditCardForm (user fills)
    {
      number: "4242424242424242",
      exp_month: "12",
      exp_year: "25",
      cvc: "123",
      card_holder: "JOHN DOE"
    }
    ↓
WompiRecurringService.tokenizeCard()
    POST https://production.wompi.co/v1/tokens/cards
    Authorization: Bearer {PUBLIC_KEY}
    Body: { number, exp_month, exp_year, cvc, card_holder }
    ↓
Response: { token: "tok_prod_123...", last_four: "4242", brand: "VISA" }
    ↓
WompiRecurringService.getAcceptanceToken()
    GET https://production.wompi.co/v1/merchants/{PUBLIC_KEY}
    ↓
Response: { acceptance_token: "acc_token_123..." }
    ↓
Prepare Subscription Data
    {
      workspace_id: 123,
      plan_id: "business",
      free_assistant_id: 1,          // First assistant is free
      paid_assistant_ids: [2, 3],    // Rest are paid
      addons: [
        { id: 1, quantity: 2, botFlowNs: "flow123" }
      ],
      card_details: {
        exp_date: { year: 25, month: 12 },
        card_holder: "JOHN DOE",
        card_number: "4242424242424242",
        cvv: "123"
      }
    }
    ↓
POST /api/subscriptions
    Backend Process:
    1. Create Payment Source in Wompi
       POST /v1/payment_sources
       { token, customer_email, acceptance_token }

    2. Generate integrity signature
       SHA-256(reference + amount + currency + INTEGRITY_SECRET)

    3. Create Transaction in Wompi
       POST /v1/transactions
       { amount_in_cents, payment_source_id, signature }

    4. Save subscription in database (status: PENDING)

    ↓
Response: 202 Accepted
    ↓
useSubscriptionPolling starts
    Every 5 seconds:
    GET /api/subscriptions/{workspace_id}

    Check status:
    - PENDING → continue polling
    - ACTIVE → SUCCESS! Redirect
    - ERROR → FAILED! Show error

    Timeout: 24 attempts (2 minutes)
    ↓
Subscription ACTIVE
    ↓
Show Success Message + Redirect to Main Page
    ↓
User can now manage subscription
```

---

## Mapeo de IDs: Frontend ↔ Backend

### Asistentes

| Frontend (String) | Backend (Number) | Nombre                          |
|-------------------|------------------|---------------------------------|
| `"ventas"`        | `1`              | Asistente de ventas WhatsApp    |
| `"comentarios"`   | `2`              | Asistente de comentarios        |
| `"carritos"`      | `3`              | Asistente de carritos abandonados |
| `"marketing"`     | `4`              | Asistente de Marketing          |

**Funciones de conversión**:
```javascript
// utils/constants.js
export const ASSISTANT_ID_MAP = {
  ventas: 1,
  comentarios: 2,
  carritos: 3,
  marketing: 4,
};

// String → Number (para enviar al backend)
export const getAssistantNumericId = (reference) => {
  return ASSISTANT_ID_MAP[reference];
};

// Number → String (para mostrar en frontend)
export const getAssistantReference = (numericId) => {
  const entry = Object.entries(ASSISTANT_ID_MAP)
    .find(([, id]) => id === numericId);
  return entry ? entry[0] : null;
};
```

**Ejemplo de uso**:
```javascript
// Al enviar al backend
const selectedAssistants = ["ventas", "marketing", "carritos"];
const numericIds = selectedAssistants.map(getAssistantNumericId);
// → [1, 4, 3]

// Al recibir del backend
const assistantIds = [1, 4, 3];
const references = assistantIds.map(getAssistantReference);
// → ["ventas", "marketing", "carritos"]
```

### Complementos

| Frontend (String) | Backend (Number) | Nombre            | Precio USD |
|-------------------|------------------|-------------------|------------|
| `"bot"`           | `1`              | Bot Adicional     | $10/mo     |
| `"member"`        | `2`              | Miembro Adicional | $10/mo     |
| `"webhooks"`      | `3`              | Webhooks Diarios  | $20/mo     |

**Formato de referencia de complementos**:
```javascript
// Frontend (en UI)
{
  id: "bot",
  quantity: 2,
  selectedBot: { flow_ns: "flow123" }
}

// Para la referencia de pago (string parsing)
"bot_2_flow123"  // tipo_cantidad_flowNs

// Para el backend (numeric API)
{
  id: 1,           // Numeric ID
  quantity: 2,
  botFlowNs: "flow123"
}
```

---

## Estructuras de Datos Importantes

### 1. Payment Calculations

```javascript
{
  // Precios
  totalUSD: 89,              // Total en USD
  priceInCOP: 356000,        // Total en COP
  priceCOPCents: 35600000,   // Total en centavos COP (para Wompi)

  // Desglose
  planPrice: 49,             // Precio del plan (con descuento si aplica)
  basePlanPrice: 49,         // Precio base sin descuento
  totalAssistantsPrice: 20,  // Precio asistentes (con descuento)
  baseAssistantsPrice: 20,   // Precio base asistentes
  totalComplementsPrice: 20, // Precio complementos (con descuento)

  // Información de descuentos
  planPriceInfo: {
    basePrice: 49,
    finalPrice: 499.8,       // Si es anual
    discount: 88.2,
    isDiscounted: true
  },
  totalAnnualSavings: 108.2, // Ahorro total si es anual
  discountApplied: 108.2,

  // Periodo
  paymentPeriod: "monthly" | "annual",
  isAnnual: false,

  // Asistentes
  freeAssistant: "ventas",
  paidAssistants: ["marketing", "carritos"],
  paidAssistantsCount: 2,
  freeAssistantsCount: 1,

  // Identificadores
  reference: "plan_id=business-workspace_id=123-workspace_name=TestCompany-owner_email=test@example.com-assistants=ventas+marketing-reference1700000000",
  orderDescription: "Plan Chatea Pro Start con ventas (incluido) + 1 asistente(s) adicional(es) y 2 complemento(s) (Plan Mensual)"
}
```

### 2. Form Data

```javascript
{
  workspace_id: "123",
  workspace_name: "TestCompany",
  owner_name: "John Doe",
  owner_email: "test@example.com",
  phone_number: "+57 300 123 4567",
  document_type: "CC",      // Tipo de documento
  document_number: "123456789"
}
```

### 3. Subscription Data (Backend Response)

```javascript
{
  workspace_id: 123,
  workspace_name: "TestCompany",
  status: "ACTIVE" | "PENDING" | "CANCELED",
  plan_id: "business",
  free_assistant_id: 1,
  paid_assistant_ids: [2, 3],
  addons: [
    {
      id: 1,
      quantity: 2,
      bot_flow_ns: "flow123"
    }
  ],
  next_billing_at: "2025-12-23T00:00:00Z",
  email: "test@example.com",
  phone: "+57 300 123 4567",
  document_type: "CC",
  document_number: "123456789"
}
```

### 4. Transaction Data (Wompi Response)

```javascript
{
  data: {
    id: "12345-67890-ABCDE",
    status: "APPROVED" | "DECLINED" | "PENDING" | "ERROR" | "VOIDED",
    reference: "plan_id=business-workspace_id=123-assistants=ventas+marketing-reference123",
    amount_in_cents: 35600000,
    currency: "COP",
    created_at: "2025-11-23T10:30:00Z",
    payment_method_type: "CARD" | "PSE" | "NEQUI",
    payment_method: {
      type: "CARD",
      extra: {
        last_four: "4242",
        brand: "VISA",
        card_type: "CREDIT"
      }
    }
  }
}
```

---

## Componentes: Props y Retornos

### WompiWidget

**Props**:
```javascript
{
  paymentData: {
    priceCOPCents: number,    // REQUERIDO
    reference: string          // REQUERIDO
  },
  isVisible: boolean,          // REQUERIDO
  onWidgetReady?: (success: boolean) => void,
  shouldUpdate?: boolean
}
```

**Comportamiento**:
- Inyecta script de Wompi en el DOM
- Genera firma de integridad
- Dispara `onWidgetReady` cuando el widget está listo

### WompiRecurringButton

**Props**:
```javascript
{
  onPaymentClick?: () => void | Promise<void>,
  disabled?: boolean
}
```

### CreditCardForm

**Props**:
```javascript
{
  onSubmit: (cardData) => void | Promise<void>,
  loading: boolean,
  onCancel: () => void
}
```

**Card Data Format**:
```javascript
{
  number: string,          // "4242424242424242"
  exp_month: string,       // "12"
  exp_year: string,        // "25"
  cvc: string,             // "123"
  card_holder: string      // "JOHN DOE"
}
```

### PaymentSummary

**Props**:
```javascript
{
  selectedPlan: Plan | null,
  usdToCopRate: number,
  selectedAssistants: string[],
  isAssistantsOnly: boolean,
  selectedComplements: Complement[],
  paymentCalculations: PaymentCalculations
}
```

---

## Hooks: Parámetros y Retornos

### useWompiPayment()

**Retorna**:
```javascript
{
  plans: Plan[],
  selectedPlan: Plan | null,
  setSelectedPlan: (plan: Plan) => void,
  usdToCopRate: number,
  urlParams: URLParams | null,
  setUrlParams: (params: URLParams) => void,
  loading: boolean,
  showModal: boolean,
  setShowModal: (show: boolean) => void,
  formData: FormData,
  setFormData: (data: FormData) => void,
  formErrors: FormErrors,
  setFormErrors: (errors: FormErrors) => void,
  isDataConfirmed: boolean,
  setIsDataConfirmed: (confirmed: boolean) => void,
  paymentPeriod: "monthly" | "annual",
  setPaymentPeriod: (period: string) => void
}
```

### usePaymentCalculations(params)

**Parámetros**:
```javascript
{
  purchaseType: "plan" | "assistants" | "subscription",
  selectedPlan: Plan | null,
  selectedAssistants: string[],
  selectedComplements: Complement[],
  usdToCopRate: number,
  urlParams: URLParams,
  enableRecurring: boolean,
  paymentPeriod: "monthly" | "annual",
  freeAssistant: string | null
}
```

**Retorna**: `PaymentCalculations` (ver estructura arriba)

### useSubscriptionPolling(workspaceId, isEnabled, originalUrlParams)

**Retorna**:
```javascript
{
  isPolling: boolean,
  pollingCount: number,
  startPolling: () => void,
  stopPolling: () => void
}
```

---

## Servicios: Métodos Principales

### wompiService

```javascript
// Crear widget de pago
await wompiService.createPaymentWidget(container, {
  priceCOPCents: 35600000,
  reference: "plan_id=business-workspace_id=123-..."
});

// Verificar configuración
const isConfigured = wompiService.isConfigured();
```

### wompiRecurringService

```javascript
// Tokenizar tarjeta
const { success, token, card_info } = await wompiRecurringService.tokenizeCard({
  number: "4242424242424242",
  exp_month: "12",
  exp_year: "25",
  cvc: "123",
  card_holder: "JOHN DOE"
});

// Obtener token de aceptación
const { success, acceptance_token } = await wompiRecurringService.getAcceptanceToken();

// Preparar datos para backend
const backendData = wompiRecurringService.preparePaymentData(
  tokenizeResult,
  acceptanceResult,
  paymentCalculations,
  formData
);
```

### transactionService

```javascript
// Obtener detalles de transacción
const transaction = await transactionService.fetchTransactionDetails(
  transactionId,
  "production",  // "test" | "production"
  searchParams
);

// Parsear referencia
const parsed = transactionService.parseReferenceString(
  "plan_id=business-workspace_id=123-assistants=ventas+marketing-reference123"
);
// → { plan_id: "business", workspace_id: "123", assistants: ["ventas", "marketing"] }
```

---

## APIs Backend

### Base URL

```
https://apimetricasplanes-service-26551171030.us-east1.run.app/api
```

### Endpoints Principales

#### GET /subscriptions/:workspaceId

```bash
curl -X GET \
  https://apimetricasplanes-service-26551171030.us-east1.run.app/api/subscriptions/123
```

**Response**:
```json
{
  "workspace_id": 123,
  "status": "ACTIVE",
  "plan_id": "business",
  "free_assistant_id": 1,
  "paid_assistant_ids": [2, 3],
  "addons": [
    { "id": 1, "quantity": 2, "bot_flow_ns": "flow123" }
  ],
  "next_billing_at": "2025-12-23T00:00:00Z"
}
```

#### POST /subscriptions

```bash
curl -X POST \
  https://apimetricasplanes-service-26551171030.us-east1.run.app/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "workspace_id": 123,
    "workspace_name": "TestCompany",
    "owner_email": "test@example.com",
    "phone": "+57 300 123 4567",
    "document_type": "CC",
    "document_number": "123456789",
    "assistants_only": false,
    "plan_id": "business",
    "free_assistant_id": 1,
    "paid_assistant_ids": [2, 3],
    "addons": [
      { "id": 1, "quantity": 2, "botFlowNs": "flow123" }
    ],
    "card_details": {
      "exp_date": { "year": 25, "month": 12 },
      "card_holder": "JOHN DOE",
      "card_number": "4242424242424242",
      "cvv": "123"
    }
  }'
```

**Response**: `202 Accepted`

#### PATCH /subscriptions/:workspaceId

```bash
curl -X PATCH \
  https://apimetricasplanes-service-26551171030.us-east1.run.app/api/subscriptions/123 \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": "business_lite",
    "paid_assistant_ids": [2, 3, 4]
  }'
```

#### DELETE /subscriptions/:workspaceId/cancel

```bash
curl -X DELETE \
  https://apimetricasplanes-service-26551171030.us-east1.run.app/api/subscriptions/123/cancel
```

**Response**: `204 No Content`

---

## Debugging

### Ver datos de pago en consola

```javascript
// En PaymentContainer.jsx
useEffect(() => {
  console.log("Payment Calculations:", paymentCalculations);
}, [paymentCalculations]);
```

### Ver referencia generada

```javascript
// En usePaymentCalculations.js
useEffect(() => {
  console.log("Generated Reference:", generateReference);
}, [generateReference]);
```

### Ver datos de suscripción durante polling

```javascript
// En useSubscriptionPolling.js
const checkSubscription = async () => {
  const subscription = await getSubscriptionByWorkspace(workspaceId);
  console.log("Polling attempt:", pollingCount, "Status:", subscription?.status);
  // ...
};
```

### Simular transacción exitosa

Agregar parámetro `?test=simulated` en la URL de confirmación:
```
/transaction-summary?id=test-transaction&test=simulated
```

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview

# Linting
npm run lint

# Formatear código
npm run format  # (si está configurado)
```

---

## Errores Comunes y Soluciones

### Error: "Invalid signature"

**Causa**: La firma de integridad no coincide.

**Solución**:
1. Verificar que `INTEGRITY_SECRET` es correcto
2. Verificar que el monto y referencia son exactos
3. Verificar que la moneda es "COP"

```javascript
// wompiHelpers.js
const message = `${reference}${amountInCents}${currency}${WOMPI_CONFIG.INTEGRITY_SECRET}`;
// Debe ser exactamente: "referencia123356000000COPprod_integrity_..."
```

### Error: "Subscription not found" durante polling

**Causa**: El backend aún no ha creado la suscripción o hubo un error.

**Solución**:
1. Verificar que el POST /subscriptions retornó 202
2. Verificar los logs del backend
3. Aumentar el timeout de polling si es necesario

### Error: "Card tokenization failed"

**Causa**: Datos de tarjeta inválidos o problemas con Wompi API.

**Solución**:
1. Verificar que la tarjeta es válida (usar tarjetas de prueba de Wompi)
2. Verificar que PUBLIC_KEY es correcto
3. Verificar conexión a internet

### Error: "Cannot read property 'id' of undefined"

**Causa**: Intentando acceder a un plan/asistente que no existe.

**Solución**:
1. Verificar que los datos se cargaron correctamente
2. Agregar validaciones condicionales:

```javascript
// ✅ Correcto
{selectedPlan?.id && <PlanDetails plan={selectedPlan} />}

// ❌ Incorrecto
{selectedPlan.id && <PlanDetails plan={selectedPlan} />}
```

---

## Mejores Prácticas

### 1. Siempre validar datos antes de enviar

```javascript
// ✅ Correcto
const handleSubmit = async () => {
  const errors = validateForm(formData);
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }
  // Proceder...
};
```

### 2. Manejar estados de carga

```javascript
// ✅ Correcto
const [loading, setLoading] = useState(false);

const handlePayment = async () => {
  setLoading(true);
  try {
    await processPayment();
  } finally {
    setLoading(false);  // Siempre en finally
  }
};
```

### 3. Usar try-catch para llamadas a APIs

```javascript
// ✅ Correcto
try {
  const subscription = await createSubscription(data);
  showSuccess();
} catch (error) {
  console.error("Error:", error);
  showError(error.message);
}
```

### 4. Limpiar efectos y intervalos

```javascript
// ✅ Correcto
useEffect(() => {
  const interval = setInterval(checkStatus, 5000);
  return () => clearInterval(interval);
}, []);
```

---

## Siguientes Pasos

1. **Implementar Webhooks**: Para recibir notificaciones en tiempo real de Wompi
2. **Agregar Tests**: Implementar tests unitarios y de integración
3. **Mejorar UX**: Agregar más feedback visual durante procesos
4. **Optimizar Performance**: Implementar lazy loading de componentes
5. **Agregar Analytics**: Trackear conversiones y eventos importantes

---

**Para más información, consultar**: [DOCUMENTATION.md](./DOCUMENTATION.md)
