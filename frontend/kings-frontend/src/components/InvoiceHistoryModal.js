import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Spinner } from "react-bootstrap";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./InvoiceModal.css";

const InvoiceHistoryModal = ({ show, onHide, taskId }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/invoices/user/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("Fetched invoices:", res.data);
        setInvoices(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false); // <- always stop loading
      }
    };

    if (user && user._id) {
      fetchInvoices();
    }
  }, [user]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="historyModal-font"
    >
      <Modal.Header closeButton>
        <Modal.Title>📜 Invoice History</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : invoices.length === 0 ? (
          <p>No invoices submitted for this task.</p>
        ) : (
          <Table striped bordered>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Date Submitted</th>
                <th>Size (KB)</th>
                <th>Download</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td>{inv.fileName}</td>
                  <td>{new Date(inv.dateSubmitted).toLocaleDateString()}</td>
                  <td>{(inv.fileSize / 1024).toFixed(1)}</td>
                  <td>
                    <a href={inv.invoiceUrl} target="_blank" rel="noreferrer">
                      Download
                    </a>
                  </td>
                  <td>
                    <span
                      className={`badge rounded-pill ${
                        inv.status === "Approved"
                          ? "bg-success"
                          : inv.status === "Reviewed"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {inv.status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default InvoiceHistoryModal;
