import React, { useState, useMemo } from 'react';
import { Task } from '../../types';
import styles from './TaskCalendar.module.css';

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const WEEKDAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

interface TaskCalendarProps {
  tasks: Task[];
}

const TaskCalendar: React.FC<TaskCalendarProps> = ({ tasks }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((t) => {
      if (!t.due_date) return;
      const key = t.due_date.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7; // Semaine commence lundi
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: (number | null)[] = [];
    for (let i = 0; i < offset; i++) result.push(null);
    for (let d = 1; d <= daysInMonth; d++) result.push(d);
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [year, month]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); } else { setMonth((m) => m - 1); }
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); } else { setMonth((m) => m + 1); }
  };

  const dateKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <button className={styles.navBtn} onClick={prevMonth}>←</button>
        <h3 className={styles.monthTitle}>{MONTHS_FR[month]} {year}</h3>
        <button className={styles.navBtn} onClick={nextMonth}>→</button>
      </div>

      <div className={styles.weekGrid}>
        {WEEKDAYS_FR.map((d) => (
          <div key={d} className={styles.weekday}>{d}</div>
        ))}
        {cells.map((day, i) => (
          <div
            key={i}
            className={`${styles.dayCell} ${day === null ? styles.dayEmpty : ''} ${day !== null && isToday(day) ? styles.dayToday : ''}`}
          >
            {day !== null && (
              <>
                <span className={styles.dayNumber}>{day}</span>
                <div className={styles.dayTasks}>
                  {(tasksByDate[dateKey(day)] || []).map((t) => (
                    <span
                      key={t.id}
                      className={`${styles.dayTaskChip} ${t.status === 'terminee' ? styles.chipDone : t.status === 'en_cours' ? styles.chipProgress : styles.chipTodo}`}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className={styles.legend}>
        <span><span className={styles.legendDot} style={{ background: '#94a3b8' }} /> À faire</span>
        <span><span className={styles.legendDot} style={{ background: '#f59e0b' }} /> En cours</span>
        <span><span className={styles.legendDot} style={{ background: '#10b981' }} /> Terminée</span>
      </div>
    </div>
  );
};

export default TaskCalendar;