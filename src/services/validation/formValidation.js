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
  if (!formData.document_type || formData.document_type.trim() === "") {
    errors.document_type = "Requerido";
  }

  // Validación del número de documento
  if (!formData.document_number || !formData.document_number.trim()) {
    errors.document_number = "El número de documento es requerido";
  } else if (formData.document_type) {
    // Solo validar formato si ya se seleccionó un tipo
    const numericTypes = ["CC", "TI", "CE", "NIT", "RC"];

    if (numericTypes.includes(formData.document_type)) {
      if (!/^\d{6,15}$/.test(formData.document_number)) {
        errors.document_number = "Debe contener entre 6 y 15 dígitos";
      }
    } else {
      // Para PA, DIE, PPT permitir alfanumérico
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
