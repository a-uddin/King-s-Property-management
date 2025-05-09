import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Table, Alert, Modal, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import { AuthContext } from "../context/AuthContext";
import StaffNavbar from "../components/StaffNavbar";
import "./CommonTextDesign.css";
import Footer from "../components/Footer";

const StaffAssessment = () => {
  const { user } = useContext(AuthContext);
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState("");
  const [editingRow, setEditingRow] = useState(null);
  const [newValue, setNewValue] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [selectedAssetName, setSelectedAssetName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAssets();
  }, []);

  const userId = user?._id;

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/assigned-tasks/with-asset`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const allTasks = response.data || [];

      const assessmentTasks = allTasks
        .filter(
          (task) =>
            (task.assignedTo?._id === userId || task.assignedTo === userId) &&
            task.assignedFor === "Assessment"
        )
        .map((task) => ({
          ...task,
          assetID: task.assetId || task.assetID || task._id, // ensure assetID exists
          currentValue: task.currentValue ?? "—",
          lastAssessedDate: task.lastAssessedDate ?? "—",
          status: task.status ?? "Pending",
        }));

      setAssets(
        assessmentTasks.map((task) => ({
          ...task,
          assetID: task.assetID || task.assetId || task._id,
          currentValue: task.currentValue ?? "—",
          lastAssessedDate: task.lastAssessedDate ?? "—",
          status: task.status ?? "Pending",
        }))
      );
    } catch (error) {
      console.error("Error fetching assessment data:", error);
    }
  };

  const saveValue = async (assetID) => {
    const confirm = await Swal.fire({
      title: "Confirm Update",
      text: "Are you sure you want to update the market value?",
      icon: "warning",
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
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/assessments`,
          { assetID, marketValue: Number(newValue) },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setEditingRow(null);
        setNewValue("");
        //fetchAssets();
        const { data: history } = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/assessments/${assetID}/history`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const latest = history?.[0];
        if (latest) {
          setAssets((prev) =>
            prev.map((a) =>
              a._id === assetID
                ? {
                    ...a,
                    currentValue: latest.marketValue,
                    lastAssessedDate: latest.date,
                    status: latest.status,
                  }
                : a
            )
          );
        }

        Swal.fire({
          icon: "success",
          title: "Saved",
          text: "Market value updated.",
          position: "top",
          toast: true,
          timer: 2000,
          showConfirmButton: false,
        });

        // 1. Build updated assessment object
        const updatedAssessment = {
          currentValue: newValue,
          lastAssessedDate: new Date().toISOString().split("T")[0],
          status: "Reviewed",
        };

        // 2. Update local assets state
        setAssets((prevAssets) =>
          prevAssets.map((asset) =>
            asset.assetID === assetID
              ? {
                  ...asset,
                  currentValue: updatedAssessment.currentValue,
                  lastAssessedDate: updatedAssessment.lastAssessedDate,
                  status: updatedAssessment.status,
                }
              : asset
          )
        );
      } catch (err) {
        console.error("❌ Failed to save assessment:", err.message);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Could not save value.",
          position: "top",
          toast: true,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }
  };

  const fetchHistory = async (assetID, assetName) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/assessments/${assetID}/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setHistoryData(res.data);
      setSelectedAssetName(assetName);
      setShowHistoryModal(true);
    } catch (err) {
      console.error("❌ Error fetching history:", err.message);
      alert("Failed to load history.");
    }
  };

  return (
    <>
      <StaffNavbar />
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1">
          <div className="mt-4 p-4 shadow rounded bg-white staffAssessment-font-style">
            <h3 className="mb-4">📋 My Assigned Assessments</h3>
            {error && <Alert variant="danger">{error}</Alert>}

            <div style={{ overflowX: "auto" }}>
              <input
                type="text"
                className="form-control mb-4"
                placeholder="🔍 Search by asset name or location"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: "400px" }}
              />

              <Table
                striped
                bordered
                hover
                responsive
                className="align-middle text-nowrap w-100"
              >
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Asset</th>
                    <th>Location</th>
                    <th>Purchase Date</th>
                    <th>Value (£)</th>
                    <th>Current Value</th>
                    <th>Assessed On</th>
                    <th>Status</th>
                    <th>History</th>
                  </tr>
                </thead>
                <tbody>
                  {assets
                    .filter(
                      (asset) =>
                        asset.assetName
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        asset.location
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    )
                    .map((asset, index) => (
                      <tr key={asset.assetID}>
                        <td>{index + 1}</td>
                        <td>{asset.assetName}</td>
                        <td>{asset.location}</td>
                        <td>
                          {asset.assetDetails?.purchaseDate?.slice(0, 10) ||
                            "—"}
                        </td>
                        <td>{asset.assetDetails?.value ?? "—"}</td>
                        <td>
                          {editingRow === asset.assetID ? (
                            <>
                              <div className="d-flex gap-2 align-items-center">
                                <input
                                  type="number"
                                  value={newValue}
                                  onChange={(e) => setNewValue(e.target.value)}
                                  onKeyDown={(e) =>
                                    e.key === "Enter" &&
                                    saveValue(asset.assetID)
                                  }
                                  className="form-control form-control-sm fw-bold border-primary"
                                  style={{ width: "100px", height: "32px" }}
                                />
                                <button
                                  onClick={() => saveValue(asset.assetID)}
                                  className="btn btn-success btn-sm d-flex align-items-center justify-content-center"
                                  style={{
                                    height: "32px",
                                    width: "32px",
                                    padding: 0,
                                  }}
                                  title="Save"
                                >
                                  ✓
                                </button>
                              </div>
                            </>
                          ) : (
                            <div
                              className="d-flex align-items-center gap-2"
                              style={{
                                minWidth: "120px",
                                justifyContent: "space-between",
                              }}
                            >
                              <div
                                className="bg-light border rounded-pill px-3 py-1 fw-semibold text-center"
                                style={{ minWidth: "70px" }}
                              >
                                {asset.currentValue ?? "—"}
                              </div>
                              <button
                                className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  padding: 0,
                                }}
                                onClick={() => {
                                  setEditingRow(asset.assetID);
                                  setNewValue(asset.currentValue || "");
                                }}
                                title="Edit"
                              >
                                ✎
                              </button>
                            </div>
                          )}
                        </td>
                        <td>{asset.lastAssessedDate?.slice(0, 10) || "—"}</td>
                        <td>
                          <span
                            className={`badge ${
                              (asset.status || "Pending") === "Reviewed"
                                ? "bg-success"
                                : (asset.status || "Pending") === "Pending"
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                            }`}
                          >
                            {asset.status || "Pending"}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="px-2 py-1"
                            onClick={() =>
                              fetchHistory(asset.assetID, asset.assetName)
                            }
                          >
                            📜 History
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>

            {/* History Modal */}

            <Modal
              show={showHistoryModal}
              onHide={() => setShowHistoryModal(false)}
              centered
              size="lg"
              className="assessment-history-modal-font"
            >
              <Modal.Header closeButton>
                <Modal.Title>
                  📜 Assessment History – {selectedAssetName}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {historyData.length === 0 ? (
                  <p>No assessment history found.</p>
                ) : (
                  <Table striped bordered>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Current Value (£)</th>
                        <th>Status</th>
                        <th>Assessor</th>
                        <th>Purchase Price (£)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((item, i) => (
                        <tr key={i}>
                          <td>{new Date(item.date).toLocaleDateString()}</td>
                          <td>{item.marketValue}</td>
                          <td>{item.status}</td>
                          <td>
                            {item.assessorID
                              ? `${item.assessorID.firstName} ${item.assessorID.lastName}`
                              : "—"}
                          </td>
                          <td>{item.assetID?.currentValue || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowHistoryModal(false)}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default StaffAssessment;
