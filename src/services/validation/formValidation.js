export const sanitizeString = (str) => {
  if (!str) return "";
  return str.replace(/[<>]/g, "");
};

export const validateForm = (formData) => {
  const errors = {};

  if (!formData.workspace_id.trim()) {
    errors.workspace_id = "El ID del espacio es requerido";
  } else if (!/^\d+$/.test(formData.workspace_id)) {
    errors.workspace_id = "El ID del espacio solo debe contener números";
  }

  if (!formData.workspace_name.trim())
    errors.workspace_name = "El nombre del espacio es requerido";

  if (!formData.owner_name.trim())
    errors.owner_name = "El nombre del dueño es requerido";

  if (
    !formData.owner_email.trim() ||
    !/\S+@\S+\.\S+/.test(formData.owner_email)
  ) {
    errors.owner_email = "Email inválido";
  }

  if (
    !formData.phone_number.trim() ||
    !/^\+?\d{5,15}$/.test(formData.phone_number)
  ) {
    errors.phone_number = "Número de teléfono inválido";
  }

  // Validación del tipo de documento
  if (!formData.document_type) {
    errors.document_type = "El tipo de documento es requerido";
  }

  // Validación del número de documento
  if (!formData.document_number.trim()) {
    errors.document_number = "El número de documento es requerido";
  } else {
    // Validar según el tipo de documento
    if (
      formData.document_type === "cedula" ||
      formData.document_type === "nit"
    ) {
      if (!/^\d{6,15}$/.test(formData.document_number)) {
        errors.document_number = "Debe contener entre 6 y 15 dígitos";
      }
    } else if (formData.document_type === "otro") {
      if (
        formData.document_number.length < 3 ||
        formData.document_number.length > 20
      ) {
        errors.document_number = "Debe contener entre 3 y 20 caracteres";
      }
    }
  }

  return errors;
};

export const validateWorkspaceId = (workspaceId) => {
  if (!workspaceId || !workspaceId.toString().trim()) {
    return "El ID del espacio es requerido";
  }

  if (!/^\d+$/.test(workspaceId.toString())) {
    return "El ID del espacio solo debe contener números";
  }

  return null;
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return "El email es requerido";
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return "Email inválido";
  }

  return null;
};

export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber || !phoneNumber.trim()) {
    return "El número de teléfono es requerido";
  }

  if (!/^\+?\d{5,15}$/.test(phoneNumber)) {
    return "Número de teléfono inválido";
  }

  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || !value.toString().trim()) {
    return `${fieldName} es requerido`;
  }
  return null;
};
