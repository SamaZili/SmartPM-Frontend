import React, { useState } from 'react';
import { Task, TaskPriority } from '../../types';
import styles from './KanbanBoard.module.css';

type TaskStatus = 'a_faire' | 'en_cours' | 'terminee';

const COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: 'a_faire', label: '⏳ À faire', color: '#94a3b8' },
  { key: 'en_cours', label: '🔄 En cours', color: '#f59e0b' },
  { key: 'terminee', label: '✅ Terminée', color: '#10b981' },
];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#10b981', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444',
};

interface KanbanBoardProps {
  tasks: Task[];
  onMoveTask: (taskId: number, status: TaskStatus) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onMoveTask }) => {
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('text/plain', String(taskId));
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = Number(e.dataTransfer.getData('text/plain'));
    if (taskId) onMoveTask(taskId, status);
    setDragOverColumn(null);
  };

  return (
    <div className={styles.kanbanGrid}>
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div
            key={col.key}
            className={`${styles.kanbanColumn} ${dragOverColumn === col.key ? styles.kanbanColumnActive : ''}`}
            style={{ borderTopColor: col.color }}
            onDragOver={(e) => { e.preventDefault(); setDragOverColumn(col.key); }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            <div className={styles.columnHeader}>
              <span>{col.label}</span>
              <span className={styles.columnCount}>{colTasks.length}</span>
            </div>
            <div className={styles.columnBody}>
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  className={styles.kanbanCard}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                >
                  <div className={styles.cardTop}>
                    <span
                      className={styles.cardPriority}
                      style={{ backgroundColor: PRIORITY_COLORS[task.priority || 'medium'] }}
                    />
                    <h5>{task.name}</h5>
                  </div>
                  {task.assignedTo && <p className={styles.cardAssignee}>👤 {task.assignedTo.name}</p>}
                  {task.due_date && (
                    <p className={styles.cardDue}>📅 {new Date(task.due_date).toLocaleDateString('fr-FR')}</p>
                  )}
                  {task.estimation && (
                    <p className={styles.cardEstimation}>🤖 {task.estimation.predicted_effort}h</p>
                  )}
                </div>
              ))}
              {colTasks.length === 0 && <p className={styles.columnEmpty}>Déposez une tâche ici</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;