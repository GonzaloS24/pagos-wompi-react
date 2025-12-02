# Arquitectura del Sistema de Pagos con Wompi

## Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE (React SPA)                             │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         React Router v7                              │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────────────────────┐  │  │
│  │  │     /      │  │ /recurring-  │  │ /transaction-summary       │  │  │
│  │  │            │  │  payment     │  │                            │  │  │
│  │  └────────────┘  └──────────────┘  └────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                          State Management                             │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │  │
│  │  │ useWompiPayment  │  │ usePayment       │  │ useSubscription  │  │  │
│  │  │                  │  │ Calculations     │  │ Polling          │  │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                             Services                                  │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │  │
│  │  │ Wompi       │  │ Wompi        │  │ Transaction Service     │   │  │
│  │  │ Service     │  │ Recurring    │  │                         │   │  │
│  │  │ (One-time)  │  │ Service      │  │                         │   │  │
│  │  └─────────────┘  └──────────────┘  └──────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────┬────────────────────┬─────────────┘
                   │                      │                    │
                   │ HTTP                 │ HTTP               │ HTTP
                   ▼                      ▼                    ▼
    ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐
    │   Wompi API          │  │   Backend API        │  │   External APIs  │
    │   (production.       │  │   (Google Cloud)     │  │   - Exchange     │
    │    wompi.co)         │  │                      │  │     Rate API     │
    │                      │  │   /api/subscriptions │  │   - Plans API    │
    │  - Tokenize Card     │  │   /api/plans         │  │                  │
    │  - Payment Sources   │  │   /api/assistants    │  │                  │
    │  - Transactions      │  │   /api/addons        │  │                  │
    │  - Acceptance Token  │  │                      │  │                  │
    └──────────────────────┘  └──────────────────────┘  └──────────────────┘
                                         │
                                         │ Comunica con
                                         ▼
                              ┌──────────────────────┐
                              │   Wompi API          │
                              │   (Backend Side)     │
                              │                      │
                              │  - Create Payment    │
                              │    Source            │
                              │  - Create            │
                              │    Transaction       │
                              └──────────────────────┘
```

---

## Capas de la Aplicación

### Capa 1: Presentación (UI Components)

```
src/components/
├── common/
│   ├── ConfirmationModal       → Modal inicial para capturar datos del cliente
│   ├── ConfirmedInfo           → Muestra datos confirmados del cliente
│   └── LoadingSpinner          → Indicador de carga reutilizable
│
├── payments/
│   ├── PaymentGatewaySelector  → Selector de pasarela (Wompi, PaymentsWay, Wallet)
│   ├── PaymentSummary          → Resumen de compra con desglose de precios
│   │
│   └── wompi/
│       ├── WompiWidget            → Widget de Wompi (pago único)
│       ├── WompiPaymentButton     → Botón para pago único
│       ├── WompiRecurringButton   → Botón para pago recurrente
│       ├── WompiRecurringModal    → Modal de pago recurrente
│       └── CreditCardForm         → Formulario de tarjeta de crédito
│
└── products/
    ├── PlanSelector            → Selector de planes con toggle mensual/anual
    ├── AIAssistants            → Selector de asistentes de IA
    └── Complements             → Selector de complementos (bots, members, webhooks)
```

**Responsabilidad**: Renderizar UI, capturar entrada del usuario, mostrar feedback visual.

**Ejemplo de flujo**:
```
Usuario selecciona plan → PlanSelector actualiza estado
                      → PaymentSummary recalcula total
                      → WompiPaymentButton se habilita
```

---

### Capa 2: Contenedores y Páginas (Smart Components)

```
src/pages/
├── payment/
│   ├── PaymentContainer.jsx        → Orquestador principal del flujo de pago
│   ├── RecurringPaymentPage.jsx   → Página de checkout para suscripciones
│   └── CanceledSubscriptionView.jsx → Vista para suscripciones canceladas
│
├── confirmation/
│   └── TransactionConfirmation.jsx → Página de confirmación post-pago
│
└── subscription/
    └── SubscriptionManager.jsx     → Gestión de suscripciones activas
