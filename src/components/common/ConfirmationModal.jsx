/* eslint-disable react/prop-types */
import { Modal, Button, Form } from "react-bootstrap";

const ConfirmationModal = ({
  show,
  formData,
  formErrors,
  onSubmit,
  onFormChange,
}) => {
  const handleInputChange = (field, value) => {
    onFormChange(field, value);
  };

  return (
    <Modal show={show} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>Confirmar Información</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>ID del Espacio de trabajo *</Form.Label>
            <Form.Control
              type="number"
              value={formData.workspace_id}
              onChange={(e) =>
                handleInputChange("workspace_id", e.target.value)
              }
              isInvalid={!!formErrors.workspace_id}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.workspace_id}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nombre del Espacio de trabajo *</Form.Label>
            <Form.Control
              type="text"
              value={formData.workspace_name}
              onChange={(e) =>
                handleInputChange("workspace_name", e.target.value)
              }
              isInvalid={!!formErrors.workspace_name}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.workspace_name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nombre del Dueño *</Form.Label>
            <Form.Control
              type="text"
              value={formData.owner_name}
              onChange={(e) => handleInputChange("owner_name", e.target.value)}
              isInvalid={!!formErrors.owner_name}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.owner_name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email del Dueño *</Form.Label>
            <Form.Control
              type="email"
              value={formData.owner_email}
              onChange={(e) => handleInputChange("owner_email", e.target.value)}
              isInvalid={!!formErrors.owner_email}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.owner_email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>WhatsApp Personal *</Form.Label>
            <Form.Control
              type="tel"
              value={formData.phone_number}
              onChange={(e) =>
                handleInputChange("phone_number", e.target.value)
              }
              isInvalid={!!formErrors.phone_number}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.phone_number}
            </Form.Control.Feedback>
          </Form.Group>

          <p className="text-muted small mb-3">* Campos obligatorios</p>

          <Button variant="primary" type="submit" className="w-100">
            Confirmar Información
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmationModal;
