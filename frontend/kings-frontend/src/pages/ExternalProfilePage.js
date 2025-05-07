import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Form, Button, Alert, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ExternalNavbar from "../components/ExternalNavbar";
import { AuthContext } from "../context/AuthContext";

const ExternalProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        password: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/users/profile/update`,
        { ...profile },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setAlert({ type: "success", message: res.data.message });
      setTimeout(() => {
        setAlert(null);
        navigate("/external");
      }, 2000);
    } catch (err) {
      setAlert({ type: "danger", message: "Update failed. Try again." });
    }
  };

  return (
    <>
      <ExternalNavbar />
      <Container className="mt-4">
        <h3>🌐 External Profile</h3>
        {alert && <Alert variant={alert.type}>{alert.message}</Alert>}

        <Form onSubmit={handleUpdate}>
          <div className="row justify-content-center">
            <div className="col-md-6 shadow p-4 rounded bg-white">
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>New Password (optional)</Form.Label>
                <Form.Control
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={profile.password}
                  onChange={handleChange}
                />
              </Form.Group>

              <div className="text-end">
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </Form>
      </Container>
    </>
  );
};

export default ExternalProfilePage;