```

**Responsabilidad**: Coordinar múltiples componentes, gestionar estado complejo, comunicarse con servicios.

**Ejemplo - PaymentContainer**:
```javascript
PaymentContainer
  ├─ Gestiona: plan, asistentes, complementos, gateway, periodo
  ├─ Coordina: useWompiPayment, usePaymentCalculations, usePaymentMethods
  ├─ Renderiza:
  │    ├─ ConfirmationModal (si no hay datos confirmados)
  │    ├─ PurchaseTypeSelector
  │    ├─ PlanSelector
  │    ├─ AIAssistants
  │    ├─ Complements
  │    ├─ PaymentSummary
  │    └─ [WompiWidget | WompiRecurringButton | PaymentsWayForm | WalletButton]
  └─ Maneja:
       ├─ Verificación de suscripción existente
       ├─ Navegación a RecurringPaymentPage
       └─ Activación de modales
```

---

### Capa 3: Lógica de Negocio (Hooks)

```
src/hooks/
├── useWompiPayment.js
│   Responsabilidad:
│   - Cargar planes y tasa de cambio
│   - Parsear parámetros URL
│   - Gestionar formulario de datos del cliente
│   - Controlar modal de confirmación
│
├── usePaymentCalculations.js
│   Responsabilidad:
│   - Calcular precios con/sin descuentos
│   - Generar referencias únicas
│   - Generar descripciones de orden
│   - Calcular conversión USD → COP
│
├── usePaymentMethods.js
│   Responsabilidad:
│   - Gestionar gateway seleccionado
│   - Controlar modo recurrente
│   - Validar compatibilidad (recurrente solo con mensual)
│
└── useSubscriptionPolling.js
    Responsabilidad:
    - Verificar periódicamente estado de suscripción
    - Manejar timeouts y errores
    - Redirigir al completar
```

**Diagrama de Dependencias**:
```
PaymentContainer
      │
      ├─► useWompiPayment()
      │       └─► fetchPlans(), fetchUSDtoCOPRate()
      │
      ├─► usePaymentCalculations({ selectedPlan, selectedAssistants, ... })
      │       └─► calculateDiscountedPrice(), formatReference()
      │
      └─► usePaymentMethods({ purchaseType, selectedPlan, ... })
              └─► validación de compatibilidad

RecurringPaymentPage
      │
      └─► useSubscriptionPolling(workspaceId, isEnabled)
              └─► getSubscriptionByWorkspace() cada 5s
```

---

### Capa 4: Servicios (API Communication)

```
src/services/
├── payments/
│   └── wompi/
│       ├── wompiService.js
│       │   Métodos:
│       │   - createPaymentWidget(container, paymentData)
│       │   - createWompiScript({ priceCOPCents, reference, signature })
│       │   - removeExistingScripts()
│       │
│       ├── wompiRecurringService.js
│       │   Métodos:
│       │   - tokenizeCard(cardData)              → POST /tokens/cards
│       │   - getAcceptanceToken()                → GET /merchants/{key}
│       │   - createPaymentSource(...)            → POST /payment_sources
│       │   - createTransaction(...)              → POST /transactions
│       │   - processRecurringPayment(...)        → Orquesta pasos 1-2
│       │
│       └── wompiHelpers.js
│           Métodos:
│           - generateIntegritySignature(reference, amount, currency)
│           - convertUSDtoCOPCents(usdAmount, rate)
│           - getPaymentMethodName(methodType)
│
├── subscriptionsApi/
│   └── subscriptions.js
│       Métodos:
│       - getSubscriptions(page, limit)           → GET /subscriptions
│       - getSubscriptionByWorkspace(workspaceId) → GET /subscriptions/:id
│       - createSubscription(data)                → POST /subscriptions
│       - updateSubscription(id, data)            → PATCH /subscriptions/:id
│       - updateSubscriptionPayment(id, data)     → PATCH /subscriptions/:id/payment
│       - cancelSubscription(id)                  → DELETE /subscriptions/:id/cancel
│
├── subscriptionService.js
│   Capa de abstracción sobre subscriptionsApi
│   - Enriquece datos (mapea IDs numéricos a referencias)
│   - Calcula fechas y estado
│   - Formatea para consumo de UI
│
└── pages/confirmation/services/
    └── transactionService.js
        Métodos:
        - fetchTransactionDetails(id, env)        → GET Wompi /transactions/:id
        - parseReferenceString(reference)         → Extrae datos de referencia
        - processAssistants(assistants)           → Mapea IDs a nombres
        - processComplements(complements)         → Mapea IDs a nombres
