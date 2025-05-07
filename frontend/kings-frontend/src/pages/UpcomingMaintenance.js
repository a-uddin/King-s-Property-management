import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Form, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import AdminNavbar from "../components/AdminNavbar";
import { saveAs } from "file-saver";
import "./CommonTextDesign.css";
import Footer from "../components/Footer";

const UpcomingMaintenance = () => {
  const [assets, setAssets] = useState([]);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await axios.get("/api/maintenance/upcoming-maintenance");
      setAssets(res.data);
    } catch (err) {
      console.error("Error fetching maintenance assets:", err);
    }
  };

  const handleInputChange = (assetId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [assetId]: {
        ...prev[assetId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (assetId) => {
    const { maintenanceType, maintenanceNotes } = formData[assetId] || {};
  
    if (!maintenanceType) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Type",
        text: "Maintenance type is required.",
        confirmButtonColor: "#d33",
      });
    }
  
    const confirm = await Swal.fire({
      title: "Confirm Save",
      text: "Are you sure you want to save this maintenance task?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d6efd",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, save it!",
      customClass: {
        popup: "shadow rounded",
      },
    });
  
    if (!confirm.isConfirmed) return;
  
    try {
      await axios.patch(`/api/maintenance/${assetId}/update`, {
        maintenanceType,
        maintenanceNotes,
      });
  
      setFormData((prev) => ({ ...prev, [assetId]: {} }));
  
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Maintenance task saved & email sent!",
        position: "top",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error saving maintenance:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not save maintenance task.",
        position: "top",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const exportCSV = () => {
    const headers = [
      "Asset Name",
      "Location",
      "Status",
      "Assigned To",
      "Maintenance Date",
    ];

    const rows = filteredAssets.map((asset) => [
      asset.assetName,
      asset.location,
      asset.status,
      asset.assignedTo
        ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}`
        : "Not Assigned",
      asset.scheduledMaintenance
        ? new Date(asset.scheduledMaintenance).toLocaleDateString()
        : "—",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((item) => `"${item}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "upcoming_maintenance.csv");
  };

  // Filter & sort
  const filteredAssets = assets
    .filter((asset) => {
      const assignedTo = asset.assignedTo
        ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}`.toLowerCase()
        : "not assigned";
      return (
        asset.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignedTo.includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.scheduledMaintenance);
      const dateB = new Date(b.scheduledMaintenance);
      return sortOrder === "earliest" ? dateB - dateA : dateA - dateB;
    });

  const isDueSoon = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return date - now <= sevenDays && date - now >= 0;
  };

  return (
    <>
    <AdminNavbar />
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-grow-1 p-4 Ongoing-font-design">
        <div className="container mt-4 upcoming-font-design">
          <h2>🛠️ Upcoming Maintenance</h2>
          <Form.Control
          type="text"
          placeholder="🔍 Search by asset, location, status or person"
          className="my-3 px-3 py-2 border border-gray-300 rounded-md mb-4 w-full text-base shadow-sm"
          value={searchTerm}
          style={{ width: "500px", maxWidth: "100%" }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="d-flex justify-content-between align-items-center mb-3">
          <Button variant="success" onClick={exportCSV}>
            Export CSV
          </Button>

          <Form.Group className="d-flex align-items-center gap-2 mb-0">
            <Form.Label className="mb-0 fw-bold">Sort by:</Form.Label>
            <Form.Select
              size="sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{ width: "150px" }}
            >
              <option value="latest">Latest First</option>
              <option value="earliest">Earliest First</option>
            </Form.Select>
          </Form.Group>
        </div>

        {alert && <Alert variant={alert.type}>{alert.message}</Alert>}

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Asset Name</th>
              <th>Location</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Maintenance Date</th>
              <th>Type</th>
              <th>Notes</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No upcoming maintenance found.
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => (
                <tr
                  key={asset._id}
                  className={
                    isDueSoon(asset.scheduledMaintenance) ? "table-warning" : ""
                  }
                >
                  <td>{asset.assetName}</td>
                  <td>{asset.location}</td>
                  <td>{asset.status}</td>
                  <td>
                    {asset.assignedTo
                      ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}`
                      : "Not Assigned"}
                  </td>
                  <td>
                    {asset.scheduledMaintenance
                      ? new Date(
                          asset.scheduledMaintenance
                        ).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Inspection"
                      value={formData[asset._id]?.maintenanceType || ""}
                      onChange={(e) =>
                        handleInputChange(
                          asset._id,
                          "maintenanceType",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      as="textarea"
                      rows={1}
                      placeholder="Write notes..."
                      value={formData[asset._id]?.maintenanceNotes || ""}
                      onChange={(e) =>
                        handleInputChange(
                          asset._id,
                          "maintenanceNotes",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleSave(asset._id)}
                    >
                      Save
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

export default UpcomingMaintenance;
