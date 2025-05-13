// src/components/AdminNavbar.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import { FaUser, FaSignOutAlt, FaMoon } from "react-icons/fa";
import "./AdminNavbar.css"; // custom styles here

const AdminNavbar = ({ logout }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const firstInitial = user?.firstName?.[0]?.toUpperCase() || "?";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // navigate("/");
    window.location.href = "/"; // Force logout to redirect to Home
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="sticky-top">
      <Container>
      <Navbar.Brand as={Link} to="/admin" className="brand-font">King's Admin</Navbar.Brand>
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="me-auto">
          <Nav.Link as={Link} to="/admin/pending-approval">Pending Approval</Nav.Link>

            <Nav.Link as={Link} to="/admin/all-members">
              All Members
            </Nav.Link>

            <Nav.Link as={Link} to="/admin/assets">
              Show Asset
            </Nav.Link>

            <Nav.Link as={Link} to="/maintenance/ongoing">Ongoing Maintenance</Nav.Link>
            <Nav.Link as={Link} to="/admin/upcoming-maintenance">
              Upcoming Maintenance
            </Nav.Link>
            {/*    <Nav.Link as={Link} to="/admin/all-maintenance">
              Maintenance History
            </Nav.Link>*/}
            <Nav.Link as={Link} to="/assign-task">Assigned Task</Nav.Link>
            <Nav.Link as={Link} to="/assessments">
              All Assessments
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/invoices">
              All Invoices
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
                <Dropdown.Item as={Link} to="/admin/profile" className="dropdown-item-custom">
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

export default AdminNavbar;
