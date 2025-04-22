import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";

const RejectUserModal = ({ show, onClose, user, onRejectSuccess }) => {
  const [message, setMessage] = useState("");
  const [rejectMessage, setrejectMessage] = useState(" ");

  const handleReject = async () => {
    try {
      await axios.patch(
        `/api/users/${user._id || user.id}/reject`,
        {
          message: rejectMessage,
          
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      
      onRejectSuccess(user._id);
      onClose();
    } catch (err) {
      console.error("❌ Rejection error:", err);
      alert("Rejection failed. Please check the server.");
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Reject User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Rejecting <strong>{user?.firstName}</strong>. Optionally provide a
          reason:
        </p>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="Write a short rejection reason..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleReject}>
          Reject
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RejectUserModal;
