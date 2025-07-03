import React, { useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import axios from 'axios';

export default function ChangePassword() {
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState(null);
  const { accessToken } = useContext(AuthContext);

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg(null);
    if (newPwd !== confirm) {
      setMsg({ type: 'danger', text: 'New passwords do not match' });
      return;
    }
    try {
      const { data } = await axios.put(
        'http://127.0.0.1:5000/auth/password',
        { old_password: oldPwd, new_password: newPwd },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setMsg({ type: 'success', text: data.msg });
      setOldPwd(''); setNewPwd(''); setConfirm('');
    } catch (err) {
      setMsg({
        type: 'danger',
        text: err.response?.data?.msg || 'Change password failed'
      });
    }
  };

  return (
    <div className="row justify-content-center">
      <form onSubmit={handleSubmit} className="col-md-6 p-4 border rounded">
        {msg && (
          <div className={`alert alert-${msg.type}`} role="alert">
            {msg.text}
          </div>
        )}
        <h4 className="mb-3">Change Password</h4>
        <div className="mb-3">
          <label className="form-label">Old Password</label>
          <input
            type="password"
            className="form-control"
            value={oldPwd}
            onChange={e => setOldPwd(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input
            type="password"
            className="form-control"
            value={newPwd}
            onChange={e => setNewPwd(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            className="form-control"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Change Password
        </button>
      </form>
    </div>
  );
}