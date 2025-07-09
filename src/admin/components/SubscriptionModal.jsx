/* eslint-disable react/prop-types */
import { Modal, Button, Card, Row, Col, Badge } from "react-bootstrap";
import { getStatusBadgeVariant, getStatusText } from "../utils/statusUtils";
import { getAssistantInfo, getComplementInfo } from "../utils/dataMappers";

const SubscriptionModal = ({ 
  show, 
  onHide, 
  selectedUser, 
  onCancelSubscription, 
  onReactivateSubscription 
}) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Gestión de Suscripción</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedUser && (
          <div>
            <Row className="mb-4">
              <Col md={6}>
                <Card className="h-100 bg-cards">
                  <Card.Body>
                    <Card.Title style={{ color: "#009ee3" }} className="h6">
                      Información General
                    </Card.Title>
                    <div className="mb-2">
                      <strong>Email:</strong> {selectedUser.email}
                    </div>
                    <div className="mb-2">
                      <strong>Workspace ID:</strong> {selectedUser.workspace_id}
                    </div>
                    <div className="mb-2">
                      <strong>Plan:</strong> {selectedUser.plan_id}
                    </div>
                    <div className="mb-2">
                      <strong>Estado:</strong>{" "}
                      <span
                        style={{
                          ...getStatusBadgeVariant(selectedUser.status),
                          backgroundColor: getStatusBadgeVariant(selectedUser.status).bg,
                          color: getStatusBadgeVariant(selectedUser.status).color,
                          border: `1px solid ${getStatusBadgeVariant(selectedUser.status).border}`,
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {getStatusText(selectedUser.status)}
                      </span>
                    </div>
                    <div>
                      <strong>Próximo Cobro:</strong>{" "}
                      {new Date(selectedUser.next_billing_at).toLocaleDateString("es-CO")}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="h-100 bg-cards">
                  <Card.Body>
                    <Card.Title style={{ color: "#009ee3" }} className="h6">
                      Asistentes
                    </Card.Title>
                    {selectedUser.subscription_assistants?.map((assistant, index) => {
                      const assistantInfo = getAssistantInfo(assistant.assistant_id);
                      return (
                        <div key={index} className=" rounded">
                          <div className="d-flex justify-content-between align-items-center">
                            <p>{assistantInfo.name}</p>
                            {assistant.is_free && (
                              <span
                                style={{
                                  backgroundColor: "#d4edda",
                                  color: "#28a745",
                                  border: "1px solid #28a745",
                                  padding: "5px 6px",
                                  borderRadius: "4px",
                                  fontSize: "10px",
                                  fontWeight: "500",
                                  marginBottom: "10px",
                                }}
                              >
                                Gratis
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {selectedUser.subscription_addons?.length > 0 && (
              <Row className="mb-4">
                <Col>
                  <Card className="bg-cards">
                    <Card.Body>
                      <Card.Title style={{ color: "#009ee3" }} className="h6">
                        Complementos
                      </Card.Title>
                      <Row>
                        {selectedUser.subscription_addons.map((addon, index) => {
                          const complementInfo = getComplementInfo(addon.addon_id);
                          return (
                            <Col md={4} key={index} className="mb-2">
                              <div className="p-2 border rounded bg-white">
                                <div className="d-flex justify-content-between align-items-center">
                                  <span>{complementInfo.name}</span>
                                  <Badge bg="primary">x{addon.quantity}</Badge>
                                </div>
                              </div>
                            </Col>
                          );
                        })}
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Acciones Administrativas */}
            <Card className="bg-cards">
              <Card.Body>
                <Card.Title style={{ color: "#009ee3" }} className="h6 text-muted">
                  Acciones Administrativas
                </Card.Title>
                <div className="d-flex gap-2">
                  <Button variant="outline-danger" size="sm" onClick={onCancelSubscription}>
                    Cancelar Suscripción
                  </Button>
                  <Button variant="outline-success" size="sm" onClick={onReactivateSubscription}>
                    Reactivar Suscripción
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={onHide} style={{ minWidth: "120px" }}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SubscriptionModal;