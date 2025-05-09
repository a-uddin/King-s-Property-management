import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import { HashRouter } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './axiosSetup';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router> {/* ✅ Changed from HashRouter */}
    <AuthProvider> {/* ✅ Keep this */}
      <App />
    </AuthProvider>
  </Router>
);

/* root.render(
  <HashRouter>
  <AuthProvider>
    <App />
  </AuthProvider>
</HashRouter>
); */