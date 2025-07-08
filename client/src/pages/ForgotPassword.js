import React, { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg(null);
    try {
      const { data } = await axios.post(
        'http://127.0.0.1:5000/auth/request-reset',
        { email }
      );
      setMsg({ type: 'success', text: data.msg });
    } catch (err) {
      setMsg({
        type: 'danger',
        text: err.response?.data?.msg || 'Request failed'
      });
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <form onSubmit={handleSubmit} className="p-4 border rounded" style={{ minWidth: '300px' }}>
        {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
        <h3 className="mb-3">Forgot Password</h3>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Send Reset Link
        </button>
      </form>
    </div>
  );
}