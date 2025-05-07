import React from "react";
import { Navbar, Container } from "react-bootstrap";

const MinimalNavbar = () => {
  return (
    <Navbar
      expand="lg"
      variant="dark"
      style={{
        background: "linear-gradient(90deg, #2c3e50, #4b6cb7)",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Container className="justify-content-center">
        <Navbar.Brand
          className="fw-semibold text-white"
          style={{ fontSize: "1.7rem", letterSpacing: "1px" }}
        >
          King's Portal
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default MinimalNavbar;
