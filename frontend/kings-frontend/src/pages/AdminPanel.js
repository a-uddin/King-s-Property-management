import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedRoles, setSelectedRoles] = useState({});

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const response = await axios.get('/api/users/pending');
        setPendingUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchPendingUsers();
  }, []);

  const handleRoleChange = (userId, role) => {
    setSelectedRoles((prev) => ({ ...prev, [userId]: role }));
  };

  const handleApprove = async (userId) => {
    try {
      const selectedRole = selectedRoles[userId] || 'external_company';
      const token = JSON.parse(localStorage.getItem("user"))?.token;
  
      await axios.patch(
        `/api/users/${userId}/approve`,
        {
          approved: true,
          role: selectedRole,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setPendingUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (error) {
      console.error('Approval error:', error);
    }
  };
  

  const handleReject = async (userId) => {
    try {
      await axios.patch(`/api/users/${userId}/reject`, {
        approved: false,
        message,
      });

      setPendingUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (error) {
      console.error('Rejection error:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🔒 Admin Panel - Pending User Approvals</h2>

      {pendingUsers.length === 0 ? (
        <p>No pending users.</p>
      ) : (
        pendingUsers.map((user) => (
          <div key={user._id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Company:</strong> {user.companyName || 'N/A'}</p>

            <label htmlFor={`role-${user._id}`}><strong>Assign Role:</strong></label>{' '}
            <select
              id={`role-${user._id}`}
              value={selectedRoles[user._id] || ''}
              onChange={(e) => handleRoleChange(user._id, e.target.value)}
            >
              <option value="">Select role</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="external_company">External Company</option>
            </select>

            <br /><br />

            <textarea
              placeholder="Enter approval/rejection message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              style={{ width: '100%' }}
            />

            <br /><br />

            <button onClick={() => handleApprove(user._id)} style={{ marginRight: '10px' }}>
              ✅ Approve
            </button>
            <button onClick={() => handleReject(user._id)} style={{ backgroundColor: '#f44336', color: '#fff' }}>
              ❌ Reject
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminPanel;
