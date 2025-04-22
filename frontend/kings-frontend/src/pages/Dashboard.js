import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import LogoutButton from '../components/LogoutButton';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Welcome to the Dashboard</h2>
      {user ? (
        <>
          <p>
            Logged in as: <strong>{user.email}</strong>
          </p>
          <p>
            Role: <strong>{user.role || 'Pending approval'}</strong>
          </p>
          <LogoutButton />
        </>
      ) : (
        <p>🔒 You are not logged in.</p>
      )}
    </div>
  );
};

export default Dashboard;
