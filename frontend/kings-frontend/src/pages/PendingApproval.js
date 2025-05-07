import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Alert, Form } from "react-bootstrap";
import AdminNavbar from "../components/AdminNavbar";
import "./CommonTextDesign.css";
import Footer from "../components/Footer";

const PendingApproval = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [alert, setAlert] = useState(null);
  const [selectedRole, setSelectedRole] = useState({});

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/pending`
      );
      setPendingUsers(res.data);
    } catch (err) {
      console.error("Error fetching pending users:", err);
    }
  };

  const handleApprove = async (user) => {
    const role = selectedRole[user._id];
    if (!role) {
      setAlert({
        type: "danger",
        message: "❌ Please select a role before approving.",
      });
      return;
    }
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/approvals/${user._id}/approve`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setAlert({
        type: "success",
        message: `✅ ${user.firstName} approved and email sent.`,
      });
      setPendingUsers(pendingUsers.filter((u) => u._id !== user._id));
    } catch (err) {
      console.error("Approval error:", err);
      setAlert({
        type: "danger",
        message: "❌ Approval failed. Check server logs.",
      });
    }
  };

  const handleReject = async (user) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/approvals/${user._id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setAlert({
        type: "success",
        message: `❌ ${user.firstName} rejected and email sent.`,
      });
      setPendingUsers(pendingUsers.filter((u) => u._id !== user._id));
    } catch (err) {
      console.error("Rejection error:", err);
      setAlert({
        type: "danger",
        message: "❌ Rejection failed. Check server logs.",
      });
    }
  };

  return (
    <>
      <div className="d-flex flex-column min-vh-100">
        <AdminNavbar />
        <main className="flex-grow-1">
          <div className="container mt-4 approval-page-font-style">
            <h2>🚦 Pending Approvals</h2>

            {alert && (
              <Alert
                variant={alert.type}
                onClose={() => setAlert(null)}
                dismissible
              >
                {alert.message}
              </Alert>
            )}

            <Table striped bordered hover responsive className="mt-3">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No pending users.
                    </td>
                  </tr>
                ) : (
                  pendingUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        {user.firstName} {user.lastName}
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{user.address}</td>
                      <td>{user.companyName || "—"}</td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={selectedRole[user._id] || ""}
                          onChange={(e) =>
                            setSelectedRole({
                              ...selectedRole,
                              [user._id]: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Role</option>
                          <option value="admin">Admin</option>
                          <option value="staff">Staff</option>
                          <option value="external_company">
                            External Company
                          </option>
                        </Form.Select>
                      </td>
                      <td>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprove(user)}
                          className="me-2"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(user)}
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default PendingApproval;
