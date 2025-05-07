import React from "react";
import { useEffect, useState } from "react";
import StaffNavbar from "../components/StaffNavbar";
import Footer from "../components/Footer";

const StaffDashboard = () => {
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setFullName(`${parsedUser.firstName} ${parsedUser.lastName}`);
    }
  }, []);

  return (
    <>
      <StaffNavbar />
  
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 10%,rgb(142, 247, 170) 100%)",
        }}
      >
        <div
          className="shadow-lg p-5 rounded-5 text-white"
          style={{
            maxWidth: "800px",
            width: "90%",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div className="d-flex align-items-center mb-4">
            <span className="fs-1 me-3">👨‍💼</span>
            <div>
              <h2 style={{ fontWeight: "800", fontSize: "2.5rem" }}>
                🏢 Welcome, {fullName || "External Company"}
              </h2>
              <p className="text-light fst-italic mb-0">
                Welcome back
              </p>
            </div>
          </div>

          <hr className="border-light" />

          <p style={{ fontSize: "1.1rem", color: "#f0f0f0" }}>
            This is your personalized Kings Portal. You can view assigned
            maintenance tasks, check updates, and manage your responsibilities.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );

};

export default StaffDashboard;
