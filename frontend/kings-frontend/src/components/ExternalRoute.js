import React from 'react';
import { Navigate } from 'react-router-dom';

const ExternalRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== 'external_company') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ExternalRoute;
