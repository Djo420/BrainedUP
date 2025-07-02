import React, { useState } from "react";

export default function AddTaskForm({ onAdd }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Timer-based");
  const [cycle, setCycle] = useState(0);
  const [unit, setUnit] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    onAdd({ name, type, cycle: Number(cycle), unit: unit || null });
    setName("");
    setCycle(0);
    setUnit("");
  };

  return (
    <form onSubmit={handleSubmit} className="row g-3 mb-4">
      <div className="col-md-4">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="form-control"
          placeholder="Task Name"
          required
        />
      </div>
      <div className="col-md-2">
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="form-select"
        >
          <option>Timer-based</option>
          <option>Reset-based</option>
        </select>
      </div>
      <div className="col-md-2">
        <input
          type="number"
          value={cycle}
          onChange={e => setCycle(e.target.value)}
          className="form-control"
          placeholder="Cycle"
          required
        />
      </div>
      <div className="col-md-2">
        <select
          value={unit}
          onChange={e => setUnit(e.target.value)}
          className="form-select"
        >
          <option value="">Unit</option>
          <option>Minutes</option>
          <option>Hours</option>
          <option>Days</option>
        </select>
      </div>
      <div className="col-md-2">
        <button type="submit" className="btn btn-primary w-100">
          Add
        </button>
      </div>
    </form>
  );
}