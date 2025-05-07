import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Alert } from "react-bootstrap";
import "./CommonTextDesign.css";

const Signup = ({ onSuccess }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [companyName, setCompanyName] = useState("");
  // const [businessLicense, setBusinessLicense] = useState("");
  const [companyRegNo, setCompanyRegNo] = useState("");
  //const [companyEmail, setCompanyEmail] = useState("");
  //const [companyPhone, setCompanyPhone] = useState("");
  //const [companyAddress, setCompanyAddress] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/signup`, {
        firstName,
        lastName,
        email,
        password,
        phone,
        address,
        companyName,
        companyRegNo,

      });

      setMessage(res.data.message || "Signup successful! Awaiting admin approval.");

      // Clear form fields
      setFirstName(""); setLastName(""); setEmail(""); setPassword(""); setPhone(""); setAddress("");
      setCompanyName(""); setCompanyRegNo("");
     
      // Close modal after short delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
        setMessage("");
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className="signup-font-style">
      <h4 className="text-center mb-3">📝 Signup</h4>
      {message && (
        <Alert variant={message.includes("failed") ? "danger" : "success"}>{message}</Alert>
      )}

      <Form onSubmit={handleSignup}>
        <Form.Group className="mb-2">
          <Form.Control type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Control type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Control type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Control type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Control type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Control type="text" placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </Form.Group>
      
        <Form.Group className="mb-2">
          <Form.Control type="text" placeholder="Company Reg. Number" value={companyRegNo} onChange={(e) => setCompanyRegNo(e.target.value)} />
        </Form.Group>

        <div className="text-center">
          <Button variant="dark" type="submit">
            Sign Up
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Signup;
