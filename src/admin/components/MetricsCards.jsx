import { Row, Col } from "react-bootstrap";
import MetricCard from "./MetricCard";

const MetricsCards = () => {
  // Datos simulados
  const metricsData = [
    {
      id: 1,
      title: "Métrica 1",
      value: 245,
      icon: "bx-trending-up",
    },
    {
      id: 2,
      title: "Métrica 1",
      value: 1532,
      icon: "bx-user-plus",
    },
    {
      id: 3,
      title: "Métrica 1",
      value: 98.7,
      icon: "bx-chart",
    },
  ];

  return (
    <Row className="mb-4 metrics-cards-row">
      {metricsData.map((metric) => (
        <Col md={4} key={metric.id} className="mb-3">
          <MetricCard
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
          />
        </Col>
      ))}
    </Row>
  );
};

export default MetricsCards;
