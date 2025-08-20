import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { getNationalIdentityNumberTypes } from "../../../../services/referralApi/documentTypes";

const WalletStepFour = ({
  // walletData,
  cedula,
  telefono,
  tipoDocumento,
  onCedulaChange,
  onTelefonoChange,
  onTipoDocumentoChange,
  errors,
}) => {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(true);

  // Cargar tipos de documento al montar el componente
  useEffect(() => {
    const loadDocumentTypes = async () => {
      try {
        const types = await getNationalIdentityNumberTypes();
        setDocumentTypes(types);
      } catch (error) {
        console.error("Error loading document types:", error);
      } finally {
        setLoadingDocumentTypes(false);
      }
    };

    loadDocumentTypes();
  }, []);

  // Determinar si se debe validar solo números
  const shouldValidateNumericOnly = (documentType) => {
    // Para CC, TI, CE, NIT, RC validar solo números
    const numericTypes = ["CC", "TI", "CE", "NIT", "RC"];
    return numericTypes.includes(documentType);
  };

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
            Documento de Identidad *
          </label>
          <div className="row g-2">
            <div className="col-4">
              <select
                className={`form-select ${
                  errors.tipoDocumento ? "is-invalid" : ""
                }`}
                value={tipoDocumento}
                onChange={(e) => onTipoDocumentoChange(e.target.value)}
                style={{
                  borderRadius: "6px",
                  padding: "0.75rem",
                  fontSize: "1rem",
                  border: "1px solid rgba(0, 158, 227, 0.3)",
                  background: "#fff",
                }}
                disabled={loadingDocumentTypes}
              >
                {loadingDocumentTypes ? (
                  <option value="">Cargando...</option>
                ) : (
                  <>
                    <option value="">Seleccionar</option>
                    {documentTypes.map((type) => (
                      <option key={type.name} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {errors.tipoDocumento && (
                <div className="invalid-feedback" style={{ display: "block" }}>
                  {errors.tipoDocumento}
                </div>
              )}
            </div>
            <div className="col-8">
              <input
                type="text"
                className={`form-control ${errors.cedula ? "is-invalid" : ""}`}
                value={cedula}
                onChange={(e) => {
                  const value = e.target.value;
                  // Validar según el tipo de documento
                  if (shouldValidateNumericOnly(tipoDocumento)) {
                    onCedulaChange(value.replace(/\D/g, ""));
                  } else {
                    onCedulaChange(value);
                  }
                }}
                placeholder="Número de documento"
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
          </div>
          {tipoDocumento && !loadingDocumentTypes && (
            <small className="text-muted">
              {
                documentTypes.find((type) => type.name === tipoDocumento)
                  ?.description
              }
            </small>
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
  tipoDocumento: PropTypes.string.isRequired,
  onCedulaChange: PropTypes.func.isRequired,
  onTelefonoChange: PropTypes.func.isRequired,
  onTipoDocumentoChange: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
};

export default WalletStepFour;
