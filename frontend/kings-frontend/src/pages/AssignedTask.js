import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import AssignEditModal from "../components/AssignEditModal";
import AdminNavbar from "../components/AdminNavbar";
import { AuthContext } from "../context/AuthContext";
import "./CommonTextDesign.css";
import Footer from "../components/Footer";

const AssignedTask = () => {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [note, setNote] = useState("");
  const [assignedFor, setAssignedFor] = useState("Maintenance");
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/assigned-tasks`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // ⬇️ Initialize statusEditable: true ONLY if task is Pending
      const tasksWithEditableFlag = response.data.map((task) => ({
        ...task,
        statusEditable: task.taskStatus === "Pending" ? true : false,
      }));

      setTasks(tasksWithEditableFlag);
    } catch (error) {
      console.error("Error fetching assigned tasks:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const search = searchQuery.toLowerCase();

    const assetName = task?.assetName || "";
    const assetType = task?.assetType || "";
    const assetLocation = task?.location || "";
    const assignedName = task?.assignedTo
      ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
      : "Unassigned";

    return (
      assetName.toLowerCase().includes(search) ||
      assetType.toLowerCase().includes(search) ||
      assetLocation.toLowerCase().includes(search) ||
      assignedName.toLowerCase().includes(search)
    );
  });

  const handleOpenAssignModal = (task) => {
    setSelectedTask(task);
    setSelectedUserId(task.assignedTo?._id || ""); // If already assigned
    setNote(task.note || ""); // If there is already a note
    setShowAssignModal(true);
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedTask(null);
    setSelectedUserId("");
    setNote("");
  };

  const handleSave = async () => {
    if (!selectedUserId || !selectedTask) {
      alert("Please select a user and a task.");
      return;
    }

    const payload = {
      assetName: selectedTask.assetName,
      assetType: selectedTask.assetType,
      location: selectedTask.location,
      assignedTo: selectedUserId,
      note: note,
      scheduledMaintenance: selectedTask.scheduledMaintenance,
      taskStatus: selectedTask.taskStatus || "Pending",
      assignedFor: assignedFor,
    };

    try {
      // 🔵 If assigned task has an _id, try updating first
      if (selectedTask._id) {
        await axios.patch(
          `${process.env.REACT_APP_API_BASE_URL}/assigned-tasks/${selectedTask._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        //alert("Task updated successfully!");
      } else {
        // ⚪ Otherwise, create a new assigned task
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/assigned-tasks`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        
        alert("Task assigned successfully!");
      }
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Failed to save task. Please try again.");
    }

    fetchTasks(); // refresh tasks table
    handleCloseAssignModal(); // close the modal
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const confirm = await Swal.fire({
      title: "Confirm Status Change",
      text: `Are you sure you want to change the status to "${newStatus}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d6efd",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, update it",
      customClass: {
        popup: "shadow rounded",
      },
    });

    if (confirm.isConfirmed) {
      try {
        await axios.patch(
          `${process.env.REACT_APP_API_BASE_URL}/assigned-tasks/update-status/${taskId}`,
          { taskStatus: newStatus },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // ✅ Update UI locally
        setTasks((prev) =>
          prev.map((task) =>
            task._id === taskId
              ? { ...task, taskStatus: newStatus, statusEditable: false }
              : task
          )
        );

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Task status has been updated.",
          position: "top",
          toast: true,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error updating status:", error);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Status update failed.",
          position: "top",
          toast: true,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }
  };

  const makeEditable = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, statusEditable: true } : task
      )
    );
  };

  return (
    <>
      <AdminNavbar />
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1 p-4 Ongoing-font-design">
          <div className="container mt-4 AssignedTask-font-design">
            <h2>📋 Assigned Tasks</h2>
            <div className="mb-3">
              <input
                type="text"
                placeholder="🔍 Search asset or assignee..."
                className="form-control px-3 py-2 border border-gray-300 rounded-md mb-4 w-full text-base shadow-sm"
                value={searchQuery}
                style={{ width: "500px", maxWidth: "100%" }}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead className="thead-dark">
                  <tr>
                    <th>#</th>
                    <th>Asset Name</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Assigned To</th>
                    <th>Assigned For</th>
                    <th>Note</th>
                    <th>Action</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task, index) => {
                      return (
                        <tr key={task._id}>
                          <td>{index + 1}</td>
                          <td>{task.assetName || "No Name"}</td>
                          <td>{task.assetType || "No Type"}</td>
                          <td>{task.location || "No Location"}</td>
                          <td>
                            {task.assignedTo
                              ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                              : "Unassigned"}
                          </td>
                          <td>{task.assignedFor || "Maintenance"}</td>

                          <td>{task.note || "--"}</td>
                          <td
                            style={{
                              verticalAlign: "middle",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <button
                              className="btn btn-outline-primary btn-sm px-2 py-1"
                              style={{ fontSize: "0.85rem" }}
                              onClick={() => handleOpenAssignModal(task)}
                            >
                              Assign / Edit
                            </button>
                          </td>

                          <td>
                            {task.statusEditable ? (
                              <select
                                className="form-select form-select-sm"
                                value={task.taskStatus}
                                onChange={(e) =>
                                  handleStatusChange(task._id, e.target.value)
                                }
                              >
                                <option value="Pending">Pending</option>
                                <option value="Ongoing">Ongoing</option>
                                <option value="Paused">Paused</option>
                                <option value="Review">Review</option>
                                <option value="Completed">Completed</option>
                              </select>
                            ) : (
                              <div className="d-flex align-items-center">
                                <span
                                  className={`badge me-2 ${
                                    task.taskStatus === "Pending"
                                      ? "bg-warning"
                                      : task.taskStatus === "Ongoing"
                                      ? "bg-primary"
                                      : task.taskStatus === "Paused"
                                      ? "bg-info"
                                      : task.taskStatus === "Review"
                                      ? "bg-secondary"
                                      : task.taskStatus === "Completed"
                                      ? "bg-success"
                                      : "bg-dark"
                                  }`}
                                >
                                  {task.taskStatus}
                                </span>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => makeEditable(task._id)}
                                  title="Edit Status"
                                >
                                  🖉
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No tasks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <AssignEditModal
                show={showAssignModal}
                onHide={handleCloseAssignModal}
                task={selectedTask}
                users={users}
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                assignedFor={assignedFor}
                setAssignedFor={setAssignedFor}
                note={note}
                setNote={setNote}
                onSave={handleSave}
              />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default AssignedTask;
