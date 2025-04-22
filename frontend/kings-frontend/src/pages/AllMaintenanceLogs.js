import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table } from "react-bootstrap";
import { FaClipboardList } from "react-icons/fa";
import AdminNavbar from "../components/AdminNavbar";

const AllMaintenanceLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("/api/maintenance/logs");
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch maintenance logs:", err);
      }
    };

    fetchLogs();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");

  // Filter and sort logs
  const filteredLogs = logs
    .filter((log) => {
      const assetName = log.asset?.assetName?.toLowerCase() || "";
      const location = log.asset?.location?.toLowerCase() || "";
      return (
        assetName.includes(searchTerm.toLowerCase()) ||
        location.includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortOption === "dateAsc") {
        return new Date(a.scheduledDate) - new Date(b.scheduledDate);
      } else if (sortOption === "dateDesc") {
        return new Date(b.scheduledDate) - new Date(a.scheduledDate);
      } else if (sortOption === "createdAsc") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortOption === "createdDesc") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

  return (
    <>
      <AdminNavbar />
      <Container className="mt-5">
        <h2>
          <FaClipboardList className="me-2" />
          All Maintenance Logs
        </h2>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <input
            type="text"
            placeholder="Search by asset name or location..."
            className="form-control me-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: "300px" }}
          />
          <select
            className="form-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            style={{ maxWidth: "200px" }}
          >
            <option value="">Sort by...</option>
            <option value="dateAsc">Scheduled Date ↑</option>
            <option value="dateDesc">Scheduled Date ↓</option>
            <option value="createdAsc">Created At ↑</option>
            <option value="createdDesc">Created At ↓</option>
          </select>
        </div>

        <Table striped bordered hover responsive className="mt-4">
          <thead>
            <tr>
              <th>Asset Name</th>
              <th>Location</th>
              <th>Type</th>
              <th>Notes</th>
              <th>Scheduled Date</th>
              <th>Assigned To</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log._id}>
                <td>{log.asset?.assetName}</td>
                <td>{log.asset?.location}</td>
                <td>{log.type}</td>
                <td>{log.notes}</td>
                <td>{new Date(log.scheduledDate).toLocaleDateString()}</td>
                <td>
                  {log.assignedTo?.firstName} {log.assignedTo?.lastName}
                </td>
                <td>{new Date(log.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </>
  );
};

export default AllMaintenanceLogs;