```

**Flujo de Servicio - Pago Único**:
```
1. WompiWidget usa wompiService.createPaymentWidget()
2. wompiService genera firma con wompiHelpers.generateIntegritySignature()
3. wompiService inyecta script de Wompi en DOM
4. Usuario completa pago en Wompi
5. Wompi redirige a /transaction-summary?id=xxx
6. TransactionConfirmation usa transactionService.fetchTransactionDetails()
7. transactionService consulta Wompi API
8. transactionService parsea referencia con parseReferenceString()
```

**Flujo de Servicio - Suscripción**:
```
1. RecurringPaymentPage usa wompiRecurringService.tokenizeCard()
   └─► Wompi API: POST /tokens/cards

2. wompiRecurringService.getAcceptanceToken()
   └─► Wompi API: GET /merchants/{key}

3. RecurringPaymentPage usa createSubscription() de subscriptionsApi
   └─► Backend API: POST /subscriptions
       └─► Backend crea payment source en Wompi
       └─► Backend crea transaction en Wompi
       └─► Backend guarda en BD

4. useSubscriptionPolling inicia polling
   └─► Backend API: GET /subscriptions/:workspaceId cada 5s
       └─► Verifica status: PENDING → ACTIVE
```

---

## Flujo de Datos: Referencias de Pago

Las referencias son la clave para vincular pagos con información de negocio.

### Estructura de Referencia

```
Formato general:
[tipo_compra]-[datos_workspace]-[items]-[flags]-[timestamp]

Ejemplo completo:
plan_id=business-workspace_id=123-workspace_name=TestCompany-owner_email=test@example.com-phone_number=3001234567-assistants=ventas+marketing+carritos-complements=bot_2_flow123+webhooks_1_flow456-recurring=true-period=annual-ssn=CC+123456789-reference1700000000000
```

### Componentes de la Referencia

| Parte | Ejemplo | Descripción |
|-------|---------|-------------|
| **Tipo de compra** | `plan_id=business` | ID del plan, o `assistants_only=true` |
| **Workspace** | `workspace_id=123` | ID del workspace |
| **Workspace name** | `workspace_name=TestCompany` | Nombre del workspace |
| **Email** | `owner_email=test@example.com` | Email del propietario |
| **Teléfono** | `phone_number=3001234567` | Teléfono de contacto |
| **Asistentes** | `assistants=ventas+marketing` | IDs separados por `+` |
| **Complementos** | `complements=bot_2_flow123` | Formato: `tipo_cantidad_flowNs` |
| **Recurrente** | `recurring=true` | Si es pago recurrente |
| **Periodo** | `period=annual` | `monthly` o `annual` |
| **Documento** | `ssn=CC+123456789` | Tipo y número de documento |
| **Timestamp** | `reference1700000000000` | Timestamp único |

### Parseo de Referencia

```javascript
// Input
const reference = "plan_id=business-workspace_id=123-assistants=ventas+marketing-reference123";

