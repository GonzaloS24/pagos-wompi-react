// Función para obtener el color del badge según el estado
export const getStatusBadgeVariant = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return { bg: "#d4edda", color: "#28a745", border: "#28a745" };
    case "pending":
      return { bg: "#fff3cd", color: "#ffc107", border: "#ffc107" };
    case "failed":
      return { bg: "#f8d7da", color: "#dc3545", border: "#dc3545" };
    case "canceled":
      return { bg: "#e2e3e5", color: "#6c757d", border: "#6c757d" };
    default:
      return { bg: "#e2e3e5", color: "#6c757d", border: "#6c757d" };
  }
};

export const getStatusText = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "Activo";
    case "pending":
      return "Pendiente";
    case "failed":
      return "Fallido";
    case "canceled":
      return "Cancelado";
    default:
      return status || "Desconocido";
  }
};