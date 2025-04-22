import React from "react";
import ExternalNavbar from "../components/ExternalNavbar";

const ExternalDashboard = () => {
  return (
    <>
      <ExternalNavbar />
      <div className="container mt-5 text-center">
        <h2>🏢 External Company Dashboard</h2>
        <p>Welcome to the Kings Portal. You can view assigned tasks, maintenance updates, and submit invoices.</p>
      </div>
    </>
  );
};

export default ExternalDashboard;
