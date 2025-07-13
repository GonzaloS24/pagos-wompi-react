/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { getSubscriptionByWorkspace } from "../services/newApi/subscriptions";
import Swal from "sweetalert2";

export const useSubscriptionPolling = (
  workspaceId,
  isEnabled = false,
  originalUrlParams = null
) => {
  const [isPolling, setIsPolling] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);
  const intervalRef = useRef(null);

  const buildRedirectUrl = () => {
    let params = new URLSearchParams();

    if (originalUrlParams) {
      // Usar parámetros pasados desde RecurringPaymentPage
      [
        "workspace_id",
        "workspace_name",
        "owner_name",
        "owner_email",
        "phone_number",
        "plan_id",
        "period",
      ].forEach((key) => {
        if (originalUrlParams[key]) {
          params.set(key, originalUrlParams[key]);
        }
      });
    } else {
      // Fallback: extraer de URL actual
      const currentUrl = new URL(window.location.href);
      const currentParams = new URLSearchParams(currentUrl.search);

      [
        "workspace_id",
        "workspace_name",
        "owner_name",
        "owner_email",
        "phone_number",
        "plan_id",
        "period",
      ].forEach((key) => {
        if (currentParams.has(key)) {
          params.set(key, currentParams.get(key));
        }
      });
    }

    const paramString = params.toString();
    return paramString ? `/?${paramString}` : "/";
  };

  const startPolling = () => {
    if (!workspaceId || isPolling) return;

    console.log("🔄 Iniciando polling para suscripción:", workspaceId);
    setIsPolling(true);
    setPollingCount(0);

    const checkSubscription = async () => {
      try {
        setPollingCount((prev) => prev + 1);
        console.log(
          `🔍 Consultando suscripción... intento ${pollingCount + 1}`
        );

        const subscription = await getSubscriptionByWorkspace(workspaceId);

        if (subscription && subscription.status === "ACTIVE") {
          console.log("✅ Suscripción activa encontrada");
          stopPolling();

          await Swal.fire({
            icon: "success",
            title: "¡Suscripción Creada Exitosamente!",
            text:
              subscription.message ||
              "Tu suscripción ha sido activada correctamente.",
            confirmButtonText: "Continuar",
            confirmButtonColor: "#009ee3",
            allowOutsideClick: false,
            allowEscapeKey: false,
          });

          window.location.href = buildRedirectUrl();
          return;
        }

        if (subscription && subscription.status !== "PENDING") {
          console.log("❌ Suscripción falló:", subscription.status);
          stopPolling();

          await Swal.fire({
            icon: "error",
            title: "Error en la Suscripción",
            text: "Hubo un problema al procesar tu suscripción. Por favor, intenta nuevamente.",
            confirmButtonText: "Reintentar",
            confirmButtonColor: "#009ee3",
          });

          window.location.href = buildRedirectUrl();
          return;
        }

        // Si lleva más de 2 minutos (24 intentos), detener polling
        if (pollingCount >= 24) {
          console.log("⏱️ Timeout del polling");
          stopPolling();

          await Swal.fire({
            icon: "warning",
            title: "Procesamiento en Curso",
            html: `
              <div style="text-align: center;">
                <p>Tu suscripción está siendo procesada.</p>
                <br>
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                  <p style="color: #856404; margin: 0;">⏳ Esto puede tomar unos minutos adicionales.</p>
                  <p style="color: #856404; margin: 10px 0 0 0;">📧 Recibirás un email confirmando el estado.</p>
                </div>
              </div>
            `,
            confirmButtonText: "Entendido",
            confirmButtonColor: "#009ee3",
          });

          window.location.href = buildRedirectUrl();
        }
      } catch (error) {
        console.error("Error en polling:", error);

        if (pollingCount >= 5) {
          // Después de 5 errores, detener
          stopPolling();

          await Swal.fire({
            icon: "error",
            title: "Error de Conexión",
            text: "No se pudo verificar el estado de tu suscripción. Por favor, contacta soporte.",
            confirmButtonColor: "#009ee3",
          });

          window.location.href = buildRedirectUrl();
        }
      }
    };

    // Ejecutar inmediatamente y luego cada 5 segundos
    checkSubscription();
    intervalRef.current = setInterval(checkSubscription, 5000);
  };

  const stopPolling = () => {
    console.log("⏹️ Deteniendo polling");
    setIsPolling(false);
    setPollingCount(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Limpiar interval al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Auto-start polling si está habilitado
  useEffect(() => {
    if (isEnabled && workspaceId && !isPolling) {
      startPolling();
    }
  }, [isEnabled, workspaceId]);

  return {
    isPolling,
    pollingCount,
    startPolling,
    stopPolling,
  };
};
