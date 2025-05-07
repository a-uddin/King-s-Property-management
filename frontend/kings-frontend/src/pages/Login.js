import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import "./Login.css";
import "./CommonTextDesign.css";

const Login = ({ show, handleClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/login`,
        { email, password }
      );

      login(response.data);
      setSuccess("✅ Login successful!");

      setTimeout(() => {
        handleClose();
        if (response.data.role === "admin") navigate("/admin");
        else if (response.data.role === "staff") navigate("/staff");
        else if (response.data.role === "external_company")
          navigate("/external");

        setSuccess("");
        setEmail("");
        setPassword("");
      }, 1000);
    } catch (err) {
      setError("❌ Invalid email or password");
    }
  };

  const handleForgotPassword = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/users/forgot-password`,
        { email: forgotEmail }
      );
      setEmailSent(true);
    } catch (error) {
      console.error("Reset error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="modern-modal login-font-style">
      <Modal.Header closeButton>
        <Modal.Title>🔐 Member Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <p
            onClick={() => setShowForgotModal(true)}
            style={{
              color: "blue",
              cursor: "pointer",
              fontSize: "0.9rem",
              marginTop: "8px",
            }}
          >
            Forgot Password?
          </p>

          <div className="d-flex justify-content-end">
            <Button type="submit" variant="primary">
              Login
            </Button>
          </div>
        </Form>
        <Modal
          show={showForgotModal}
          onHide={() => setShowForgotModal(false)}
          centered
          className="forgot-password-modal-font"
        >
          <Modal.Header closeButton>
            <Modal.Title>Reset Your Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {emailSent ? (
              <p className="text-success">
                ✅ If this email exists, a reset link has been sent.
              </p>
            ) : (
              <>
                <p>Enter your email and we'll send a password reset link.</p>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </>
            )}
          </Modal.Body>
          {!emailSent && (
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowForgotModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleForgotPassword}
                disabled={!forgotEmail}
              >
                Send Reset Link
              </Button>
            </Modal.Footer>
          )}
        </Modal>
      </Modal.Body>
    </Modal>
  );
};

export default Login;
