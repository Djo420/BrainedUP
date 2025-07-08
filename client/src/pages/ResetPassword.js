import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const query = useQuery();
  const token = query.get('token') || '';
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg(null);
    if (newPwd !== confirm) {
      setMsg({ type: 'danger', text: 'New passwords do not match' });
      return;
    }
    try {
      const { data } = await axios.post(
        'http://127.0.0.1:5000/auth/reset-password',
        { token, new_password: newPwd }
      );
      setMsg({ type: 'success', text: data.msg });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMsg({
        type: 'danger',
        text: err.response?.data?.msg || 'Reset failed'
      });
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <form onSubmit={handleSubmit} className="p-4 border rounded" style={{ minWidth: '300px' }}>
        {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
        <h3 className="mb-3">Reset Password</h3>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="New Password"
            value={newPwd}
            onChange={e => setNewPwd(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Confirm New Password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Reset Password
        </button>
      </form>
    </div>
  );
}
