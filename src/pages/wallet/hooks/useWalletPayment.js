/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback } from "react";
import { walletService } from "../../../services/payments/wallet/walletService";
import Swal from "sweetalert2";

export const useWalletPayment = (paymentData, onHide) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");

  const [errors, setErrors] = useState({});
  const totalSteps = 4;

  const walletData = walletService.createWalletPaymentData(paymentData);

  // Función para validar los campos
  const validatePersonalData = () => {
    const newErrors = {};

    // Validar tipo de documento
    if (!tipoDocumento || tipoDocumento.trim() === "") {
      newErrors.tipoDocumento = "Requerido";
    }

    // Validar cédula
    if (!cedula.trim()) {
      newErrors.cedula = "El número de documento es requerido";
    } else if (tipoDocumento) {
      // Solo validar formato si ya se seleccionó un tipo
      const numericTypes = ["CC", "TI", "CE", "NIT", "RC"];

      if (numericTypes.includes(tipoDocumento)) {
        if (!/^\d{6,15}$/.test(cedula)) {
          newErrors.cedula = "Debe contener entre 6 y 15 dígitos";
        }
      } else {
        // Para PA, DIE, PPT permitir alfanumérico
        if (cedula.length < 3 || cedula.length > 20) {
          newErrors.cedula = "Debe contener entre 3 y 20 caracteres";
        }
      }
    }

    // Validar teléfono
    if (!telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio";
    } else if (!/^\+?\d{10,15}$/.test(telefono.replace(/\s/g, ""))) {
      newErrors.telefono = "Formato de teléfono inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmPayment = async () => {
    try {
      // Agregar los datos personales al walletData
      const walletDataWithPersonalInfo = {
        ...walletData,
        customerPersonalInfo: {
          cedula,
          telefono,
          tipoDocumento,
        },
      };

      const result = await walletService.processWalletPayment(
        walletDataWithPersonalInfo
      );

      if (result.success) {
        onHide();
        await Swal.fire({
          icon: "info",
          title: "Pago en Verificación",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#009ee3",
        });
      }
    } catch (error) {
      console.error("Error processing wallet payment:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al procesar tu solicitud. Por favor intenta nuevamente.",
        confirmButtonColor: "#009ee3",
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: "success",
        title: "Copiado",
        text: "Dirección copiada al portapapeles",
        timer: 1500,
        showConfirmButton: false,
      });
    });
  };

  const copyPurchaseSummary = (summary) => {
    navigator.clipboard.writeText(summary).then(() => {
      Swal.fire({
        icon: "success",
        title: "Resumen Copiado",
        text: "Resumen de compra copiado al portapapeles",
        timer: 1500,
        showConfirmButton: false,
      });
    });
  };

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      // Si estamos en el paso 2 (datos personales), validar antes de continuar
      if (prev === 2) {
        if (!validatePersonalData()) {
          return prev;
        }
      }

      return prev < totalSteps ? prev + 1 : prev;
    });
  }, [totalSteps, cedula, telefono, tipoDocumento]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const resetSteps = useCallback(() => {
    setCurrentStep(1);
    setCedula("");
    setTelefono("");
    setTipoDocumento("");
    setErrors({});
  }, []);

  // Funciones para manejar cambios en los inputs
  const handleCedulaChange = useCallback(
    (value) => {
      setCedula(value);
      if (errors.cedula) {
        setErrors((prev) => ({ ...prev, cedula: "" }));
      }
    },
    [errors.cedula]
  );

  const handleTelefonoChange = useCallback(
    (value) => {
      setTelefono(value);
      if (errors.telefono) {
        setErrors((prev) => ({ ...prev, telefono: "" }));
      }
    },
    [errors.telefono]
  );

  const handleDocumentChange = useCallback(
    (value) => {
      setTipoDocumento(value);
      // Limpiar el número cuando cambie el tipo
      setCedula("");
      if (errors.tipoDocumento) {
        setErrors((prev) => ({ ...prev, tipoDocumento: "" }));
      }
      if (errors.cedula) {
        setErrors((prev) => ({ ...prev, cedula: "" }));
      }
    },
    [errors.tipoDocumento, errors.cedula]
  );

  return {
    currentStep,
    totalSteps,
    walletData,
    cedula,
    telefono,
    tipoDocumento,
    errors,
    handleCedulaChange,
    handleTelefonoChange,
    handleDocumentChange,
    handleConfirmPayment,
    copyToClipboard,
    copyPurchaseSummary,
    nextStep,
    prevStep,
    resetSteps,
  };
};
