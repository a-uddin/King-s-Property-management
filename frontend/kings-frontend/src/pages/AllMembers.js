// src/pages/AllMembers.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import EmailModal from "../components/EmailModal";
import { Table, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import AdminNavbar from "../components/AdminNavbar";
import ViewUserModal from "../components/ViewUserModal";
import EditUserModal from "../components/EditUserModal";
import "./AllMembers.css";
import Footer from "../components/Footer";

const AllMembers = () => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/all-members/approved`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMembers(res.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleSendEmail = (email) => {
    setSelectedEmail(email);
    setShowModal(true);
  };

  const handleEmailSubmit = async ({ to, subject, message }) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/email/send`,
        { to, subject, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Email sent successfully!");
      setShowModal(false);
    } catch (error) {
      console.error("Error sending email:", error);
      alert("❌ Failed to send email.");
    }
  };

  const handleDelete = async (userId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/all-members/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });


      fetchMembers();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "User has been removed.",
        position: "top",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Delete failed", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not delete user.",
        position: "top",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setShowEditModal(true);
  };

  const handleSaveChanges = async (updatedUser) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/all-members/${updatedUser._id}`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ User updated successfully!");

      setShowEditModal(false);
      fetchMembers(); // Refresh list

    } catch (error) {
      console.error("Update failed:", error);
      alert("❌ Failed to update user");
    }
  };

  const filteredMembers = members.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const role = user.role.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      role.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <AdminNavbar />

      <div className="container mt-5 mb-5 font-styl">
        <h2>👥 All Members</h2>

        <div className="mb-3 mt-4 d-flex justify-content-end">
          <input
            type="text"
            className="form-control w-25"
            placeholder="🔍 Search by name or role"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Table striped bordered hover responsive className="mt-4 shadow-sm">
          <thead className="table-dark text-center">
            <tr>
              <th>#</th>
              <th>👤 Full Name</th>
              <th>📧 Email</th>
              <th>🔐 Role</th>
              <th>📌 Status</th>
              <th>✉️ Email</th>
              <th>✏️🗑️👁️ Actions</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td className="text-capitalize text-start">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="text-start">
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                  </td>
                  <td className="text-capitalize text-start">
                    <span className="badge bg-info text-dark">{user.role}</span>
                  </td>
                  <td className="text-start">
                    <span className="badge bg-success">Approved</span>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleSendEmail(user.email)}
                    >
                      📤 Send
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleViewUser(user)} // ✅ use full user object
                    >
                      👁️ View
                    </Button>

                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditUser(user)}
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(user._id)}
                    >
                      🗑️ Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No users found!!!!</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <EmailModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        userEmail={selectedEmail}
        onSubmit={handleEmailSubmit}
      />

      <ViewUserModal
        show={showViewModal}
        handleClose={() => setShowViewModal(false)}
        user={selectedUser}
      />

      <EditUserModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        user={editUser}
        onSave={handleSaveChanges}
      />
      <Footer />
    </>
  );
};

export default AllMembers;
