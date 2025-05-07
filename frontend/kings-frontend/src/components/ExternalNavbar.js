import React, { useContext } from "react";
import { Navbar, Nav, Container, Dropdown } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import "./StaffNavbar.css"; // ✅ reuse the same styles

const ExternalNavbar = () => {
  const { user } = useContext(AuthContext);
  const firstInitial = user?.firstName?.[0]?.toUpperCase() || "?";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <Navbar bg="secondary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/" className="brand-font">🏢 King's Portal - External</Navbar.Brand>
        <Navbar.Toggle aria-controls="external-navbar" />
        <Navbar.Collapse id="external-navbar">
          <Nav className="me-auto">
            {/* <Nav.Link href="/external">Home</Nav.Link> */}
            {/* <Nav.Link href="/external/tasks">Assigned Tasks</Nav.Link> */}
            <Nav.Link href="/external/maintenance">Maintenance Task</Nav.Link>
            {/* <Nav.Link href="/external/invoice">Submit Invoice</Nav.Link> */}
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
              <Dropdown.Item href="/external/profile" className="dropdown-item-custom">
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

export default ExternalNavbar;
