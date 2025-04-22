import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const StaffNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
   // navigate("/login");
    window.location.href = "/"; // Force logout to redirect to Home
  };

  return (
    <Navbar bg="secondary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">Kings Staff</Navbar.Brand>
        <Navbar.Toggle aria-controls="staff-navbar-nav" />
        <Navbar.Collapse id="staff-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/staff">Home</Nav.Link>
            <Nav.Link href="/staff/tasks">My Tasks</Nav.Link>
            <Nav.Link href="/staff/maintenance">Maintenance</Nav.Link>
            <Nav.Link href="/staff/assessments">Assessments</Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            <Button variant="outline-light" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default StaffNavbar;
