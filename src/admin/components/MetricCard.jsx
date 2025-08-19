/* eslint-disable react/prop-types */
import { Card } from "react-bootstrap";

const MetricCard = ({ title, value, icon }) => {
  return (
    <Card className="metric-card h-100">
      <Card.Body className="d-flex align-items-center">
        <div className="metric-icon">
          <i className={`bx ${icon}`}></i>
        </div>
        <div className="metric-content">
          <h6 className="metric-title">{title}</h6>
          <h3 className="metric-value">{value.toLocaleString()}</h3>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MetricCard;
