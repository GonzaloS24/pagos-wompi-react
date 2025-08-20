import { useState, useEffect } from "react";
import { getSubscriptions } from "../../services/subscriptionsApi/subscriptions";

export const useSubscriptions = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await getSubscriptions();
      if (response) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error al obtener suscripciones:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchSubscriptions,
  };
};
