/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { fetchPlans } from "../services/api/plansApi";
import { fetchUSDtoCOPRate } from "../services/api/exchangeRateApi";
import { sanitizeString } from "../services/validation/formValidation";
import Swal from "sweetalert2";

export const useWompiPayment = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [usdToCopRate, setUsdToCopRate] = useState();
  const [urlParams, setUrlParams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(true);
  const [isDataConfirmed, setIsDataConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    workspace_id: "",
    workspace_name: "",
    owner_name: "",
    owner_email: "",
    phone_number: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const selectPlanFromId = (planId) => {
    if (!planId || !plans.length) return;
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
    } else {
      Swal.fire({
        icon: "error",
        title: "Plan Inválido",
        text: "El plan especificado no es válido",
      });
    }
  };

  const extractUrlParams = () => {
    try {
      const decodedUrl = decodeURIComponent(
        window.location.search.replace(/&amp;/g, "&")
      );
      const params = new URLSearchParams(decodedUrl);

      const urlData = {
        workspace_id: sanitizeString(params.get("workspace_id")),
        workspace_name: sanitizeString(params.get("workspace_name")),
        owner_name: sanitizeString(params.get("owner_name")),
        owner_email: sanitizeString(params.get("owner_email")),
        phone_number: sanitizeString(params.get("phone_number")),
        plan_id: sanitizeString(params.get("plan_id")),
      };

      if (urlData.plan_id && plans.length > 0) {
        selectPlanFromId(urlData.plan_id);
      }

      setFormData({
        workspace_id: urlData.workspace_id || "",
        workspace_name: urlData.workspace_name || "",
        owner_name: urlData.owner_name || "",
        owner_email: urlData.owner_email || "",
        phone_number: urlData.phone_number || "",
      });

      setUrlParams(urlData);
    } catch (error) {
      console.error("Error al procesar los parámetros de la URL:", error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // Obtener tasa de cambio y planes en paralelo
        const [exchangeRate, fetchedPlans] = await Promise.all([
          fetchUSDtoCOPRate(),
          fetchPlans(),
        ]);

        // Verificar que la tasa sea válida, si no, usar fallback
        const validRate =
          exchangeRate && exchangeRate > 100 ? exchangeRate : 4200;

        setUsdToCopRate(validRate);
        setPlans(fetchedPlans);

        // Buscar plan seleccionado desde los parámetros de la URL
        const params = new URLSearchParams(window.location.search);
        const planId = sanitizeString(params.get("plan_id"));
        if (planId) {
          const plan = fetchedPlans.find((p) => p.id === planId);
          if (plan) {
            setSelectedPlan(plan);
          }
        }
      } catch (error) {
        console.error("Error en la inicialización:", error);
        setUsdToCopRate(4200);

        try {
          const fetchedPlans = await fetchPlans();
          setPlans(fetchedPlans);
        } catch (planError) {
          console.error("Error cargando planes:", planError);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al cargar los datos necesarios",
          });
        }
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

  return {
    plans,
    selectedPlan,
    setSelectedPlan,
    usdToCopRate,
    urlParams,
    setUrlParams,
    loading,
    showModal,
    setShowModal,
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    isDataConfirmed,
    setIsDataConfirmed,
  };
};
