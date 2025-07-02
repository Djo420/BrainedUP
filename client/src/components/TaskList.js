import React from "react";
import TaskCard from "./TaskCard";

export default function TaskList({ tasks, onToggle, onDelete }) {
  if (!tasks.length) return <p>No tasks yet.</p>;
  return (
    <div className="mt-4">
      {tasks.map(t => (
        <TaskCard
          key={t.id}
          task={t}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}