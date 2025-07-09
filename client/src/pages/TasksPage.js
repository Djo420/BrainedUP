import React, { useState, useEffect } from "react";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";

export default function TasksPage({ tasks, onAdd, onToggle, onUpdate, onDelete }) {
  const [hideCompleted, setHideCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTopBtn(window.scrollY > 200);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleEdit = task => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleSave = payload => {
    onUpdate(editingTask.id, {
      ...payload,
      last_reset: new Date().toISOString()
    });
    setEditingTask(null);
    setShowModal(false);
  };

  const nextReset = t => {
    const now = Date.now();
    const last = new Date(t.last_reset).getTime();
    if (t.type === "Timer-based") {
      const ms =
        t.unit === "Minutes" ? t.cycle * 60000 :
        t.unit === "Hours"   ? t.cycle * 3600000 :
        t.unit === "Days"    ? t.cycle * 86400000 :
        t.unit === "Weeks"   ? t.cycle * 7 * 86400000 :
        0;
      return (t.completed ? last : now) + ms;
    }
    if (t.cycle === "Daily") {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
    }
    const dt = new Date(last);
    if (t.cycle === "Weekly")  { dt.setDate(dt.getDate() + (7 - dt.getDay())); dt.setHours(0,0,0,0); }
    if (t.cycle === "Monthly") { dt.setMonth(dt.getMonth()+1); dt.setDate(1); dt.setHours(0,0,0,0); }
    if (t.cycle === "Yearly")  { dt.setFullYear(dt.getFullYear()+1); dt.setMonth(0); dt.setDate(1); dt.setHours(0,0,0,0); }
    return dt.getTime();
  };

  const sorted = [...tasks].sort((a, b) => {
    if (a.priority && !b.priority) return -1;
    if (!a.priority && b.priority) return 1;
    const now = Date.now();
    const diffA = nextReset(a) - now;
    const diffB = nextReset(b) - now;
    if (diffA !== diffB) return diffA - diffB;
    return a.name.localeCompare(b.name);
  });

  const remaining = sorted.filter(t => !t.completed);
  const completed = sorted.filter(t => t.completed);

  return (
    <div className="container-fluid px-3 pb-3">
      <div className="d-flex justify-content-end gap-2 my-3">
        <button
          className="btn btn-outline-dark btn-sm"
          style={{
            minWidth: 130,
            minHeight: 30,
            backgroundColor: "#fff",
            color:           "#000",
            border:          "1px solid #000"
          }}
          onClick={() => { setEditingTask(null); setShowModal(true); }}
          onMouseEnter={e => e.currentTarget.style.fontWeight = "bold"}
          onMouseLeave={e => e.currentTarget.style.fontWeight = "normal"}
        >
          Add Task
        </button>
        <button
          className="btn btn-outline-dark btn-sm"
          style={{
            minWidth: 130,
            minHeight: 30,
            backgroundColor: "#fff",
            color:           "#000",
            border:          "1px solid #000"
          }}
          onClick={() => setHideCompleted(!hideCompleted)}
          onMouseEnter={e => e.currentTarget.style.fontWeight = "bold"}
          onMouseLeave={e => e.currentTarget.style.fontWeight = "normal"}
        >
          {hideCompleted ? "Show Completed" : "Hide Completed"}
        </button>
      </div>

      <h2>Remaining Tasks</h2>
      {remaining.length > 0 ? (
        remaining.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={handleEdit}
            onDelete={onDelete}
          />
        ))
      ) : (
        <p className="text-muted">No remaining tasks.</p>
      )}

      {!hideCompleted && (
        <>
          <h2 className="mt-4">Completed Tasks</h2>
          {completed.length > 0 ? (
            completed.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onEdit={handleEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <p className="text-muted">No completed tasks.</p>
          )}
        </>
      )}

      <TaskModal
        show={showModal}
        onHide={() => { setShowModal(false); setEditingTask(null); }}
        onAdd={onAdd}
        onSave={handleSave}
        initialTask={editingTask}
      />

          {showTopBtn && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="btn btn-outline-dark btn-sm"
              style={{
                minWidth:       80,
                minHeight:      30,
                backgroundColor:"#fff",
                color:          "#000",
                border:         "1px solid #000",
                position:       "fixed",
                bottom:         "0.8rem",
                right:          "2.5rem"
              }}
              onMouseEnter={e => e.currentTarget.style.fontWeight = "bold"}
              onMouseLeave={e => e.currentTarget.style.fontWeight = "normal"}
            >
              ↑ Top
            </button>
          )}
    </div>
  );
}