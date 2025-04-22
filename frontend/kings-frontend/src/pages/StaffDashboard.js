import React from "react";
import StaffNavbar from "../components/StaffNavbar";

const StaffDashboard = () => {
  return (
    <>
      <StaffNavbar />

      <div className="container mt-4">
        <h2>👨‍💼 Staff Dashboard</h2>
        <p>Welcome! Use the navigation bar to access your tasks, maintenance updates, and assessments.</p>
      </div>
    </>
  );
};

export default StaffDashboard;
