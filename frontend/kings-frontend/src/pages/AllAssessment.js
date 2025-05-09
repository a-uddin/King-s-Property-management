import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Alert, Modal, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import "./AllAssessment.css";
import Footer from "../components/Footer";

const AllAssessment = () => {
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState("");
  const [editingRow, setEditingRow] = useState(null);
  const [newValue, setNewValue] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [selectedAssetName, setSelectedAssetName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [assessmentHistory, setAssessmentHistory] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/assessments/assigned-only`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAssets(res.data);
    } catch (err) {
      console.error("Error fetching assessments:", err.message);
      setError("❌ Failed to load assessment data.");
    }
  };

  const saveValue = async (assetID) => {
    const confirm = await Swal.fire({
      title: "Confirm Update",
      text: "Are you sure you want to update the market value?",
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
        const token = localStorage.getItem("token");
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/assessments`,
          { assetID, marketValue: Number(newValue) },
          { headers: { Authorization: `Bearer ${token}` } }
        );


        setEditingRow(null);
        setNewValue("");
        fetchAssets();

        Swal.fire({
          icon: "success",
          title: "Saved",
          text: "Market value updated.",
          position: "top",
          toast: true,
          timer: 2000,
          showConfirmButton: false,
        });
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
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/assessments/${assetID}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
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

  const handleDeleteAssessment = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the assessment record.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      reverseButtons: true,
      backdrop: true,
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/assessments/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete");
      }

      // ✅ Update modal table immediately
      setHistoryData((prev) => prev.filter((h) => h._id !== id));

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Assessment has been deleted.",
        timer: 1500,
        showConfirmButton: false,
        position: "top",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not delete assessment.",
      });
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-grow-1 p-4 Ongoing-font-design">
        <div className="container mt-4 assessment-font-style">
          <h3>📋 All Assessments</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <input
            type="text"
            className="form-control mb-4"
            placeholder="🔍 Search by asset name or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: "400px" }}
          />
          <div style={{ overflowX: "auto" }}>
            <Table
              striped
              bordered
              hover
              className="align-middle text-nowrap w-100 table-sm small table-font-balance"
              style={{ fontSize: "14px" }}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Asset Name</th>
                  <th>Location</th>
                  <th>Purchase Date</th>
                  <th>Purchase Value (£)</th>
                  <th>Assigned To</th>
                  <th>Current Value</th>
                  <th>Last Assessed</th>
                  <th>Status</th>
                  <th>History</th>
                </tr>
              </thead>
              <tbody>
                {assets
                  .filter(
                    (asset) =>
                      asset.assetName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      asset.location
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((asset, index) => (
                    <tr key={asset._id}>
                      <td>{index + 1}</td>
                      <td>{asset.assetName}</td>

                      <td>{asset.location}</td>

                      <td>{asset.purchaseDate?.slice(0, 10) || "—"}</td>
                      <td>{asset.purchaseValue}</td>
                      <td>{asset.assignedTo}</td>
                      <td>
                        {editingRow === asset._id ? (
                          <>
                            <input
                              type="number"
                              value={newValue}
                              onChange={(e) => setNewValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveValue(asset._id);
                              }}
                              style={{
                                width: "80px",
                                padding: "4px 6px",
                                fontSize: "0.85rem",
                              }}
                              className="form-control d-inline-block"
                            />
                            <button
                              onClick={() => saveValue(asset._id)}
                              className="btn btn-success btn-sm ms-2"
                              style={{
                                padding: "2px 8px",
                                fontSize: "0.85rem",
                              }}
                            >
                              ✓
                            </button>
                          </>
                        ) : (
                          <div className="d-flex align-items-center">
                            <span
                              className="badge bg-light text-dark border"
                              style={{
                                fontSize: "0.85rem",
                                padding: "6px 10px",
                                minWidth: "60px",
                                textAlign: "center",
                              }}
                            >
                              {asset.currentValue ?? "—"}
                            </span>
                            <button
                              className="btn btn-outline-secondary btn-sm ms-2"
                              onClick={() => {
                                setEditingRow(asset._id);
                                setNewValue(asset.currentValue || "");
                              }}
                              style={{
                                padding: "2px 8px",
                                fontSize: "0.85rem",
                              }}
                            >
                              🖉
                            </button>
                          </div>
                        )}
                      </td>

                      <td>
                        {asset.lastAssessedDate
                          ? asset.lastAssessedDate.slice(0, 10)
                          : "—"}
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
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
                        </div>
                      </td>
                      <td>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="d-flex align-items-center gap-1 px-2 py-1"
                          style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}
                          onClick={() =>
                            fetchHistory(asset._id, asset.assetName)
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

          {/* show Modal for Asset History */}

          <Modal
            show={showHistoryModal}
            onHide={() => setShowHistoryModal(false)}
            centered
            size="lg"
            className="modal-font"
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
                      <th>Market Value (£)</th>
                      <th>Status</th>
                      <th>Assessor</th>
                      <th>Purchase Value (£)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((item, index) => (
                      <tr key={index}>
                        <td>{new Date(item.date).toLocaleDateString()}</td>
                        <td>{item.marketValue}</td>
                        <td>{item.status}</td>
                        <td>
                          {item.assessorID
                            ? `${item.assessorID.firstName} ${item.assessorID.lastName}`
                            : "—"}
                        </td>
                        <td>{item.assetID?.currentValue || "—"}</td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteAssessment(item._id)}
                            style={{ fontSize: "0.8rem", padding: "2px 8px" }}
                          >
                            🗑 Delete
                          </Button>
                        </td>
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
  );
};

export default AllAssessment;
