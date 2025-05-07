import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";
import "./InvoiceModal.css";

const InvoiceSubmitModal = ({ show, onHide, taskId, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [alert, setAlert] = useState(null);
  const [fileName, setFileName] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) 
      return setAlert({ type: "danger", message: "Please select a file." });
    if (!fileName.trim()) {
      return setAlert({ type: "danger", message: "Please enter a file name." });
    }
    

    try {
      const formData = new FormData();
      formData.append("invoice", file);
      formData.append("taskId", taskId);
      formData.append("fileName", fileName); 

      await axios.post("/api/invoices/upload", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setAlert({ type: "success", message: `"${fileName}" uploaded successfully!` });

      setTimeout(() => {
        setAlert(null);
        onSuccess();
      }, 1500);
    } catch (err) {
      setAlert({ type: "danger", message: "Upload failed. Try again." });
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered className="submitModal-font">
      <Modal.Header closeButton>
        <Modal.Title>📤 Submit Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {alert && <Alert variant={alert.type}>{alert.message}</Alert>}
        <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
  <Form.Label>Invoice File Name (Required)</Form.Label>
  <Form.Control
    type="text"
    value={fileName}
    onChange={(e) => setFileName(e.target.value)}
    placeholder="e.g. April Maintenance Invoice"
    required
  />
</Form.Group>

          <Form.Group>
            <Form.Label>Select Invoice File (PDF)</Form.Label>
            <Form.Control
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </Form.Group>
          <div className="text-end mt-3">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Upload
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default InvoiceSubmitModal;
