import { useState, useEffect } from "react";
import "./WompiPayment.css";
import chatea from "../../assets/chatea.png";

const WompiPayment = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [usdToCopRate, setUsdToCopRate] = useState();
  const INTEGRITY_SECRET = "test_integrity_RMUwn1SSLmR31OFgXOdgJcV2VkcaaDVL";

  // Función para generar hash SHA-256
  const generateIntegritySignature = async (
    reference,
    amountInCents,
    currency
  ) => {
    const message = `${reference}${amountInCents}${currency}${INTEGRITY_SECRET}`;
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const convertUSDtoCOPCents = (usdAmount) => {
    return Math.round(usdAmount * usdToCopRate * 100);
  };

  // Función para manejar el evento de transacción
  const handleTransactionResponse = (data) => {
    try {
      console.log("Datos completos del evento:", data);

      if (!data || !data.transaction) {
        console.warn("No se recibieron datos de transacción válidos");
        return;
      }

      const transaction = data.transaction;

      const payload = {
        transactionId: transaction.id,
        status: transaction.status,
        amountInCents: transaction.amount_in_cents,
        currency: transaction.currency,
        reference: transaction.reference,
        customerEmail: transaction.customer_email,
        customerData: transaction.customer_data,
        paymentMethod: transaction.payment_method_type,
        amountUSD: selectedPlan?.priceUSD,
        exchangeRate: usdToCopRate,
        createdAt: new Date().toISOString(),
      };

      console.log("Datos que se enviarán al webhook:", payload);

      // Enviar datos al webhook
      fetch("https://webhook-test.com/a3af9ab23fe8512e4d15629cc5a5ea28", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Respuesta del webhook:", data);
        })
        .catch((error) => {
          console.error("Error al enviar al webhook:", error);
        });
    } catch (error) {
      console.error("Error al procesar la transacción:", error);
    }
  };

  useEffect(() => {
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then((res) => res.json())
      .then((data) => setUsdToCopRate(data.rates.COP))
      .catch((error) =>
        console.error("Error al obtener tasa de cambio:", error)
      );

    const Plans = [
      { id: 1, name: "Chatea Pro Start", priceUSD: 49 },
      { id: 2, name: "Chatea Pro Advanced", priceUSD: 109 },
      { id: 3, name: "Chatea Pro Plus", priceUSD: 189 },
      { id: 4, name: "Chatea Pro Master", priceUSD: 389 },
    ];
    setPlans(Plans);

    const handleWompiEvent = (event) => {
      console.log("Evento Wompi detectado:", event.detail);
      if (event.detail && event.detail.transaction) {
        handleTransactionResponse(event.detail);
      }
    };

    document.addEventListener("transaction.status.updated", handleWompiEvent);
    document.addEventListener("transaction.succeeded", handleWompiEvent);
    document.addEventListener("transaction.failed", handleWompiEvent);

    return () => {
      document.removeEventListener(
        "transaction.status.updated",
        handleWompiEvent
      );
      document.removeEventListener("transaction.succeeded", handleWompiEvent);
      document.removeEventListener("transaction.failed", handleWompiEvent);
    };
  }, [selectedPlan, usdToCopRate]);

  useEffect(() => {
    const updateWompiButton = async () => {
      const container = document.getElementById("wompi-button-container");
      if (container) {
        container.innerHTML = "";
      }

      if (selectedPlan && usdToCopRate) {
        const priceCOPCents = convertUSDtoCOPCents(selectedPlan.priceUSD);
        const reference = `PLAN-${selectedPlan.id}-${Date.now()}`;

        const signature = await generateIntegritySignature(
          reference,
          priceCOPCents,
          "COP"
        );

        console.log(`Precio en USD: $${selectedPlan.priceUSD}`);
        console.log(`Precio en COP centavos: ${priceCOPCents}`);
        console.log(`Firma generada: ${signature}`);

        const script = document.createElement("script");
        script.src = "https://checkout.wompi.co/widget.js";
        script.setAttribute("data-render", "button");
        script.setAttribute(
          "data-public-key",
          "pub_test_oRPBRklN6tpD4bJoRrkkd3X5l7kwzpF3"
        );
        script.setAttribute("data-currency", "COP");
        script.setAttribute("data-amount-in-cents", priceCOPCents.toString());
        script.setAttribute("data-reference", reference);
        script.setAttribute("data-signature:integrity", signature);
        script.setAttribute(
          "data-customer-data:price_usd",
          selectedPlan.priceUSD.toString()
        );
        script.setAttribute(
          "data-customer-data:exchange_rate",
          usdToCopRate.toString()
        );
        script.setAttribute("data-finish-text", "Pago completado");
        script.setAttribute("data-complete", "true");

        container?.appendChild(script);
      }
    };

    updateWompiButton();
  }, [selectedPlan, usdToCopRate]);

  return (
    <div className="container">
      <figure className="logo">
        <img src={chatea} alt="" />
      </figure>
      <div className="card">
        <h2>Selecciona un Plan</h2>
        <select
          onChange={(e) =>
            setSelectedPlan(plans.find((p) => p.id === Number(e.target.value)))
          }
        >
          <option value="">Seleccionar plan</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} - ${plan.priceUSD} USD
            </option>
          ))}
        </select>

        {selectedPlan && (
          <div className="price-info">
            <p>Precio en USD: ${selectedPlan.priceUSD}</p>
            <p>
              Precio en COP: $
              {(
                convertUSDtoCOPCents(selectedPlan.priceUSD) / 100
              ).toLocaleString("es-CO")}
            </p>
          </div>
        )}

        <div id="wompi-button-container"></div>
      </div>
    </div>
  );
};

export default WompiPayment;
