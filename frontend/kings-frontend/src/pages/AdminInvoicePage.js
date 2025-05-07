import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Dropdown } from "react-bootstrap";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import "./AdminInvoicePage.css";
import Footer from "../components/Footer";

const AdminInvoicePage = () => {
  const { user, token } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get("/api/invoices/admin", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInvoices(res.data);
      } catch (error) {
        console.error("Error fetching admin invoices:", error);
      }
    };

    fetchInvoices();
  }, [token]);

  const updateStatus = async (invoiceId, newStatus) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to mark this invoice as "${newStatus}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
    });

    if (confirmResult.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.patch(
          `/api/invoices/${invoiceId}/status`,
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // ✅ Update local invoice list without refreshing entire list
        setInvoices((prev) =>
          prev.map((inv) =>
            inv._id === invoiceId ? { ...inv, status: newStatus } : inv
          )
        );

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Invoice status has been updated.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Status update failed:", error);
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "Make sure you are logged in and try again.",
        });
      }
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-grow-1 p-4 Ongoing-font-design">
        <div className="container mt-4 invoice-page-font">
          <h3 className="mb-3">📊 Admin Invoice Overview</h3>
          <input
            type="text"
            className="form-control mb-4"
            placeholder="🔍 Search by asset name, location or submitted by"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: "400px" }}
          />

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Submitted By</th>
                <th>Asset Name</th>
                <th>Location</th>
                <th>Task Note</th>
                <th>Date Submitted</th>
                <th>Size (KB)</th>
                <th>Download</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices
                .filter(
                  (inv) =>
                    inv.taskId?.assetName
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    inv.taskId?.location
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    `${inv.submittedBy?.firstName} ${inv.submittedBy?.lastName}`
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((inv) => (
                  <tr key={inv._id}>
                    <td>{inv.fileName}</td>
                    <td>
                      {inv.submittedBy?.firstName} {inv.submittedBy?.lastName}
                    </td>
                    <td>{inv.taskId?.assetName}</td>
                    <td>{inv.taskId?.location}</td>
                    <td>{inv.taskId?.note}</td>
                    <td>{format(new Date(inv.dateSubmitted), "d/M/yyyy")}</td>
                    <td>{(inv.fileSize / 1024).toFixed(1)}</td>
                    <td>
                      <a href={inv.invoiceUrl} target="_blank" rel="noreferrer">
                        Download
                      </a>
                    </td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle
                          variant={
                            inv.status === "Approved"
                              ? "success"
                              : inv.status === "Reviewed"
                              ? "warning"
                              : "secondary"
                          }
                          className="rounded-pill shadow-sm px-3 py-1 text-capitalize"
                          size="sm"
                        >
                          {inv.status || "Pending"}
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="custom-dropdown-menu">
                          <Dropdown.Item
                            onClick={() => updateStatus(inv._id, "Pending")}
                          >
                            ⏳ Pending
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => updateStatus(inv._id, "Reviewed")}
                          >
                            👀 Reviewed
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => updateStatus(inv._id, "Approved")}
                          >
                            ✅ Approved
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminInvoicePage;
