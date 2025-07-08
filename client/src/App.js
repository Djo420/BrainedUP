import React, { useContext, useState, useEffect } from "react";
import { Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "./auth/AuthContext";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import EventsPage from "./pages/EventsPage";
import ShoppingPage from "./pages/ShoppingPage";
import FinancePage from "./pages/FinancePage";
import MemosPage from "./pages/MemosPage";
import CalendarPage from "./pages/CalendarPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  const { accessToken } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) return;
    fetch("/tasks", {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(r => r.json())
      .then(setTasks)
      .catch(console.error);
  }, [accessToken]);

  const handleAdd = async data => {
    try {
      const res = await fetch("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to add task");
      const newTask = await res.json();
      setTasks(prev => [...prev, newTask]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const res = await fetch(`/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async id => {
    try {
      const res = await fetch(`/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error("Failed to delete");
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!accessToken) {
    return (
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="bg-dark text-white min-vh-100">
      <nav className="navbar navbar-expand navbar-dark bg-dark sticky-top">
        <div className="container-fluid">
          <NavLink className="navbar-brand" to="/">
            BrainedUP
          </NavLink>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink end className="nav-link" to="/">
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/tasks">
                Tasks
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/events">
                Events
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/shopping">
                Shopping
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/finance">
                Finance
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/memos">
                Memos
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/calendar">
                Calendar
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/settings">
                Settings
              </NavLink>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-outline-light"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>
      <div className="container-fluid px-4 py-4">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route
            path="/tasks"
            element={
              <TasksPage
                tasks={tasks}
                onAdd={handleAdd}
                onToggle={handleUpdate}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            }
          />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/memos" element={<MemosPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  );
}