// Output después de parseReferenceString()
{
  plan_id: "business",
  workspace_id: "123",
  assistants: ["ventas", "marketing"],
  complements: [],
  recurring: false,
  period: "monthly"
}
```

---

## Flujo de Datos: IDs y Referencias

### Sistema de Doble Mapeo

El sistema usa dos sistemas de identificación:
- **Frontend**: Referencias string legibles (`"ventas"`, `"bot"`)
- **Backend API**: IDs numéricos (`1`, `2`, `3`)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND                                    │
│                                                                      │
│  Usuario selecciona:                                                 │
│  ✓ Asistente "ventas"                                               │
│  ✓ Asistente "marketing"                                            │
│  ✓ Complemento "bot" (qty: 2, flow: "flow123")                      │
│                                                                      │
│  Estado en React:                                                    │
│  {                                                                   │
│    selectedAssistants: ["ventas", "marketing"],                     │
│    selectedComplements: [                                            │
│      { id: "bot", quantity: 2, selectedBot: { flow_ns: "flow123" }}│
│    ]                                                                 │
│  }                                                                   │
│                                                                      │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      │ Transformación antes de enviar
                      │ (formatAssistantsForCreditCard,
                      │  formatComplementsForCreditCard)
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PAYLOAD AL BACKEND                                │
│                                                                      │
│  {                                                                   │
│    free_assistant_id: 1,              ← "ventas" → 1               │
│    paid_assistant_ids: [4],           ← "marketing" → 4            │
│    addons: [                                                         │
│      {                                                               │
│        id: 1,                         ← "bot" → 1                   │
│        quantity: 2,                                                  │
│        botFlowNs: "flow123"                                          │
│      }                                                               │
│    ]                                                                 │
│  }                                                                   │
│                                                                      │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      │ Guardado en BD
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND DATABASE                                  │
│                                                                      │
│  subscription {                                                      │
│    workspace_id: 123,                                                │
│    free_assistant_id: 1,                                             │
│    paid_assistant_ids: [4],                                          │
│    addons: [                                                         │
│      { id: 1, quantity: 2, bot_flow_ns: "flow123" }                │
│    ]                                                                 │
│  }                                                                   │
│                                                                      │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      │ Transformación al leer
                      │ (getSubscription en subscriptionService)
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DE VUELTA AL FRONTEND                             │
│                                                                      │
│  {                                                                   │
│    assistants: ["ventas", "marketing"], ← 1 → "ventas", 4 → "marketing"
│    complements: [                                                    │
│      {                                                               │
│        id: "bot",                     ← 1 → "bot"                   │
│        quantity: 2,                                                  │
│        selectedBot: { flow_ns: "flow123" }                           │
│      }                                                               │
│    ]                                                                 │
│  }                                                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Funciones de Mapeo

```javascript
// constants.js
export const ASSISTANT_ID_MAP = {
  ventas: 1,
  comentarios: 2,
  carritos: 3,
  marketing: 4,
};

export const COMPLEMENT_ID_MAP = {
  bot: 1,
  member: 2,
  webhooks: 3,
};

// String → Number (para enviar a backend)
export const getAssistantNumericId = (reference) => {
  return ASSISTANT_ID_MAP[reference];
};

// Number → String (para mostrar en frontend)
export const getAssistantReference = (numericId) => {
  return Object.entries(ASSISTANT_ID_MAP)
    .find(([, id]) => id === numericId)?.[0];
};
```

---

## Ciclo de Vida de una Suscripción

```
┌────────────────────────────────────────────────────────────────────┐
│ ESTADO: null (no existe suscripción)                               │
│                                                                     │
│ Usuario:                                                            │
│ 1. Abre aplicación con parámetros URL                              │
│ 2. Confirma datos en modal                                         │
│ 3. No tiene suscripción activa                                     │
└───────────────────────┬────────────────────────────────────────────┘
                        │
                        │ Selecciona plan + asistentes + complementos
                        │ Elige "Pago Recurrente"
                        ▼
┌────────────────────────────────────────────────────────────────────┐
│ ACCIÓN: Crear Suscripción                                          │
│                                                                     │
│ 1. RecurringPaymentPage                                             │
│ 2. Tokeniza tarjeta con Wompi                                      │
│ 3. Obtiene acceptance token                                        │
│ 4. POST /api/subscriptions                                         │
│                                                                     │
│ Backend:                                                            │
│ - Crea payment source en Wompi                                     │
│ - Crea transacción inicial                                         │
│ - Guarda en BD con status: PENDING                                │
└───────────────────────┬────────────────────────────────────────────┘
                        │
                        │ Response: 202 Accepted
                        ▼
┌────────────────────────────────────────────────────────────────────┐
│ ESTADO: PENDING                                                     │
│                                                                     │
│ Frontend:                                                           │
│ - Inicia polling cada 5 segundos                                   │
│ - Muestra "Verificando tu suscripción..."                          │
│                                                                     │
│ Backend:                                                            │
│ - Procesa pago en Wompi (asíncrono)                                │
│ - Actualiza status según resultado                                 │
└───────────────────────┬───────────────────┬────────────────────────┘
                        │                   │
             ┌──────────┘                   └──────────┐
             │ APPROVED                                │ DECLINED
             ▼                                         ▼
