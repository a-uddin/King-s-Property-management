// This Modal handles AllMembers.js in Email Column when 'send' button is clicked 
// and This Modal opens 

import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";

const EmailModal = ({ show, handleClose, userEmail }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      await axios.post("/api/email/send", {
        to: userEmail,
        subject,
        message,
      });
      setAlert({ type: "success", text: "✅ Email sent successfully!" });
      setTimeout(() => {
        handleClose();
        setAlert(null);
        setSubject("");
        setMessage("");
      }, 1500);
    } catch (err) {
      console.error("Error sending email:", err);
      setAlert({ type: "danger", text: "❌ Failed to send email" });
    }
    setLoading(false);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>📤 Send Email</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {alert && <Alert variant={alert.type}>{alert.text}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>To:</Form.Label>
            <Form.Control type="email" value={userEmail} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Subject:</Form.Label>
            <Form.Control
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject line"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Message:</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              required
            />
          </Form.Group>
          <div className="text-end">
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={loading || !subject || !message}
            >
              {loading ? "Sending..." : "Send"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EmailModal;
