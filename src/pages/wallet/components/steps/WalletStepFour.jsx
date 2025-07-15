import PropTypes from "prop-types";

const WalletStepFour = ({
  // walletData,
  cedula,
  telefono,
  onCedulaChange,
  onTelefonoChange,
  errors,
}) => {
  return (
    <div>
      <h5 className="text-center mb-4" style={{ color: "#009ee3" }}>
        Paso 2: Información Personal
      </h5>

      <div
        style={{
          background: "#edf4ff",
          border: "1px solid rgba(0, 158, 227, 0.2)",
          borderRadius: "8px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <h6 style={{ color: "#009ee3", marginBottom: "1rem" }}>
          Datos para el pago
        </h6>

        <div className="mb-3">
          <label
            className="form-label"
            style={{ fontWeight: "500", color: "#4a5568" }}
          >
            Cédula de Ciudadanía *
          </label>
          <input
            type="text"
            className={`form-control ${errors.cedula ? "is-invalid" : ""}`}
            value={cedula}
            onChange={(e) => onCedulaChange(e.target.value.replace(/\D/g, ""))}
            placeholder="Número de cédula"
            style={{
              borderRadius: "6px",
              padding: "0.75rem",
              fontSize: "1rem",
              border: "1px solid rgba(0, 158, 227, 0.3)",
            }}
          />
          {errors.cedula && (
            <div className="invalid-feedback" style={{ display: "block" }}>
              {errors.cedula}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label
            className="form-label"
            style={{ fontWeight: "500", color: "#4a5568" }}
          >
            Número de Teléfono *
          </label>
          <input
            type="tel"
            className={`form-control ${errors.telefono ? "is-invalid" : ""}`}
            value={telefono}
            onChange={(e) => onTelefonoChange(e.target.value)}
            placeholder="Ej: +57 300 123 4567"
            style={{
              borderRadius: "6px",
              padding: "0.75rem",
              fontSize: "1rem",
              border: "1px solid rgba(0, 158, 227, 0.3)",
            }}
          />
          {errors.telefono && (
            <div className="invalid-feedback" style={{ display: "block" }}>
              {errors.telefono}
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <p className="text-muted">
          Completa estos datos para continuar con tu pago.
        </p>
      </div>
    </div>
  );
};

WalletStepFour.propTypes = {
  walletData: PropTypes.object.isRequired,
  cedula: PropTypes.string.isRequired,
  telefono: PropTypes.string.isRequired,
  onCedulaChange: PropTypes.func.isRequired,
  onTelefonoChange: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
};

export default WalletStepFour;
