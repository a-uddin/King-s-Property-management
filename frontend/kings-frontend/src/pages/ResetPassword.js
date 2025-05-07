import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Form, Button, Container, Card, Alert, InputGroup } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import "./CommonTextDesign.css";
import MinimalNavbar from "../components/MinimalNavbar";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/users/reset-password`,
        {
          token,
          password,
        }
      );

      setMessage(response.data.message);
    } catch (error) {
      console.error("Reset error:", error);
      setMessage(error.response?.data?.message || "Something went wrong.");
    }
  };

  useEffect(() => {
    if (message === "Password reset successful") {
      const timer = setTimeout(() => {
        navigate("/"); // Redirect to home/login after 5 sec
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message, navigate]);

  return (
    <>
    <MinimalNavbar />
    <Container className="mt-0 d-flex justify-content-center restePassword-font-style">
      <Card style={{ width: "28rem", padding: "2rem" }}>
        <h4 className="mb-4 text-center">🔐 Reset Your Password</h4>

        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant={message.includes("successful") ? "success" : "danger"}>
          {message.includes("successful") 
            ? <>
                {message} <br />
                <small>You can now <a href="/">login</a>.</small>
              </>
            : message}
        </Alert>}

        {!message.includes("successful") && (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlash /> : <Eye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Confirm Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeSlash /> : <Eye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100">
              Reset Password
            </Button>
          </Form>
        )}
      </Card>
    </Container>
    </>
  );
};

export default ResetPassword;
