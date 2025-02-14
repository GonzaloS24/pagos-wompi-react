import { useState, useEffect } from "react";
import "./WompiPayment.css";
import chatea from "../../assets/chatea.png";
import Swal from "sweetalert2";

const CONFIG = {
  WOMPI_PUBLIC_KEY: "pub_prod_mUzoGd0TQzkIWZwMamDL3ADjEYCO93N7",
  INTEGRITY_SECRET: "prod_integrity_KZkk9BdR7yGH9jDspvfhWud8IdUBnMQw",
  EXCHANGE_RATE_API: "https://api.exchangerate-api.com/v4/latest/USD",
  DEFAULT_WORKSPACE_ID: null,
};

const WompiPayment = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [usdToCopRate, setUsdToCopRate] = useState();
  const [urlParams, setUrlParams] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para sanitizar strings
  const sanitizeString = (str) => {
    if (!str) return "";
    return str.replace(/[<>]/g, "");
  };

  // Función para generar hash SHA-256
  const generateIntegritySignature = async (
    reference,
    amountInCents,
    currency
  ) => {
    try {
      const message = `${reference}${amountInCents}${currency}${CONFIG.INTEGRITY_SECRET}`;
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (error) {
      console.error("Error generando firma:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al generar la firma de seguridad",
      });
      return null;
    }
  };

  const convertUSDtoCOPCents = (usdAmount) => {
    if (!usdAmount || !usdToCopRate) return 0;
    return Math.round(usdAmount * usdToCopRate * 100);
  };

  // Función para extraer y validar parámetros de la URL
  const extractUrlParams = () => {
    try {
      // Decodificar la URL completa primero
      const decodedUrl = decodeURIComponent(
        window.location.search.replace(/&amp;/g, "&")
      );
      const params = new URLSearchParams(decodedUrl);

      const urlData = {
        workspace_id: sanitizeString(params.get("workspace_id")),
        workspace_name: sanitizeString(params.get("workspace_name")),
        owner_name: sanitizeString(params.get("owner_name")),
        owner_email: sanitizeString(params.get("owner_email")),
        plan_id: sanitizeString(params.get("plan_id")),
      };

      if (
        Object.values(urlData).some((value) => value !== null && value !== "")
      ) {
        setUrlParams(urlData);

        // Validar plan_id si existe
        if (urlData.plan_id && plans.length > 0) {
          const validPlan = plans.find((p) => p.id === urlData.plan_id);
          if (!validPlan) {
            Swal.fire({
              icon: "error",
              title: "Plan Inválido",
              text: "El plan especificado no es válido",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error al procesar los parámetros de la URL:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al procesar los parámetros de la URL",
      });
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // Cargar tasa de cambio
        const response = await fetch(CONFIG.EXCHANGE_RATE_API);
        if (!response.ok) throw new Error("Error al obtener tasa de cambio");
        const data = await response.json();
        setUsdToCopRate(data.rates.COP);

        // Definir planes
        const Plans = [
          {
            id: "business",
            name: "Chatea Pro Start",
            priceUSD: 49,
          },
          {
            id: "business_lite",
            name: "Chatea Pro Advanced",
            priceUSD: 109,
          },
          {
            id: "custom_plan3",
            name: "Chatea Pro Plus",
            priceUSD: 189,
          },
          {
            id: "business_large",
            name: "Chatea Pro Master",
            priceUSD: 389,
          },
        ];
        setPlans(Plans);
      } catch (error) {
        console.error("Error en la inicialización:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al cargar los datos necesarios",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (plans.length > 0) {
      extractUrlParams();
    }
  }, [plans]);

  useEffect(() => {
    if (urlParams?.plan_id && plans.length > 0) {
      const planFromUrl = plans.find((p) => p.id === urlParams.plan_id);
      if (planFromUrl) {
        setSelectedPlan(planFromUrl);
      }
    }
  }, [urlParams, plans]);

  useEffect(() => {
    const updateWompiButton = async () => {
      const container = document.getElementById("wompi-button-container");
      if (!container || !selectedPlan || !usdToCopRate) return;

      container.innerHTML = "";

      try {
        const priceCOPCents = convertUSDtoCOPCents(selectedPlan.priceUSD);
        const workspaceId =
          urlParams?.workspace_id || CONFIG.DEFAULT_WORKSPACE_ID;
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
        // console.log("318  >>>>>>>>> ", reference);

        if (!signature) return;

        const script = document.createElement("script");
        script.src = "https://checkout.wompi.co/widget.js";
        script.setAttribute("data-render", "button");
        script.setAttribute("data-public-key", CONFIG.WOMPI_PUBLIC_KEY);
        script.setAttribute("data-currency", "COP");
        script.setAttribute("data-amount-in-cents", priceCOPCents.toString());
        script.setAttribute("data-reference", reference);
        script.setAttribute("data-signature:integrity", signature);
        script.setAttribute("data-finish-text", "Pago completado");
        script.setAttribute("data-complete", "true");
        script.setAttribute(
          "data-redirect-url",
          "https://transaction-redirect.wompi.co/check"
        );

        // Callbacks de Wompi
        window.handleWompiResponse = (response) => {
          if (response.success) {
            Swal.fire({
              icon: "success",
              title: "¡Pago Exitoso!",
              text: "El pago se ha procesado correctamente",
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Error en el Pago",
              text: "Hubo un problema al procesar el pago",
            });
          }
        };

        container.appendChild(script);
      } catch (error) {
        console.error("Error al actualizar botón de Wompi:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al preparar el botón de pago",
        });
      }
    };

    updateWompiButton();
  }, [selectedPlan, usdToCopRate]);

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p className="loading-text">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <figure className="logo">
        <img src={chatea} alt="Chatea Logo" />
      </figure>
      <div className="card">
        <h2>Selecciona un Plan</h2>

        {urlParams && (
          <div className="url-info">
            {urlParams.workspace_id && (
              <p>ID del espacio: {urlParams.workspace_id}</p>
            )}
            {urlParams.workspace_name && (
              <p>Espacio de trabajo: {urlParams.workspace_name}</p>
            )}
            {urlParams.owner_name && (
              <p>
                Propietario: {urlParams.owner_name} ({urlParams.owner_email})
              </p>
            )}
          </div>
        )}

        <br />

        <select
          onChange={(e) => {
            const plan = plans.find((p) => p.id === e.target.value);
            setSelectedPlan(plan);
          }}
          value={selectedPlan?.id || ""}
          disabled={Boolean(urlParams?.plan_id)}
        >
          <option value="">Seleccionar plan</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} - ${plan.priceUSD} USD
            </option>
          ))}
        </select>

        {selectedPlan && (
          <div className="plan-details">
            <div className="price-info">
              <p>Precio en USD: ${selectedPlan.priceUSD}</p>
              <p>
                Precio en COP: $
                {(
                  convertUSDtoCOPCents(selectedPlan.priceUSD) / 100
                ).toLocaleString("es-CO")}
              </p>
            </div>

            <div id="wompi-button-container"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WompiPayment;
