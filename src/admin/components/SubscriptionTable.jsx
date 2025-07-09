/* eslint-disable react/prop-types */
import user from "../../assets/user.png";
import { BsGear } from "react-icons/bs";
import { getStatusBadgeVariant, getStatusText } from "../utils/statusUtils";

const SubscriptionTable = ({ data, onViewDetails }) => {
  return (
    <div className="table-responsive">
      <table className="table align-middle mb-4 bg-white">
        <thead className="bg-light">
          <tr>
            <th style={{ width: "35%" }}>Email</th>
            <th style={{ width: "15%" }}>Workspace</th>
            <th style={{ width: "15%" }}>Plan</th>
            <th style={{ width: "15%" }}>Estado</th>
            <th style={{ width: "15%" }}>Próximo Cobro</th>
            <th style={{ width: "5%", textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((userData, index) => {
            const statusStyle = getStatusBadgeVariant(userData.status);
            return (
              <tr key={`${userData.workspace_id}-${index}`}>
                <td style={{ width: "35%" }}>
                  <div className="d-flex align-items-center">
                    <img
                      src={user}
                      alt=""
                      style={{
                        width: "40px",
                        height: "40px",
                        minWidth: "40px",
                      }}
                      className="rounded-circle me-3"
                    />
                    <div style={{ minWidth: "0" }}>
                      <p className="mb-0 text-truncate">{userData.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ width: "15%" }}>{userData.workspace_id}</td>
                <td style={{ width: "15%" }}>{userData.plan_id}</td>
                <td style={{ width: "15%" }}>
                  <span
                    style={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.border}`,
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    {getStatusText(userData.status)}
                  </span>
                </td>
                <td style={{ width: "15%" }}>
                  <small>
                    {new Date(userData.next_billing_at).toLocaleDateString(
                      "es-CO",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }
                    )}
                  </small>
                </td>
                <td style={{ width: "5%", textAlign: "center" }}>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => onViewDetails(userData)}
                    title="Gestionar suscripción"
                  >
                    <BsGear style={{ fontSize: "16px" }} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SubscriptionTable;