┌──────────────────────────┐           ┌────────────────────────────┐
│ ESTADO: ACTIVE           │           │ ESTADO: ERROR/DECLINED     │
│                          │           │                            │
│ Frontend:                │           │ Frontend:                  │
│ - Detiene polling        │           │ - Muestra error            │
│ - Muestra éxito          │           │ - Redirige a reintentar    │
│ - Redirige a main        │           │                            │
│                          │           │ Usuario puede:             │
│ Usuario puede:           │           │ - Intentar con otra tarjeta│
│ - Ver suscripción        │           │ - Usar otro método de pago │
│ - Modificar plan         │           └────────────────────────────┘
│ - Cambiar asistentes     │
│ - Agregar complementos   │
│ - Actualizar tarjeta     │
│ - Cancelar suscripción   │
└────────────┬─────────────┘
             │
             │ Usuario gestiona suscripción
             │
             ├─► PATCH /subscriptions/:id
             │   - Cambiar plan
             │   - Cambiar asistentes
             │   - Cambiar complementos
             │   → Sigue ACTIVE (actualizado)
             │
             ├─► PATCH /subscriptions/:id/payment
             │   - Actualizar tarjeta
             │   → Sigue ACTIVE
             │
             └─► DELETE /subscriptions/:id/cancel
                 - Cancela suscripción
                 │
                 ▼
        ┌─────────────────────────────────┐
        │ ESTADO: CANCELED                │
        │                                  │
        │ - Sigue activa hasta fin periodo│
        │ - No se renueva automáticamente │
        │ - Usuario puede reactivar       │
        │                                  │
        │ Usuario ve:                      │
        │ - "Reactivar Suscripción" (btn) │
        │ - Fecha de expiración           │
        └─────────────────────────────────┘
```

---

## Seguridad y Validaciones

### Flujo de Validación de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTRADA DEL USUARIO                           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  Sanitización (Frontend)     │
        │  - sanitizeString()          │
        │  - Elimina caracteres        │
        │    peligrosos                │
        │  - Trim whitespace           │
        └────────────┬─────────────────┘
                     │
                     ▼
        ┌──────────────────────────────┐
        │  Validación (Frontend)       │
        │  - validateForm()            │
        │  - Email válido              │
        │  - Teléfono válido           │
        │  - Campos requeridos         │
        │  - Longitud mínima/máxima    │
        └────────────┬─────────────────┘
                     │
                     ├─► ❌ Errores → Mostrar en UI
                     │
                     └─► ✅ Válido
                          │
                          ▼
        ┌──────────────────────────────────┐
        │  Firma de Integridad             │
        │  - Para pagos únicos             │
        │  - SHA-256(ref + amount +        │
        │            currency + secret)    │
        │  - Previene manipulación montos  │
        └────────────┬─────────────────────┘
                     │
                     ▼
        ┌──────────────────────────────────┐
        │  Tokenización (Suscripciones)    │
        │  - Datos de tarjeta → Token      │
        │  - Nunca se envía tarjeta        │
        │    directamente al backend       │
        │  - Token expira en 1 hora        │
        └────────────┬─────────────────────┘
                     │
                     ▼
        ┌──────────────────────────────────┐
        │  Envío al Backend                │
        │  - HTTPS only                    │
        │  - Headers seguros               │
        │  - No contiene datos sensibles   │
        └────────────┬─────────────────────┘
                     │
                     ▼
        ┌──────────────────────────────────┐
        │  Validación Backend (asumida)    │
        │  - Validación de esquema         │
        │  - Verificación de workspace     │
        │  - Rate limiting                 │
        │  - Firma de Wompi (webhooks)     │
        └──────────────────────────────────┘
```

---

## Performance y Optimizaciones

### Lazy Loading de Rutas

```javascript
// App.jsx
const PaymentContainer = lazy(() => import('./pages/payment/PaymentContainer'));
const TransactionConfirmation = lazy(() => import('./pages/confirmation/TransactionConfirmation'));
const RecurringPaymentPage = lazy(() => import('./pages/payment/RecurringPaymentPage'));
```

