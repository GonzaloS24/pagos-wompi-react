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

  useEffect(() => {
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then((res) => res.json())
      .then((data) => setUsdToCopRate(data.rates.COP))
      .catch((error) =>
        console.error("Error al obtener tasa de cambio:", error)
      );

    const Plans = [
      { id: "business", name: "Chatea Pro Start", priceUSD: 49 },
      { id: "business_lite", name: "Chatea Pro Advanced", priceUSD: 109 },
      { id: "custom_plan3", name: "Chatea Pro Plus", priceUSD: 189 },
      { id: "business_large", name: "Chatea Pro Master", priceUSD: 389 },
    ];
    setPlans(Plans);
  }, []);

  useEffect(() => {
    const updateWompiButton = async () => {
      const container = document.getElementById("wompi-button-container");
      if (container) {
        container.innerHTML = "";
      }

      if (selectedPlan && usdToCopRate) {
        const priceCOPCents = convertUSDtoCOPCents(selectedPlan.priceUSD);
        const workspaceId = "107593";
        const reference = `plan_id=${
          selectedPlan.id
        }-workspace_id=${workspaceId}-reference${Date.now()}`;

        const signature = await generateIntegritySignature(
          reference,
          priceCOPCents,
          "COP"
        );

        // console.log(`Precio en USD: $${selectedPlan.priceUSD}`);
        // console.log(`Precio en COP centavos: ${priceCOPCents}`);
        // console.log(`Firma generada: ${signature}`);

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
            setSelectedPlan(plans.find((p) => p.id === e.target.value))
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
