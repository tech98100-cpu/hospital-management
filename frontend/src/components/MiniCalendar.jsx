import { useState } from "react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateKey(year, month, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export default function MiniCalendar({ selectedDate, onSelect }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  }

  return (
    <div className="mini-calendar">
      <div className="cal-header">
        <button type="button" className="cal-nav" onClick={prevMonth}>‹</button>
        <span className="cal-title">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button type="button" className="cal-nav" onClick={nextMonth}>›</button>
      </div>
      <div className="cal-grid cal-labels">
        {DAY_LABELS.map(l => <span key={l}>{l}</span>)}
      </div>
      <div className="cal-grid">
        {cells.map((day, i) => {
          if (!day) return <span key={i} className="cal-cell empty"></span>;
          const key = toDateKey(viewYear, viewMonth, day);
          const isPast = key < todayKey;
          const isSelected = key === selectedDate;
          const isToday = key === todayKey;
          return (
            <button
              key={i}
              type="button"
              className={`cal-cell ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
              disabled={isPast}
              onClick={() => onSelect(key)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
