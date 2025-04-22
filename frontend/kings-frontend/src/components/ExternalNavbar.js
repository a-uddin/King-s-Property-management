import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ExternalNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    // navigate("/login");
    window.location.href = "/"; // Force logout to redirect to Home
  };

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand>🏢 Kings Portal - External</Navbar.Brand>
        <Navbar.Toggle aria-controls="external-navbar" />
        <Navbar.Collapse id="external-navbar">
          <Nav className="me-auto">
            <Nav.Link href="/external">Home</Nav.Link>
            <Nav.Link href="/external/tasks">Assigned Tasks</Nav.Link>
            <Nav.Link href="/external/maintenance">Maintenance</Nav.Link>
            <Nav.Link href="/external/invoice">Submit Invoice</Nav.Link>
          </Nav>
          <Nav>
            <Button variant="outline-danger" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default ExternalNavbar;
