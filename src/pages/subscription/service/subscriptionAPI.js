// === FUNCIONES SIMULADAS DE API ===

export const simulateGetSubscription = async (workspaceId) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (workspaceId === "123456789") {
    return {
      id: "sub_123456",
      planId: "business",
      planName: "Chatea Pro Start",
      status: "ACTIVE",
      assistants: ["ventas", "carritos"],
      complements: [
        {
          id: "webhooks",
          name: "1.000 Webhooks Diarios 🔗",
          quantity: 2,
          priceUSD: 20,
          totalPrice: 40,
          selectedBot: {
            flow_ns: "bot_123",
            name: "Bot Principal",
          },
        },
        {
          id: "bot",
          name: "🤖 1 Bot Adicional 🤖",
          quantity: 1,
          priceUSD: 10,
          totalPrice: 10,
        },
      ],
      monthlyAmount: 69.0,
      nextPaymentDate: "15 de Agosto, 2025",
      createdAt: "2025-07-15",
      workspaceId: workspaceId,
      // Datos adicionales para el JSON
      workspace_name: "Mi Empresa Demo",
      owner_email: "admin@miempresa.com",
      phone: "+57 300 123 4567",
    };
  }

  return null;
};

export const simulateGetPlans = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    { id: "business", name: "Chatea Pro Start", priceUSD: 49 },
    { id: "business_lite", name: "Chatea Pro Advanced", priceUSD: 109 },
    { id: "custom_plan3", name: "Chatea Pro Plus", priceUSD: 189 },
    { id: "business_large", name: "Chatea Pro Master", priceUSD: 399 },
  ];
};

export const simulateUpdateSubscription = async (workspaceId, data) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (Math.random() > 0.1) {
    console.log("Subscription updated:", { workspaceId, data });
    
    // Log de los datos estructurados que se enviarían al backend
    if (data.original && data.updated) {
      console.log("=== DATOS PARA EL BACKEND ===");
      console.log("Original subscription data:", JSON.stringify(data.original, null, 2));
      console.log("Updated subscription data:", JSON.stringify(data.updated, null, 2));
      console.log("===============================");
    }
    
    return { success: true };
  } else {
    throw new Error("API Error");
  }
};

export const simulateCancelSubscription = async (workspaceId) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (Math.random() > 0.05) {
    console.log("Subscription canceled:", workspaceId);
    return { success: true };
  } else {
    throw new Error("API Error");
  }
};