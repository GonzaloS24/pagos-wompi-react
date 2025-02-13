/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";

const PaymentButton = ({ amount, reference, webhookUrl }) => {
  const [signature, setSignature] = useState("");

  const INTEGRITY_SECRET = "test_integrity_RMUwn1SSLmR31OFgXOdgJcV2VkcaaDVL";
  const PUBLIC_KEY = "pub_test_oRPBRklN6tpD4bJoRrkkd3X5l7kwzpF3";

  useEffect(() => {
    const generateIntegritySignature = async () => {
      const message = `${reference}${amount * 100}COP${INTEGRITY_SECRET}`;
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      setSignature(hashHex);
    };

    generateIntegritySignature();
  }, [amount, reference]);

  useEffect(() => {
    if (signature) {
      const script = document.createElement("script");
      script.src = "https://checkout.wompi.co/widget.js";
      script.setAttribute("data-render", "button");
      script.setAttribute("data-public-key", PUBLIC_KEY);
      script.setAttribute("data-currency", "COP");
      script.setAttribute("data-amount-in-cents", (amount * 100).toString());
      script.setAttribute("data-reference", reference);
      script.setAttribute("data-signature:integrity", signature);
      script.setAttribute("data-finish-text", "Pago completado");
      script.setAttribute("data-complete", "true");

      document.body.appendChild(script);
    }
  }, [signature]);

  const handleTransaction = async (transactionId) => {
    try {
      const response = await axios.get(
        `https://sandbox.wompi.co/v1/transactions/${transactionId}`
      );
      await axios.post(webhookUrl, response.data.data);
      console.log("Datos enviados al webhook");
    } catch (error) {
      console.error("Error procesando la transacción:", error);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get("id");
    if (transactionId) {
      handleTransaction(transactionId);
    }
  }, []);

  return <div id="wompi-widget"></div>;
};

export default PaymentButton;
