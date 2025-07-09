import React, { useState, useEffect, useRef } from "react";

export default function TaskCard({ task, onToggle, onDelete, onEdit }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isStack, setIsStack] = useState(false);
  const [localPriority, setLocalPriority] = useState(task.priority);
  const containerRef = useRef(null);

  const timerColW = 200;
  const actionsColW = 240;
  const titleMinW = 200;
  const collapseThreshold = timerColW + actionsColW + titleMinW + 32;

  useEffect(() => {
    setLocalPriority(task.priority);
  }, [task.priority]);

  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (let entry of entries) {
        setIsStack(entry.contentRect.width < collapseThreshold);
      }
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [collapseThreshold]);

  useEffect(() => {
  if (!task.completed) {
    setTimeLeft("");
    return;
  }
  let canceled = false;
  function getNextReset() {
    const now = Date.now();
    const base = new Date(task.last_reset).getTime();
    let nextMs = base;
    if (task.type === "Timer-based") {
      const unitMs = {
        Minutes: 60000,
        Hours:   3600000,
        Days:    86400000,
        Weeks:   7 * 86400000
      }[task.unit] || 0;
      nextMs = base + Number(task.cycle) * unitMs;
    } else if (task.type === "Reset-based") {
      if (task.cycle === "Daily") {
        const d = new Date();
        nextMs = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
      } else if (task.cycle === "Weekly") {
        const d = new Date();
        nextMs = new Date(d.getFullYear(), d.getMonth(), d.getDate() + (7 - d.getDay())).getTime();
      } else if (task.cycle === "Monthly") {
        const d = new Date();
        nextMs = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
      } else if (task.cycle === "Yearly") {
        const d = new Date();
        nextMs = new Date(d.getFullYear() + 1, 0, 1).getTime();
      }
    }
    return nextMs - now;
  }

  function update() {
    const diff = getNextReset();
    if (diff <= 0) {
      onToggle(task.id, { completed: false });
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    setTimeLeft(`${d > 0 ? d + "d " : ""}${h > 0 ? h + "h " : ""}${m}m ${s}s`);
  }

  update();
  const iv = setInterval(update, 1000);
  return () => clearInterval(iv);
}, [task, onToggle]);

  const handleComplete = () => {
    if (!task.completed) {
      onToggle(task.id, { completed: true, last_reset: new Date().toISOString() });
    } else {
      onToggle(task.id, { completed: false });
    }
  };

  const handlePriority = () => {
    const next = !localPriority;
    setLocalPriority(next);
    onToggle(task.id, { priority: next });
  };

  const isDone = task.completed;

  const cardStyle = {
    position:       "relative",
    backgroundColor:isDone?"#000":"#fff",
    border:         isDone?"1px solid #fff":"1px solid #000",
    marginBottom:   isDone?"0":"1rem"
  };

  const stripeStyle = {
    position:            "absolute",
    top:                 0,
    bottom:              0,
    left:               "-1px",
    width:               "5px",
    backgroundColor:     "#ffc107",
    borderTopLeftRadius: "0.25rem",
    borderBottomLeftRadius:"0.25rem",
    pointerEvents:       "none"
  };

  const containerStyle = {
    display:       "flex",
    flexDirection: isStack?"column":"row",
    alignItems:    "center",
    padding:       "1rem",
    gap:           "0.5rem"
  };

  const timerWrapperStyle = {
    display:    "flex",
    alignItems: "center",
    gap:        "0.5rem",
    width:      isStack?"auto":`${timerColW}px`,
    overflow:   "hidden",
    whiteSpace: "nowrap"
  };

  const titleStyle = {
    flex:         isStack?undefined:"1 1 auto",
    minWidth:     0,
    width:        isStack?"auto":undefined,
    whiteSpace:   "normal",
    overflow:     "visible",
    color:        isDone?"#fff":"#000"
  };

  const actionsStyle = {
    display:        "flex",
    gap:            "0.5rem",
    width:          isStack?"auto":`${actionsColW}px`,
    justifyContent: isStack?"center":"flex-end"
  };

  const buttonClass = isDone?"btn btn-sm btn-light text-dark":"btn btn-sm btn-dark text-white";

  return (
    <div className="card mb-3" style={cardStyle}>
      {localPriority && <div style={stripeStyle}/>}
      <div ref={containerRef} style={containerStyle}>
        <div style={timerWrapperStyle}>
          <span onMouseDown={e=>e.preventDefault()} onClick={handlePriority}
                style={{cursor:"pointer",userSelect:"none",fontSize:"1.5rem",color:localPriority?"#ffc107":"#6c757d"}}>
            {localPriority?"★":"☆"}
          </span>
          <span style={{color:isDone?"#fff":"#000"}}>
            {isDone&&timeLeft?timeLeft:"Available"}
          </span>
        </div>
        <div style={titleStyle}><strong>{task.name}</strong></div>
        <div style={actionsStyle}>
          <button onClick={handleComplete} className={buttonClass}
                  style={{minWidth:90,minHeight:32}}
                  onMouseEnter={e=>e.currentTarget.style.fontWeight="bold"}
                  onMouseLeave={e=>e.currentTarget.style.fontWeight="normal"}>
            {isDone?"Reset":"Complete"}
          </button>
          <button onClick={()=>onEdit(task)} className={buttonClass}
                  style={{minWidth:70,minHeight:32}}
                  onMouseEnter={e=>e.currentTarget.style.fontWeight="bold"}
                  onMouseLeave={e=>e.currentTarget.style.fontWeight="normal"}>
            Edit
          </button>
          <button onClick={()=>{if(window.confirm("Are you sure?"))onDelete(task.id)}} className={buttonClass}
                  style={{minWidth:70,minHeight:32}}
                  onMouseEnter={e=>e.currentTarget.style.fontWeight="bold"}
                  onMouseLeave={e=>e.currentTarget.style.fontWeight="normal"}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
