import { Container, Row, Col } from "react-bootstrap";
import MetricsCards from "./components/MetricsCards";
import NewSubscriptionsChart from "./charts/NewSubscriptionsChart";
import PlansDistributionChart from "./charts/PlansDistributionChart";
import "./styles/subscriptionsMetrics.css";

const SubscriptionsMetrics = () => {
  return (
    <Container className="mt-5 subscriptions-metrics">
      <h3 className="mb-4 text-muted">Métricas Generales</h3>

      {/* Cards de métricas */}
      <MetricsCards />

      {/* Gráficos */}
      <div className="charts-section">
        <Row>
          <Col lg={8}>
            <NewSubscriptionsChart />
          </Col>
          <Col lg={4}>
            <PlansDistributionChart />
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default SubscriptionsMetrics;
