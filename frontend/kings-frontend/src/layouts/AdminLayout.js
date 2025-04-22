import React from "react";
import AdminNavbar from "../components/AdminNavbar";

const AdminLayout = ({ children }) => {
  return (
    <>
      <AdminNavbar />
      <div className="container mt-4">{children}</div>
    </>
  );
};

export default AdminLayout;
