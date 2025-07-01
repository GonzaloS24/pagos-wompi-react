/* eslint-disable react/prop-types */
import { useRef, memo } from "react";
import Complements from "../../../components/products/Complements";

const ComplementsSection = memo(
  ({
    subscription,
    selectedComplements,
    onComplementsChange,
    onToggleCurrentComplement,
    workspaceId,
  }) => {
    const complementsRef = useRef(null);

    if (!subscription) return null;

    const handleNewComplementsChange = (newComplementsFromComponent) => {
      // Solo manejar los complementos nuevos del componente Complements
      if (onComplementsChange) {
        onComplementsChange(newComplementsFromComponent || []);
      }
    };

    const handleToggleComplement = (complement) => {
      if (onToggleCurrentComplement) {
        const isCurrentlySelected = selectedComplements.some(
          (selComp) =>
            selComp.id === complement.id &&
            (complement.selectedBot
              ? selComp.selectedBot?.flow_ns === complement.selectedBot?.flow_ns
              : true)
        );
        onToggleCurrentComplement(complement, isCurrentlySelected);
      }
    };

    return (
      <div className="current-complements-section">
        <h5 className="mb-4" style={{ color: "#009ee3" }}>
          Complementos actuales
        </h5>

        {/* Mostrar complementos actuales de la suscripción */}
        {subscription.complements && subscription.complements.length > 0 && (
          <div className="current-complements-info mb-3">
            {subscription.complements.map((complement, index) => {
              const isStillSelected = selectedComplements.some(
                (selComp) =>
                  selComp.id === complement.id &&
                  (complement.selectedBot
                    ? selComp.selectedBot?.flow_ns ===
                      complement.selectedBot?.flow_ns
                    : true)
              );

              return (
                <div
                  key={`current-${complement.id}-${index}`}
                  className="current-complement-item"
                  style={{
                    background: isStillSelected ? "#edf4ff" : "#ffecec",
                    border: `1px solid ${
                      isStillSelected
                        ? "rgba(0, 158, 227, 0.2)"
                        : "rgba(255, 0, 0, 0.2)"
                    }`,
                    borderRadius: "8px",
                    padding: "0.75rem",
                    marginBottom: "0.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    opacity: isStillSelected ? 1 : 0.7,
                  }}
                >
                  <div>
                    <span className="fw-medium">{complement.name}</span>
                    {complement.selectedBot && (
                      <small className="d-block text-muted">
                        Bot: {complement.selectedBot.name}
                      </small>
                    )}
                    <small className="d-block text-muted">
                      Cantidad: {complement.quantity} | ${complement.totalPrice}{" "}
                      USD
                    </small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {/* {isStillSelected ? (
                    <span className="current-badge">Se mantiene</span>
                  ) : (
                    <span className="badge" style={{ backgroundColor: "#dc3545", color: "white" }}>
                      Se eliminará
                    </span>
                  )} */}
                    <button
                      className="btn btn-sm"
                      style={{
                        backgroundColor: isStillSelected
                          ? "#dc3545"
                          : "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.25rem 0.5rem",
                      }}
                      onClick={() => handleToggleComplement(complement)}
                    >
                      {isStillSelected ? "Eliminar" : "Mantener"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Separador visual */}
        {subscription.complements && subscription.complements.length > 0 && (
          <hr
            style={{
              margin: "1.5rem 0",
              borderColor: "rgba(0, 158, 227, 0.2)",
            }}
          />
        )}

        {/* Componente para agregar nuevos complementos */}
        <div className="complements-management">
          <Complements
            ref={complementsRef}
            onComplementsChange={handleNewComplementsChange}
            workspaceId={workspaceId}
          />
        </div>

        {/* Mostrar complementos que se van a agregar */}
        {selectedComplements.length > 0 && (
          <div className="new-complements-info mt-3">
            {selectedComplements.map((complement, index) => {
              const isNew = !subscription.complements.some(
                (currentComp) =>
                  currentComp.id === complement.id &&
                  (complement.selectedBot
                    ? currentComp.selectedBot?.flow_ns ===
                      complement.selectedBot?.flow_ns
                    : true)
              );

              if (!isNew) return null;

              return (
                <div
                  key={`new-${complement.id}-${index}`}
                  className="new-complement-item"
                  style={{
                    background: "#d4edda",
                    border: "1px solid rgba(40, 167, 69, 0.2)",
                    borderRadius: "8px",
                    padding: "0.75rem",
                    marginBottom: "0.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span className="fw-medium">{complement.name}</span>
                    {complement.selectedBot && (
                      <small className="d-block text-muted">
                        Bot: {complement.selectedBot.name}
                      </small>
                    )}
                    <small className="d-block text-muted">
                      Cantidad: {complement.quantity} | ${complement.totalPrice}{" "}
                      USD
                    </small>
                  </div>
                  <span
                    className="badge"
                    style={{ backgroundColor: "#28a745", color: "white" }}
                  >
                    Nuevo
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

ComplementsSection.displayName = "ComplementsSection";

export default ComplementsSection;
