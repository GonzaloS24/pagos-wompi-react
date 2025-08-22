/* eslint-disable react/prop-types */
import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { getNationalIdentityNumberTypes } from "../../services/referralApi/documentTypes";

const ConfirmationModal = ({
  show,
  formData,
  formErrors,
  onSubmit,
  onFormChange,
  urlParams,
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

  const handleInputChange = (field, value) => {
    onFormChange(field, value);
  };

  // Función helper para verificar si un campo viene de la URL
  const isFieldFromURL = (fieldName) => {
    return (
      urlParams && urlParams[fieldName] && urlParams[fieldName].trim() !== ""
    );
  };

  // Determinar si se debe validar solo números
  const shouldValidateNumericOnly = (documentType) => {
    // Para CC, TI, CE, NIT, RC validar solo números
    const numericTypes = ["CC", "TI", "CE", "NIT", "RC"];
    return numericTypes.includes(documentType);
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
              disabled={isFieldFromURL("workspace_id")}
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
              disabled={isFieldFromURL("workspace_name")}
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
              disabled={isFieldFromURL("owner_name")}
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
              disabled={isFieldFromURL("owner_email")}
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
              disabled={isFieldFromURL("phone_number")}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.phone_number}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Documento de Identidad *</Form.Label>
            <div className="row g-2">
              <div className="col-4">
                <Form.Select
                  className="p-2"
                  value={formData.document_type}
                  onChange={(e) =>
                    handleInputChange("document_type", e.target.value)
                  }
                  isInvalid={!!formErrors.document_type}
                  disabled={
                    loadingDocumentTypes || isFieldFromURL("document_type")
                  }
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
                </Form.Select>
                {formErrors.document_type && (
                  <div
                    className="invalid-feedback"
                    style={{ display: "block" }}
                  >
                    {formErrors.document_type}
                  </div>
                )}
              </div>
              <div className="col-8">
                <Form.Control
                  className="p-2"
                  type="text"
                  value={formData.document_number}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Validar según el tipo de documento
                    if (shouldValidateNumericOnly(formData.document_type)) {
                      handleInputChange(
                        "document_number",
                        value.replace(/\D/g, "")
                      );
                    } else {
                      handleInputChange("document_number", value);
                    }
                  }}
                  placeholder="Número de documento"
                  isInvalid={!!formErrors.document_number}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.document_number}
                </Form.Control.Feedback>
              </div>
            </div>
            {formData.document_type && !loadingDocumentTypes && (
              <Form.Text className="text-muted">
                {
                  documentTypes.find(
                    (type) => type.name === formData.document_type
                  )?.description
                }
              </Form.Text>
            )}
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Confirmar Información
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmationModal;
