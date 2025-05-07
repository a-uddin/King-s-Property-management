import React, { useEffect, useState } from "react";
import ExternalNavbar from "../components/ExternalNavbar";
import AOS from "aos";
import "aos/dist/aos.css";
import Footer from "../components/Footer";

const ExternalDashboard = () => {
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setFullName(`${parsedUser.firstName} ${parsedUser.lastName}`);
    }

    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <>
      <ExternalNavbar />
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1">
          <div
            className="min-vh-100 d-flex align-items-center justify-content-center"
            style={{
              background:
                "linear-gradient(135deg,rgb(136, 188, 241) 0%,rgb(186, 250, 147) 100%)",
              padding: "50px 20px",
            }}
          >
            <div
              className="text-center shadow p-5 rounded"
              data-aos="zoom-in"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                borderRadius: "20px",
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                color: "#fff",
                maxWidth: "600px",
                width: "100%",
                border: "1px solid rgba(255, 255, 255, 0.18)",
              }}
            >
              <h2 style={{ fontWeight: "700", fontSize: "2.4rem" }}>
                🏢 Welcome, {fullName || "External Company"}
              </h2>

              <p
                style={{
                  fontSize: "1.1rem",
                  marginTop: "15px",
                  color: "#f9f9f9",
                }}
              >
                This is your personalized Kings Portal. You can view assigned
                maintenance tasks, check updates, and manage your
                responsibilities.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ExternalDashboard;
