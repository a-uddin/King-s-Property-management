import React from "react";
import AdminNavbar from "../components/AdminNavbar";
import "./AdminDashboard.css"; // Updated styles
import AdminStats from "../components/AdminStats";
import AssetStats from "../components/AssetStats";
import "./AdminDashboard.css";
import Footer from "../components/Footer";

const AdminDashboard = () => {
  return (
    <>
      <div className="admin-dashboard vibrant-bg">
        <AdminNavbar />
        <div className="welcome-container animated-fade">
          <h1 className="welcome-title bounce-in mt-5">
            🎉 Welcome to the Admin Dashboard
          </h1>
          {/*  <p className="welcome-subtitle slide-in">
          Use the navigation above to manage users, assets, maintenance tasks, and more.
        </p> */}

          <div className="mb-5">
            <AdminStats />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
