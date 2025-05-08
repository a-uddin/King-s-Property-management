import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Dropdown from "react-bootstrap/Dropdown";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./StaffNavbar.css";


const StaffNavbar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const firstInitial = user?.firstName?.[0]?.toUpperCase() || "?";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // navigate("/login");
    window.location.href = "/"; // Force logout to redirect to Home
  };

  return (
    <Navbar bg="secondary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/" className="brand-font">
          King's Staff
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="staff-navbar-nav" />
        <Navbar.Collapse id="staff-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/staff">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/staff/maintenance">
              Maintenance
            </Nav.Link>
            <Nav.Link as={Link} to="/staff/assessments">
              Assessments
            </Nav.Link>
          </Nav>
          <Dropdown className="ms-3">
            <Dropdown.Toggle
              variant="primary"
              className="profile-toggle d-flex align-items-center gap-2 px-3 py-1 rounded-pill"
            >
              <div className="avatar-circle">{firstInitial}</div>
              <span className="fw-bold text-capitalize">{user?.firstName}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdown-fade">
              <Dropdown.Item as={Link} to="/staff/profile" className="dropdown-item-custom">
                <FaUser className="me-2 text-purple" />
                Profile
              </Dropdown.Item>

              <Dropdown.Item onClick={handleLogout} className="dropdown-item-custom text-danger">
                <FaSignOutAlt className="me-2" />
                Logout
              </Dropdown.Item>
              <Dropdown.Divider />
            </Dropdown.Menu>
          </Dropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default StaffNavbar;
