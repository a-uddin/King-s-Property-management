import React from 'react';
import AdminNavbar from '../components/AdminNavbar';
import './AdminDashboard.css';  // Updated styles

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard vibrant-bg">
      <AdminNavbar />
      <div className="welcome-container animated-fade">
        <h1 className="welcome-title bounce-in">🎉 Welcome to the Admin Dashboard</h1>
        <p className="welcome-subtitle slide-in">
          Use the navigation above to manage users, assets, maintenance tasks, and more.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
