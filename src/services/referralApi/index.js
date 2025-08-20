import axios from "axios";

const REFERRAL_API_URL =
  "https://apireferidos-service-26551171030.us-east1.run.app/api";

const referralApiInstance = axios.create({
  baseURL: REFERRAL_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor para manejo de respuestas y errores
referralApiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error in referral API:", error);
    return Promise.reject(error);
  }
);

export default referralApiInstance;
