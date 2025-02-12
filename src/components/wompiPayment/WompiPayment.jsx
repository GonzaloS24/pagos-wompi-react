import { useState, useEffect } from "react";
import "./WompiPayment.css";

const WompiPayment = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [signature] = useState(
    "00da8abe56e21842d669a137492f73fd2c7967395edc9ef489d921fc4dab8454"
  );
  const [usdToCopRate, setUsdToCopRate] = useState();

  // Función para convertir USD a centavos de COP
  const convertUSDtoCOPCents = (usdAmount) => {
    return Math.round(usdAmount * usdToCopRate * 100);
  };

  useEffect(() => {
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then((res) => res.json())
      .then((data) => setUsdToCopRate(data.rates.COP));

    const Plans = [
      { id: 1, name: "Chatea Pro Start", priceUSD: 49 },
      { id: 2, name: "Chatea Pro Advanced", priceUSD: 109 },
      { id: 3, name: "Chatea Pro Plus", priceUSD: 189 },
      { id: 4, name: "Chatea Pro Master", priceUSD: 389 },
    ];
    setPlans(Plans);

    const handleWompiEvent = (event) => {
      console.log("Evento wompi-event detectado:", event);
    };

    const handleTransactionUpdate = (event) => {
      console.log("Evento transaction.updated detectado:", event);
      const data = event.detail;

      if (data.transaction) {
        console.log("Transacción aprobada:", data.transaction);

        const payload = {
          transactionId: data.transaction.id,
          status: data.transaction.status,
          amountInCents: data.transaction.amount_in_cents,
          currency: data.transaction.currency,
          reference: data.transaction.reference,
          amountUSD: selectedPlan?.priceUSD, // Guardamos también el precio en USD
        };

        console.log("Datos que se enviarán al webhook:", payload);

        fetch("https://webhook-test.com/d451f166c29793a584e4aea940392249", {
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
            console.error("Error al enviar el webhook:", error);
          });
      }
    };

    document.addEventListener("wompi-event", handleWompiEvent);
    document.addEventListener("transaction.updated", handleTransactionUpdate);

    return () => {
      document.removeEventListener("wompi-event", handleWompiEvent);
      document.removeEventListener(
        "transaction.updated",
        handleTransactionUpdate
      );
    };
  }, [selectedPlan]);

  useEffect(() => {
    const container = document.getElementById("wompi-button-container");
    if (container) {
      container.innerHTML = "";
    }

    if (selectedPlan) {
      const priceCOPCents = convertUSDtoCOPCents(selectedPlan.priceUSD);
      console.log(`Precio en USD: $${selectedPlan.priceUSD}`);
      console.log(`Precio en COP centavos: ${priceCOPCents}`);

      const script = document.createElement("script");
      script.src = "https://checkout.wompi.co/widget.js";
      script.setAttribute("data-render", "button");
      script.setAttribute(
        "data-public-key",
        "pub_test_oRPBRklN6tpD4bJoRrkkd3X5l7kwzpF3"
      );
      script.setAttribute("data-currency", "COP");
      script.setAttribute("data-amount-in-cents", priceCOPCents.toString());
      script.setAttribute(
        "data-reference",
        `PLAN-${selectedPlan.id}-${Date.now()}`
      );
      script.setAttribute("data-signature:integrity", signature);

      // Agregar información del precio en USD como metadata
      script.setAttribute(
        "data-customer-data:price_usd",
        selectedPlan.priceUSD.toString()
      );

      container?.appendChild(script);
    }
  }, [selectedPlan, signature, usdToCopRate]);

  return (
    <div className="container">
      <div className="card">
        <h2>Selecciona un Plan</h2>
        <select
          onChange={(e) =>
            setSelectedPlan(plans.find((p) => p.id === Number(e.target.value)))
          }
        >
          <option value="">-- Seleccionar --</option>
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