### Memoización de Cálculos Costosos

```javascript
// usePaymentCalculations.js
const calculations = useMemo(() => {
  // Cálculos pesados solo cuando cambian las dependencias
  return { totalUSD, priceInCOP, ... };
}, [selectedPlan, selectedAssistants, paymentPeriod]);

const generateReference = useMemo(() => {
  // Generar referencia solo cuando cambian los datos
  return `plan_id=${selectedPlan.id}-...`;
}, [selectedPlan, selectedAssistants, urlParams]);
```

### Debounce en Inputs

```javascript
// CreditCardForm.jsx
const debouncedValidation = useDebounce((value) => {
  validateCardNumber(value);
}, 300);
```

### Parallel Data Fetching

```javascript
// useWompiPayment.js
const [exchangeRate, fetchedPlans] = await Promise.all([
  fetchUSDtoCOPRate(),
  fetchPlans(),
]);
```

---

## Testing Strategy

### Niveles de Testing

```
┌───────────────────────────────────────────────────────────┐
│ 1. Unit Tests                                              │
│    - Funciones puras (helpers, formatters)                 │
│    - Hooks individuales                                    │
│    - Servicios con mocks                                   │
│    Tools: Jest, React Testing Library                      │
└───────────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────┐
│ 2. Integration Tests                                       │
│    - Flujos componente + hook + servicio                   │
│    - Mock de APIs externas                                 │
│    Tools: Jest, MSW (Mock Service Worker)                 │
└───────────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────┐
│ 3. E2E Tests                                               │
│    - Flujos completos de usuario                           │
│    - Ambiente de staging                                   │
│    Tools: Playwright, Cypress                              │
└───────────────────────────────────────────────────────────┘
```

### Casos de Test Críticos

1. **Pago Único Exitoso**
   - Seleccionar plan → generar referencia → pago aprobado

2. **Suscripción Exitosa**
   - Tokenizar tarjeta → crear suscripción → polling → activa

3. **Manejo de Errores**
   - Tarjeta rechazada → mostrar error → permitir reintentar

4. **Descuentos**
   - Plan anual → 15% descuento aplicado correctamente

5. **Mapeo de IDs**
   - Frontend strings ↔ Backend numbers

---

## Monitoreo y Observabilidad

### Eventos a Trackear

```javascript
// Analytics tracking
trackEvent("payment_initiated", {
  plan_id: selectedPlan.id,
  amount_usd: totalUSD,
  payment_method: "wompi",
  recurring: enableRecurring,
});

trackEvent("payment_completed", {
  transaction_id: transactionData.id,
  status: transactionData.status,
  amount: transactionData.amountUSD,
});

trackEvent("subscription_created", {
  workspace_id: formData.workspace_id,
  plan_id: selectedPlan.id,
  assistants_count: selectedAssistants.length,
});
```

### Errores a Monitorear

```javascript
// Error tracking (Sentry, etc.)
captureException(error, {
  tags: {
    component: "RecurringPaymentPage",
    action: "tokenize_card",
  },
  extra: {
    workspace_id: formData.workspace_id,
    card_last_four: cardData.number.slice(-4),
  },
});
```

---

## Escalabilidad

### Puntos de Extensión

1. **Agregar nuevos métodos de pago**
   - Crear servicio en `src/services/payments/nuevoMetodo/`
   - Agregar opción en `PaymentGatewaySelector`
   - Implementar componente de pago

2. **Agregar nuevos productos (planes/asistentes)**
   - Actualizar `ASSISTANT_ID_MAP` en constants
   - Actualizar parsers en transactionService
   - Backend actualiza catálogo

3. **Internacionalización**
   - Agregar i18n (react-i18next)
   - Externalizar strings
   - Soporte multi-moneda

4. **Multi-tenancy**
   - Agregar tenant_id a contexto
   - Filtrar datos por tenant
   - Personalización por tenant

---

**Para más detalles, consultar**:
- [DOCUMENTATION.md](./DOCUMENTATION.md) - Documentación técnica completa
- [QUICK_START.md](./QUICK_START.md) - Guía rápida de desarrollo
