// For all asset
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Table, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./CommonTextDesign.css";
import Footer from "../components/Footer";

const ShowAssets = () => {
  const [assets, setAssets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("available");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [scheduledMaintenance, setScheduledMaintenance] = useState("");
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [assignModalAssetId, setAssignModalAssetId] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [assignUsers, setAssignUsers] = useState([]);

  useEffect(() => {
    fetchAssets();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      console.log("Available users for assignment:", users);
    }
  }, [users]);

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users`);

      console.log("Fetched ALL users:", res.data);
      setAssignUsers(res.data);

    } catch (err) {
      console.error("Failed to fetch all users:", err.message);
      setAssignUsers([]); // fallback
    }
  };

  const fetchAssets = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/assets`);
    setAssets(res.data);
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/approved-users`
      );
      console.log("Fetched users:", res.data);
      const filtered = res.data.filter(
        (user) =>
          user.approved === true &&
          (user.role === "staff" || user.role === "external_company")
      );
      console.log("Fetched users:", filtered);
      setUsers(filtered);
    } catch (err) {
      console.error("Failed to fetch users:", err.message);
    }
  };

  const handleAddOrUpdate = async () => {
    // Build payload safely
    const assetPayload = {
      assetName,
      assetType,
      location,
      status,
      purchaseDate: purchaseDate || null,
      currentValue: currentValue || null,
      assignedTo: assignedTo || null,
      scheduledMaintenance: scheduledMaintenance || null,
    };

    try {
      if (editId) {
        const confirm = window.confirm(
          "Are you sure you want to update this asset?"
        );
        if (!confirm) return;

        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/assets/${editId}`, assetPayload);

        setAlertMessage("✅ Asset updated successfully");
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/assets`, assetPayload);

        setAlertMessage("✅ Asset added successfully");
      }

      fetchAssets();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Error saving asset:", err.response?.data || err.message);
      setAlertMessage(
        "❌ Error saving asset. Check required fields or server logs."
      );
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This asset will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/assets/${id}`);

      await fetchAssets();
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "The asset has been deleted.",
        position: "top",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Delete error:", err.message);
      Swal.fire("Error", "Failed to delete asset", "error");
    }
  };

  const handleEdit = (asset) => {
    setEditId(asset._id);
    setAssetName(asset.assetName);
    setAssetType(asset.assetType);
    setLocation(asset.location);
    setStatus(asset.status);
    setPurchaseDate(asset.purchaseDate?.slice(0, 10) || "");
    setCurrentValue(asset.currentValue || "");
    setAssignedTo(asset.assignedTo?._id || "");
    setScheduledMaintenance(asset.scheduledMaintenance?.slice(0, 10) || "");
    setShowModal(true);
  };

  const resetForm = () => {
    setEditId(null);
    setAssetName("");
    setAssetType("");
    setLocation("");
    setStatus("available");
    setPurchaseDate("");
    setCurrentValue("");
    setAssignedTo("");
    setScheduledMaintenance("");
  };

  const handleShowAssignModal = async (assetId) => {
    const confirm = await Swal.fire({
      title: "Assign Asset",
      text: "Do you want to assign this asset now?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#aaa",
    });

    if (!confirm.isConfirmed) return;

    try {
      setSelectedAssetId(assetId);
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users`);
      setAssignUsers(res.data);
      setShowAssignModal(true);
    } catch (err) {
      console.error("Error fetching users:", err.message);
      setAssignUsers([]);
      setShowAssignModal(true);
    }
  };

  const handleAssignUser = async (userId) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/assets/${selectedAssetId}/assign`,
        {
          assignedTo: userId,
        }
      );


      fetchAssets(); // Refresh table
      setShowAssignModal(false);
      setSelectedAssetId(null);
      setAlertMessage("✅ Asset successfully assigned!");
      setTimeout(() => setAlertMessage(null), 3000); // auto-clear
    } catch (err) {
      console.error("Error assigning asset:", err.message);
      setAlertMessage("❌ Failed to assign asset.");
    }
  };

  return (
    <>
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1">
          <div className="container mt-4 ShowAsset-font-design">
            <h3>📋 All Assets</h3>

            {alertMessage && <Alert variant="success">{alertMessage}</Alert>}

            <Form.Control
              type="text"
              placeholder="🔍 Search by asset name, type, or status"
              className="mb-3 px-3 py-2 border border-gray-300 rounded-md mb-4 w-full text-base shadow-sm"
              value={searchQuery}
              style={{ width: "500px", maxWidth: "100%" }}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Button className="mb-3" onClick={() => setShowModal(true)}>
              ➕ Add New Asset
            </Button>

            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Purchase Date</th>
                  <th>Value (£)</th>
                  <th>Assigned To</th>
                  <th>Scheduled Maintenance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets
                  .filter((asset) => {
                    const query = searchQuery.toLowerCase();
                    return (
                      asset.assetName.toLowerCase().includes(query) ||
                      asset.assetType.toLowerCase().includes(query) ||
                      asset.status.toLowerCase().includes(query)
                    );
                  })
                  .map((asset, index) => (
                    <tr key={asset._id}>
                      <td>{index + 1}</td>
                      <td>{asset.assetName}</td>
                      <td>
                        {asset.assetType.charAt(0).toUpperCase() +
                          asset.assetType.slice(1)}
                      </td>
                      <td>{asset.location}</td>
                      <td>{asset.status}</td>
                      <td>{asset.purchaseDate?.slice(0, 10)}</td>
                      <td>{asset.currentValue}</td>
                      <td>
                        {asset.assignedTo ? (
                          <>
                            {asset.assignedTo.firstName}{" "}
                            {asset.assignedTo.lastName}
                            {asset.assignedTo.role
                              ? ` (${asset.assignedTo.role})`
                              : ""}
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="info"
                            onClick={() => handleShowAssignModal(asset._id)}
                          >
                            Show Staff
                          </Button>
                        )}
                      </td>

                      <td>{asset.scheduledMaintenance?.slice(0, 10)}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => handleEdit(asset)}
                        >
                          Edit
                        </Button>{" "}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(asset._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>
                  {editId ? "Edit Asset" : "Add New Asset"}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Group className="mb-2">
                  <Form.Label>Asset Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Asset Type</Form.Label>
                  <Form.Select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                  >
                    <option value="">-- Select Type --</option>
                    <option value="Building">Buildings</option>
                    <option value="Computer">Computers</option>
                    <option value="Furniture">Furnitures</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="in use">In Use</option>
                    <option value="under maintenance">Under Maintenance</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Purchase Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Current Value (£)</Form.Label>
                  <Form.Control
                    type="number"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Scheduled Maintenance</Form.Label>
                  <Form.Control
                    type="date"
                    value={scheduledMaintenance}
                    onChange={(e) => setScheduledMaintenance(e.target.value)}
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddOrUpdate}>
                  {editId ? "Update" : "Add"}
                </Button>
              </Modal.Footer>
            </Modal>

            <Modal
              show={showAssignModal}
              onHide={() => setShowAssignModal(false)}
            >
              <Modal.Header closeButton>
                <Modal.Title>Assign Asset to Staff or Company</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {assignUsers.length === 0 ? (
                  <p>No approved users found.</p>
                ) : (
                  <ul className="list-group">
                    {assignUsers
                      .filter(
                        (user) =>
                          user.role === "staff" ||
                          user.role === "external_company"
                      )
                      .map((user) => (
                        <li
                          key={user._id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <strong>
                              {user.firstName} {user.lastName}
                            </strong>
                            <br />
                            <small>{user.role}</small>
                          </div>
                          <Button
                            variant="success"
                            onClick={() => handleAssignUser(user._id)}
                          >
                            Assign
                          </Button>
                        </li>
                      ))}
                  </ul>
                )}
              </Modal.Body>
            </Modal>
          </div>
        </main>

          <Footer />

      </div>

    </>
  );
};

export default ShowAssets;
