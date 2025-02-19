/* eslint-disable react/prop-types */
const ConfirmedInfo = ({ formData }) => {
  return (
    <div style={{ background: "#edf4ff" }} className="p-3 rounded mb-4">
      <div className="row g-2">
        <div className="col-sm-6">
          <div className="text-start">
            <small className="text-muted d-block">ID del espacio</small>
            <span className="fw-medium">{formData.workspace_id}</span>
          </div>
        </div>
        <div className="col-sm-6">
          <div className="text-start">
            <small className="text-muted d-block">Espacio de trabajo</small>
            <span className="fw-medium">{formData.workspace_name}</span>
          </div>
        </div>
        <div className="col-sm-6">
          <div className="text-start">
            <small className="text-muted d-block">Propietario</small>
            <span className="fw-medium">{formData.owner_name}</span>
          </div>
        </div>
        <div className="col-sm-6">
          <div className="text-start">
            <small className="text-muted d-block">Email</small>
            <span className="fw-medium">{formData.owner_email}</span>
          </div>
        </div>
        <div className="col-12">
          <div className="text-start">
            <small className="text-muted d-block">Teléfono</small>
            <span className="fw-medium">{formData.phone_number}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmedInfo;
