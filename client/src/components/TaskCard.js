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
  let skipReset = true;
  const computeNext = () => {
    const now = Date.now();
    let nextMs = new Date(task.last_reset).getTime();
    if (task.type === "Timer-based") {
      if (task.unit === "Minutes") nextMs += task.cycle * 60000;
      if (task.unit === "Hours")   nextMs += task.cycle * 3600000;
      if (task.unit === "Days")    nextMs += task.cycle * 86400000;
      if (task.unit === "Weeks")   nextMs += task.cycle * 604800000;
    } else {
      const dt = new Date(task.last_reset);
      if (task.cycle === "Daily") {
        dt.setHours(0,0,0,0);
        dt.setDate(dt.getDate() + 1);
      }
      if (task.cycle === "Weekly") {
        dt.setHours(0,0,0,0);
        dt.setDate(dt.getDate() + (7 - dt.getDay()));
      }
      if (task.cycle === "Monthly") {
        dt.setHours(0,0,0,0);
        dt.setMonth(dt.getMonth() + 1);
        dt.setDate(1);
      }
      if (task.cycle === "Yearly") {
        dt.setHours(0,0,0,0);
        dt.setFullYear(dt.getFullYear() + 1);
        dt.setMonth(0);
        dt.setDate(1);
      }
      nextMs = dt.getTime();
    }
    const diff = nextMs - now;
    if (diff <= 0) {
      if (skipReset) {
        skipReset = false;
      } else {
        onToggle(task.id, { completed: false });
      }
      setTimeLeft("");
      return;
    }
    skipReset = false;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    setTimeLeft(`${d > 0 ? d + "d " : ""}${h > 0 ? h + "h " : ""}${m}m ${s}s`);
  };
  computeNext();
  const iv = setInterval(computeNext, 1000);
  return () => {
    canceled = true;
    clearInterval(iv);
  };
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
    width:      isStack ? "auto" : `${timerColW}px`,
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
    width:          isStack ? "auto" : `${actionsColW}px`,
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