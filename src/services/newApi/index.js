import axios from "axios";

const API_URL =
  "https://subscriptions-service-26551171030.us-east1.run.app/api";

const JWT_TOKEN =
  "eyJuYW1lIjoiQ2hhdGVhUHJvIiwidXNlIjoic3Vic2N0aXB0aW9ucyIsInNjb3BlIjpbImNyZWF0ZSBzdWJzY3JpcHRpb25zIiwicmVhZCBzdWJzY3JpcHRpb24gZGF0YSIsInVwZGF0ZSBzdWJzY3JpcHRpb24gZGF0YSIsImRlbGV0ZSBzdWJzY3JpcHRpb24gZGF0YSJdLCJpYXQiOjE3NTA5NDU5ODIsImV4cCI6MzMyODgyNTk4Mn0"; // 👈 AQUÍ PONES TU TOKEN UNA SOLA VEZ

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Interceptor para agregar el token a las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Bearer ${JWT_TOKEN}`;
    // const token = localStorage.getItem("token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejo de respuestas y errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      console.error("Token expirado o inválido");
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
