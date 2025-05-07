import React, { useState, useContext, useEffect } from "react";
import { Button, Container, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Signup from "./Signup";
import Login from "./Login";
import "./Home.css";

const Home = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // ✅ get current user after login

  // ✅ Redirect after login based on role
  useEffect(() => {
    if (user && user.role) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "staff") navigate("/staff");
      else if (user.role === "external_company") navigate("/external");
    }
  }, [user, navigate]);

  return (
    <div className="home-background home-font-style">
      <Container className="d-flex flex-column justify-content-center align-items-center min-vh-100">
        <div className="glass-box text-center p-4">
          <h1 className="mb-3 text-dark">Welcome to Kings Property Portal 🏢</h1>
          <p className="mb-4 lead text-dark">
            Manage your properties, assets, maintenance, and teams — all in one platform.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button variant="primary" onClick={() => setShowLogin(true)}>
              Login
            </Button>
            <Button variant="success" onClick={() => setShowSignup(true)}>
              Sign Up
            </Button>
          </div>
        </div>
      </Container>

      {/* 🔐 Login Modal */}
      <Login show={showLogin} handleClose={() => setShowLogin(false)} />

      {/* ✍️ Signup Modal */}
      <Modal show={showSignup} onHide={() => setShowSignup(false)} centered className="signup-modal-in-home-font">
        <Modal.Header closeButton>
          <Modal.Title>Create Your Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Signup onSuccess={() => setShowSignup(false)} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Home;
