/* This modal is handling column named 'Action' in 'Assigned Task' page where a user can click 
  assign/edit button and Then this Modal is open
*/

import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const AssignEditModal = ({
  show,
  onHide,
  task,
  users,
  selectedUserId,
  setSelectedUserId,
  note,
  setNote,
  assignedFor,
  setAssignedFor,
  onSave,
}) => {
  const [selectedUserRole, setSelectedUserRole] = useState("");

  useEffect(() => {
    const selected = users.find((u) => u._id === selectedUserId);
    if (selected) {
      setSelectedUserRole(selected.role);
    }
  }, [selectedUserId, users]);

  if (!task) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Assign / Edit Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Assign To:</Form.Label>
            <Form.Control
              as="select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.role})
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Note:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter a note for the assignee (optional)"
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Assigned For:</Form.Label>
            <Form.Select
              value={assignedFor}
              onChange={(e) => setAssignedFor(e.target.value)}
            >
              <option value="Maintenance">Maintenance</option>
              {selectedUserRole !== "external_company" && (
                <option value="Assessment">Assessment</option>
              )}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            const valuesToSave = {
              assignedTo: selectedUserId,
              note,
              assignedFor,
            };

            Swal.fire({
              title: "Are you sure?",
              text: "Do you want to save this task assignment?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, save it!",
            }).then((result) => {
              if (result.isConfirmed) {
                onSave(valuesToSave);
                Swal.fire("Saved!", "The task has been updated.", "success");
              }
            });
          }}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignEditModal;
