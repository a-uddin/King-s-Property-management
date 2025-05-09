// changed the name to staffMaintanence form MyTask, basically the file name.

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Table, Alert, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Button } from "react-bootstrap";
import InvoiceSubmitModal from "../components/InvoiceSubmitModal";
import InvoiceHistoryModal from "../components/InvoiceHistoryModal";

import { AuthContext } from "../context/AuthContext";
import StaffNavbar from "../components/StaffNavbar";
import AdminNavbar from "../components/AdminNavbar";
import ExternalNavbar from "../components/ExternalNavbar";
import "./CommonTextDesign.css";
import Footer from "../components/Footer";

const MyTask = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [invoiceMap, setInvoiceMap] = useState({});
  const [showSubmit, setShowSubmit] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [userInvoices, setUserInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchInvoicesForUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/invoices/user/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setUserInvoices(res.data); // ✅ save invoices directly for modal
      } catch (err) {
        console.error("Failed to fetch user invoices:", err);
      }
    };

    fetchTasks(); // Still needed
    fetchInvoicesForUser(); // Replaces old fetchData()
  }, []);

  const fetchUserInvoices = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/invoices`);

      const invoices = res.data;

      // Filter invoices submitted by current user
      const myInvoices = invoices.filter((inv) => inv.submittedBy === user._id);
      setUserInvoices(myInvoices);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  };

  const openSubmitModal = (taskId) => {
    setActiveTaskId(taskId);
    setShowSubmit(true);
  };

  const openHistoryModal = (taskId) => {
    setActiveTaskId(taskId);
    setShowHistory(true);
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/assigned-tasks`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });


      // 🔥 1. Filter tasks assigned to the logged-in user
      const assignedToMe = res.data.filter(
        (t) => t.assignedTo?._id === user._id
      );

      // 🔥 2. Filter only tasks assigned for maintenance
      const maintenanceTasks = assignedToMe.filter(
        (t) => t.assignedFor === "Maintenance"
      );

      // 🔥 3. Fetch all ongoing maintenances
      const ongoingRes = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/ongoing-maintenance`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );


      const ongoingData = ongoingRes.data;

      // 🔥 4. Merge estimatedCompletion date into tasks
      const merged = maintenanceTasks.map((task) => {
        const match = ongoingData.find(
          (o) =>
            o.assetName === task.assetName &&
            o.assetType === task.assetType &&
            o.location === task.location &&
            o.assignedTo?._id === task.assignedTo._id &&
            o.task === task.note
        );

        return {
          ...task,
          estimatedCompletion: match?.estimatedCompletion || "",
        };
      });

      setTasks(merged);
    } catch (err) {
      console.error("Error fetching tasks:", err.message);
      setError("❌ Failed to load tasks.");
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to change the status to "${newStatus}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d6efd",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, update it!",
      customClass: {
        popup: "shadow rounded",
      },
    });

    if (confirm.isConfirmed) {
      try {
        setUpdatingId(taskId);
        await axios.patch(
          `${process.env.REACT_APP_API_BASE_URL}/assigned-tasks/update-status/${taskId}`,
          { taskStatus: newStatus },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const updated = tasks.map((t) =>
          t._id === taskId ? { ...t, taskStatus: newStatus } : t
        );
        setTasks(updated);

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Task status has been updated.",
          position: "top",
          toast: true,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Could not update status.",
          position: "top",
          toast: true,
          timer: 2000,
          showConfirmButton: false,
        });
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const updateEstCompletion = async (assignedTaskId, newDate) => {
    const confirm = await Swal.fire({
      title: "Confirm Date Change",
      text: `Set estimated completion date to ${newDate}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d6efd",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, update",
      customClass: {
        popup: "shadow rounded",
      },
    });

    if (!confirm.isConfirmed) return;

    try {
      // Step 1: get the real ongoingMaintenance ID
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/ongoing-maintenance/by-assigned-task/${assignedTaskId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );


      const ongoingId = res.data._id;

      // Step 2: PATCH the estimatedCompletion
      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/ongoing-maintenance/${ongoingId}`,
        { estimatedCompletion: newDate },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );


      // ✅ Update local task state immediately so the new date is reflected in UI
      setTasks((prev) =>
        prev.map((t) =>
          t._id === assignedTaskId ? { ...t, estimatedCompletion: newDate } : t
        )
      );

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Est. Complete date saved.",
        position: "top",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not update date.",
        position: "top",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
      console.error("Update error:", err);
    }
  };

  return (
    <>
      {/* 👇 Conditional Navbar */}
      {user.role === "staff" ? <StaffNavbar /> : <ExternalNavbar />}

      <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1">
          <div className="container-fluid px-4 mt-4 staffMaintenance-font-style">
            <div className="shadow rounded p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">🛠️ Maintenance Tasks</h3>
                <Button
                  variant="primary"
                  className="px-4 py-2 rounded"
                  onClick={() => setShowHistoryModal(true)}
                >
                  📜 View Invoices
                </Button>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              {tasks.length === 0 ? (
                <p>No tasks assigned.</p>
              ) : (
                <div className="table-responsive">
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="🔍 Search by asset name, type or location"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ maxWidth: "400px" }}
                  />

                  <Table
                    className="table table-bordered table-hover  w-100"
                    style={{ fontSize: "16px" }}
                  >
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Asset Name</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Note</th>
                        <th>Status</th>
                        <th>Est. Complete</th>
                        <th>Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks
                        .filter(
                          (task) =>
                            task.assetName
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            task.assetType
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            task.location
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase())
                        )
                        .map((task, index) => (
                          <tr key={task._id}>
                            <td>{index + 1}</td>
                            <td>{task.assetName}</td>
                            <td>{task.assetType}</td>
                            <td>{task.location}</td>
                            <td
                              className="text-truncate"
                              style={{ maxWidth: "250px" }}
                            >
                              {task.note}
                            </td>
                            <td>
                              <div
                                className="d-flex align-items-center"
                                style={{ gap: "0.5rem" }}
                              >
                                <span
                                  className={`badge rounded-pill ${
                                    task.taskStatus === "Pending"
                                      ? "bg-warning text-dark"
                                      : task.taskStatus === "Ongoing"
                                      ? "bg-primary"
                                      : task.taskStatus === "Paused"
                                      ? "bg-info"
                                      : task.taskStatus === "Review"
                                      ? "bg-secondary"
                                      : "bg-success"
                                  }`}
                                  style={{
                                    minWidth: "75px",
                                    textAlign: "center",
                                  }}
                                >
                                  {task.taskStatus}
                                </span>

                                <Form.Select
                                  size="sm"
                                  style={{
                                    width: "110px",
                                    padding: "0.25rem 0.5rem",
                                    fontSize: "0.875rem",
                                  }}
                                  value={task.taskStatus}
                                  onChange={(e) =>
                                    updateStatus(task._id, e.target.value)
                                  }
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Ongoing">Ongoing</option>
                                  <option value="Paused">Paused</option>
                                  <option value="Review">Review</option>
                                  <option value="Completed">Completed</option>
                                </Form.Select>
                              </div>
                            </td>
                            <td>
                              <input
                                type="date"
                                className="form-control form-control-sm"
                                value={
                                  task.estimatedCompletion?.substring(0, 10) ||
                                  ""
                                }
                                onChange={(e) =>
                                  updateEstCompletion(task._id, e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => {
                                    setActiveTaskId(task._id);
                                    setShowSubmit(true);
                                  }}
                                >
                                  📤 Submit
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          <InvoiceSubmitModal
            show={showSubmit}
            onHide={() => setShowSubmit(false)}
            taskId={activeTaskId}
            onSuccess={() => {
              setShowSubmit(false);
              fetchTasks(); // to refresh invoiceMap
            }}
          />

          <InvoiceHistoryModal
            show={showHistoryModal}
            onHide={() => setShowHistoryModal(false)}
            invoices={userInvoices}
          />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default MyTask;
