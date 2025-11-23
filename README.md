# Sistema de Pagos con Wompi - Chatea

Sistema completo de pagos y suscripciones integrado con Wompi (pasarela de pagos colombiana) construido con React.

## 🚀 Características

- ✅ **Pagos únicos** - Integración con widget de Wompi
- 🔄 **Suscripciones recurrentes** - Pagos automáticos mensuales
- 💳 **Múltiples métodos de pago** - Wompi, PaymentsWay, Wallet
- 📊 **Panel administrativo** - Gestión de suscripciones y métricas
- 🎯 **Gestión de suscripciones** - Modificar planes, asistentes y complementos
- 💰 **Descuentos automáticos** - 15% en planes anuales
- 📱 **Responsive** - Funciona en todos los dispositivos

## 📚 Documentación

Este proyecto está completamente documentado en tres archivos principales:

### 1. [DOCUMENTATION.md](./DOCUMENTATION.md)
Documentación técnica completa que incluye:
- 🏗️ Arquitectura general del sistema
- 🔌 Integración detallada con Wompi (widget y API)
- 🔄 Flujos de pago (único y recurrente)
- 📦 Estructura completa del proyecto
- ⚛️ Componentes React principales
- 🪝 Hooks personalizados
- 🌐 Servicios y APIs
- 📖 Guía para agregar nuevas funcionalidades

### 2. [QUICK_START.md](./QUICK_START.md)
Guía rápida de desarrollo con:
- ⚡ Inicio rápido e instalación
- 🔗 URLs de prueba
- 📊 Flujos de datos detallados
- 🔀 Mapeo de IDs Frontend ↔ Backend
- 🏗️ Estructuras de datos importantes
- 🔧 Props y retornos de componentes
- 🛠️ Debugging y solución de errores

### 3. [ARCHITECTURE.md](./ARCHITECTURE.md)
Arquitectura del sistema con:
- 📐 Diagramas de arquitectura
- 🗂️ Capas de la aplicación
- 🔄 Ciclo de vida de suscripciones
- 🔒 Seguridad y validaciones
- ⚡ Performance y optimizaciones
- 🧪 Estrategia de testing
- 📈 Escalabilidad

## 🛠️ Tecnologías

- **Frontend**: React 19 + Vite
- **UI**: Bootstrap 5, React Bootstrap, Tailwind CSS
- **Routing**: React Router DOM v7
- **Forms**: Formik
- **HTTP**: Axios
- **Notifications**: SweetAlert2, React Toastify

## 🚦 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build para Producción

```bash
npm run build
```

### Preview de Producción

```bash
npm run preview
```

## 🧪 Testing

### URL de Prueba Completa

```
http://localhost:5173/?workspace_id=123&workspace_name=TestCompany&owner_name=John%20Doe&owner_email=test@example.com&phone_number=3001234567&plan_id=business&period=monthly&document_type=CC&document_number=123456789
```

### Tarjetas de Prueba Wompi

```
Aprobada:  4242 4242 4242 4242
Rechazada: 4111 1111 1111 1111
CVV:       cualquier 3 dígitos
Fecha:     cualquier fecha futura
```

## 📂 Estructura del Proyecto

```
src/
├── admin/                  # Panel administrativo
├── components/             # Componentes React
│   ├── common/            # Componentes reutilizables
│   ├── payments/          # Componentes de pago
│   │   └── wompi/        # Integración Wompi
│   └── products/          # Selectores de productos
├── hooks/                  # Hooks personalizados
├── pages/                  # Páginas principales
│   ├── payment/           # Flujo de pago
│   ├── confirmation/      # Confirmación de transacciones
│   └── subscription/      # Gestión de suscripciones
├── services/              # Servicios y APIs
│   ├── payments/wompi/   # Servicios Wompi
│   ├── subscriptionsApi/ # API de suscripciones
│   └── validation/       # Validaciones
└── utils/                 # Utilidades
```

## 🔑 Configuración

Las claves de Wompi se encuentran en:
```
src/services/payments/wompi/wompiConfig.js
```

Para producción, se recomienda usar variables de entorno (ver [DOCUMENTATION.md](./DOCUMENTATION.md#variables-de-entorno)).

## 🔄 Flujos Principales

### Pago Único
1. Usuario selecciona plan/asistentes
2. Sistema genera referencia y firma
3. Widget de Wompi procesa pago
4. Redirección a página de confirmación

### Suscripción Recurrente
1. Usuario selecciona plan/asistentes + "Pago Recurrente"
2. Ingresa datos de tarjeta
3. Sistema tokeniza tarjeta con Wompi
4. Backend crea suscripción
5. Polling verifica activación (cada 5s por 2 minutos)
6. Redirección con confirmación

## 🌐 APIs

### Backend API
```
Base URL: https://apimetricasplanes-service-26551171030.us-east1.run.app/api
```

Endpoints principales:
- `GET /subscriptions/:workspaceId` - Obtener suscripción
- `POST /subscriptions` - Crear suscripción
- `PATCH /subscriptions/:workspaceId` - Actualizar suscripción
- `DELETE /subscriptions/:workspaceId/cancel` - Cancelar suscripción

### Wompi API
```
Production: https://production.wompi.co/v1
Sandbox: https://sandbox.wompi.co/v1
```

Ver documentación completa en [Wompi Docs](https://docs.wompi.co/)

## 🔒 Seguridad

- ✅ Firma de integridad SHA-256 para pagos
- ✅ Tokenización de tarjetas (nunca se envían directamente)
- ✅ Sanitización de inputs
- ✅ Validación de formularios
- ✅ HTTPS en todas las comunicaciones

## 📈 Características Futuras

- [ ] Webhooks de Wompi para notificaciones en tiempo real
- [ ] Tests unitarios y de integración
- [ ] Internacionalización (i18n)
- [ ] Métricas y analytics
- [ ] Soporte multi-moneda

## 🤝 Contribución

Para contribuir al proyecto:

1. Lee la documentación técnica completa en [DOCUMENTATION.md](./DOCUMENTATION.md)
2. Revisa la guía de desarrollo en [QUICK_START.md](./QUICK_START.md)
3. Consulta la arquitectura en [ARCHITECTURE.md](./ARCHITECTURE.md)

## 📝 Licencia

Este proyecto es privado y confidencial.

## 📞 Soporte

Para preguntas o problemas, contactar al equipo de desarrollo.

---

**Documentación completa**: Consultar [DOCUMENTATION.md](./DOCUMENTATION.md), [QUICK_START.md](./QUICK_START.md) y [ARCHITECTURE.md](./ARCHITECTURE.md)
