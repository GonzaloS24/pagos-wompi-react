import { WOMPI_CONFIG } from "./wompiConfig";
import { generateIntegritySignature } from "./wompiHelpers";

export class WompiService {
  constructor() {
    this.isUpdatingButton = false;
  }

  async createPaymentWidget(container, paymentData) {
    if (!container || this.isUpdatingButton) return false;

    this.isUpdatingButton = true;

    try {
      container.innerHTML = "";
      this.removeExistingScripts();

      const { priceCOPCents, reference } = paymentData;

      const signature = await generateIntegritySignature(
        reference,
        priceCOPCents,
        "COP"
      );

      if (!signature) {
        this.isUpdatingButton = false;
        return false;
      }

      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/transaction-summary`;

      const script = this.createWompiScript({
        priceCOPCents,
        reference,
        signature,
        redirectUrl,
      });

      container.appendChild(script);
      this.isUpdatingButton = false;
      return true;
    } catch (error) {
      console.error("Error al crear widget de Wompi:", error);
      this.isUpdatingButton = false;
      return false;
    }
  }

  createWompiScript({ priceCOPCents, reference, signature, redirectUrl }) {
    const script = document.createElement("script");
    script.src = "https://checkout.wompi.co/widget.js";
    script.setAttribute("data-render", "button");
    script.setAttribute("data-public-key", WOMPI_CONFIG.PUBLIC_KEY);
    script.setAttribute("data-currency", "COP");
    script.setAttribute("data-amount-in-cents", priceCOPCents.toString());
    script.setAttribute("data-reference", reference);
    script.setAttribute("data-signature:integrity", signature);
    script.setAttribute("data-finish-text", "Pago completado");
    script.setAttribute("data-complete", "true");
    script.setAttribute("data-redirect-url", redirectUrl);

    return script;
  }

  removeExistingScripts() {
    const existingScripts = document.querySelectorAll(
      'script[src="https://checkout.wompi.co/widget.js"]'
    );
    existingScripts.forEach((script) => script.remove());
  }

  triggerPayment() {
    setTimeout(() => {
      const wompiButton = document.querySelector(
        "#wompi-button-container button"
      );
      if (wompiButton) {
        wompiButton.click();
      }
    }, 500);
  }

  isConfigured() {
    return Boolean(WOMPI_CONFIG.PUBLIC_KEY && WOMPI_CONFIG.INTEGRITY_SECRET);
  }
}

export const wompiService = new WompiService();
