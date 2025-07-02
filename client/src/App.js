import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import TasksPage     from "./pages/TasksPage";
import EventsPage    from "./pages/EventsPage";
import ShoppingPage  from "./pages/ShoppingPage";
import FinancePage   from "./pages/FinancePage";
import MemosPage     from "./pages/MemosPage";
import CalendarPage  from "./pages/CalendarPage";
import SettingsPage  from "./pages/SettingsPage";

export default function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch("/tasks")
      .then(r => r.json())
      .then(setTasks)
      .catch(console.error);
  }, []);

  const handleAdd = async data => {
    console.log("Creating task:", data);
    try {
      const res = await fetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text}`);
      }
      const newTask = await res.json();
      console.log("Created:", newTask);
      setTasks(prev => [...prev, newTask]);
    } catch (err) {
      console.error("Add failed:", err);
      alert("Failed to add task. See console for details.");
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const res = await fetch(`/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    } catch (e) {
      alert("Update failed");
    }
  };

  const handleDelete = async id => {
    console.log("Deleting task:", id);
    try {
      const res = await fetch(`/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete task. See console for details.");
    }
  };

  return (
    <Router>
      <div className="bg-dark text-white min-vh-100">
        <nav className="navbar navbar-expand navbar-dark bg-dark sticky-top">
          <div className="container-fluid">
            <NavLink className="navbar-brand" to="/">BrainedUP</NavLink>
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <NavLink end className="nav-link" to="/">Dashboard</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/tasks">Tasks</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/events">Events</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/shopping">Shopping</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/finance">Finance</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/memos">Memos</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/calendar">Calendar</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/settings">Settings</NavLink>
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
            <Route path="/events"   element={<EventsPage />} />
            <Route path="/shopping" element={<ShoppingPage />} />
            <Route path="/finance"  element={<FinancePage />} />
            <Route path="/memos"    element={<MemosPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}