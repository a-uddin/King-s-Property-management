import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import "./OngoingMaintenance.css";
import Footer from "../components/Footer";

const statusColors = {
  Ongoing: "bg-blue-500",
  Paused: "bg-yellow-500",
  Review: "bg-purple-500",
  Completed: "bg-green-500",
  Canceled: "bg-red-500",
};

const priorityColors = {
  Low: "bg-green-200",
  Medium: "bg-yellow-300",
  High: "bg-red-400",
};

const OngoingMaintenance = () => {
  const [data, setData] = useState([]);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    const res = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/ongoing-maintenance`
    );
    setData(res.data);
  };

  const handleChange = async (id, field, value) => {
    const confirm = await Swal.fire({
      title: "Confirm Change",
      text: `Are you sure you want to change the ${field} to "${value}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d6efd",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, update it",
      customClass: {
        popup: "shadow rounded",
      },
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/ongoing-maintenance/${id}`,
        { [field]: value }
      );

      await Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `${field} updated successfully.`,
        position: "top",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });

      fetchData();
    } catch (err) {
      console.error("Failed to update:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Update failed.",
        position: "top",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter((item) => {
    const assignedName = item.assignedTo
      ? `${item.assignedTo.firstName} ${item.assignedTo.lastName}`.toLowerCase()
      : "";
    return (
      item.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignedName.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1 p-4 Ongoing-font-design">
          <div className="p-6 Ongoing-font-design">
            <h2 className="text-2xl font-bold mb-4">🛠️ Ongoing Maintenance</h2>
            <div className="overflow-x-auto">
              <input
                type="text"
                placeholder="🔍 Search asset, location or assignee..."
                value={searchTerm}
                style={{ width: "500px", maxWidth: "100%" }}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md mb-4 w-full text-base shadow-sm"
              />

              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Asset Name</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Assigned To</th>
                    <th>Task</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>Est. Complete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td className="text-nowrap">{item.assetName}</td>
                      <td>{item.assetType}</td>
                      <td>{item.location}</td>
                      <td className="text-nowrap">
                        {item.assignedTo ? (
                          <span
                            className="text-primary"
                            title={item.assignedTo.email}
                            style={{ cursor: "help" }}
                          >
                            {item.assignedTo.firstName}{" "}
                            {item.assignedTo.lastName}
                          </span>
                        ) : (
                          <span className="text-muted fst-italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td>{item.task}</td>
                      <td style={{ minWidth: "120px" }}>
                        <select
                          value={item.priority}
                          onChange={(e) =>
                            handleChange(item._id, "priority", e.target.value)
                          }
                          className={`form-select form-select-sm 
                            ${
                              item.priority === "High"
                              ? "bg-danger text-white"
                              : item.priority === "Medium"
                              ? "bg-warning text-dark"
                              : "bg-success text-white"
                            }`}
                        >
                          {["Low", "Medium", "High"].map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td style={{ minWidth: "120px" }}>
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleChange(item._id, "status", e.target.value)
                          }
                          className={`form-select form-select-sm 
                            ${
                              item.status === "Ongoing"
                              ? "bg-primary text-white"
                              : item.status === "Paused"
                              ? "bg-secondary text-white"
                              : item.status === "Review"
                              ? "bg-info text-dark"
                              : item.status === "Completed"
                              ? "bg-success text-white"
                              : item.status === "Canceled"
                              ? "bg-danger text-white"
                              : ""
                            }`}
                        >
                          {[
                            "Ongoing",
                            "Paused",
                            "Review",
                            "Completed",
                            "Canceled",
                          ].map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>{new Date(item.startDate).toLocaleDateString()}</td>
                      <td>
                        <input
                          type="date"
                          value={
                            item.estimatedCompletion?.substring(0, 10) || ""
                          }
                          onChange={(e) =>
                            handleChange(
                              item._id,
                              "estimatedCompletion",
                              e.target.value
                            )
                          }
                          className="form-control form-control-sm"
                        />
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan="9" className="text-center text-muted py-3">
                        No task found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default OngoingMaintenance;
