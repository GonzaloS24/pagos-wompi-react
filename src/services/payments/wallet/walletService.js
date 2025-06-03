import { WALLET_CONFIG } from "./walletConfig";

export class WalletService {
  constructor() {
    this.config = WALLET_CONFIG;
  }

  createWalletPaymentData(paymentData) {
    const {
      totalUSD,
      priceInCOP,
      orderDescription,
      reference,
      formData = {},
    } = paymentData;

    return {
      walletAddress: this.config.WALLET_ADDRESS,
      amount: priceInCOP,
      amountUSD: totalUSD,
      currency: "COP",
      description: orderDescription,
      reference,
      contactEmail: this.config.CONTACT_EMAIL,
      contactWhatsApp: this.config.CONTACT_WHATSAPP,
      customerInfo: {
        name: formData.owner_name || "",
        email: formData.owner_email || "",
        phone: formData.phone_number || "",
        workspaceId: formData.workspace_id || "",
      },
      instructions: this.getPaymentInstructions(priceInCOP),
    };
  }

  getPaymentInstructions(amount) {
    return {
      step1: `Enviar $${amount.toLocaleString("es-CO")} COP a la wallet ${
        this.config.WALLET_ADDRESS
      }`,
      step2: `Enviar captura de pantalla del pago a:`,
      step3: `Email: ${this.config.CONTACT_EMAIL}`,
      step4: `WhatsApp: ${this.config.CONTACT_WHATSAPP}`,
      note: "Tu pago será verificado manualmente en las próximas 24 horas.",
    };
  }

  async processWalletPayment(paymentData) {
    console.log("Wallet payment initiated:", paymentData);

    return {
      success: true,
      message: "Instrucciones de pago generadas correctamente",
      paymentId: `WALLET-${Date.now()}`,
      status: "PENDING_VERIFICATION",
    };
  }

  isConfigured() {
    return Boolean(this.config.WALLET_ADDRESS && this.config.CONTACT_EMAIL);
  }

  getWalletInfo() {
    return {
      address: this.config.WALLET_ADDRESS,
      type: this.config.WALLET_TYPE,
      contactEmail: this.config.CONTACT_EMAIL,
      contactWhatsApp: this.config.CONTACT_WHATSAPP,
    };
  }
}

export const walletService = new WalletService();
