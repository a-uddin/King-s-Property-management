import React from "react";
import { Modal, Button, Table } from "react-bootstrap";

const ViewUserModal = ({ show, handleClose, user }) => {
  if (!user) return null;

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>👁️ View Member Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table borderless>
          <tbody>
            <tr>
              <td><strong>First Name:</strong></td>
              <td>{user.firstName}</td>
            </tr>
            <tr>
              <td><strong>Last Name:</strong></td>
              <td>{user.lastName}</td>
            </tr>
            <tr>
              <td><strong>Email:</strong></td>
              <td>{user.email}</td>
            </tr>
            <tr>
              <td><strong>Phone:</strong></td>
              <td>{user.phone || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Address:</strong></td>
              <td>{user.address || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Role:</strong></td>
              <td><span className="badge bg-info text-dark">{user.role}</span></td>
            </tr>
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          ❌ Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewUserModal;
