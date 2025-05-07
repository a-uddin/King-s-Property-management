import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Envelope, GeoAlt, Telephone } from "react-bootstrap-icons";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import "../pages/CommonTextDesign.css";

const Footer = () => {
  return (
    <footer
      className="text-white pt-4 pb-3 mt-auto"
      style={{
        background:
          "linear-gradient(270deg ,rgb(70, 117, 92) 10%, #4b6cb7 100%)",
        fontFamily: "'Segoe UI', sans-serif",
        boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.2)",
        width: "99.42vw",
        position: "relative",
        left: "calc(50% - 0.5px)",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
        overflowX: "hidden",
      }}
    >
      <div className="container-fluid footer-font-style">
        <div className="row align-items-start">
          {/* Left: Contact Info */}
          <div className="col-md-4 mb-3 ms-3">
            <p className="fw-bold mb-1">📍 King's Property Management</p>
            <p className="mb-1"> 📌 123 High Street, London, UK</p>
            <p className="mb-1"> ☎️ +44 20 7946 0958</p>
            <p className="mb-1"> ✉️ info@kingsproperty.com</p>
          </div>

          {/* Middle: Social Icons */}
          <div className="col-md-4 mb-3 d-flex justify-content-center align-items-center gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white"
            >
              <FaFacebookF size={18} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white"
            >
              <FaTwitter size={18} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white"
            >
              <FaLinkedinIn size={18} />
            </a>
          </div>

          {/* Empty right side for balance */}
          <div className="col-md-4"></div>
        </div>

        {/* Bottom Center Copyright */}
        <div className="text-center pt-2 ms-3">
          <p className="mb-0" style={{ fontSize: "0.85rem" }}>
            © 2025 King's Portal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
