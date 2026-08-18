import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../features/Projects/hooks/useProjects';
import { useTasks } from '../../features/Tasks/hooks/useTasks';
import { useEstimations } from '../../features/Dashboard/hooks/useEstimations';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import { useAuth } from '../../features/Auth/hooks/useAuth';
import { Project, Task, TaskPriority } from '../../types';
import AssigneeSelect from '../../features/Tasks/components/AssigneeSelect';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import styles from './TasksPage.module.css';

type StatusFilter = 'tous' | 'a_faire' | 'en_cours' | 'terminee';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'tous', label: 'Tous' },
  { value: 'a_faire', label: 'À faire' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'terminee', label: 'Terminée' },
];

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: '🟢 Basse',
  medium: '🟡 Moyenne',
  high: '🟠 Haute',
  urgent: '🔴 Urgente',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444',
};

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { tasks, addTask, updateTaskStatus, removeTask } = useTasks(selectedProject?.id || null);
  const { estimations, isEstimating, handleEstimate } = useEstimations(selectedProject?.id || null, tasks);

  // ✅ A : Recherche + filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('tous');

  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    status: 'a_faire',
    assigned_to: null as number | null,
    due_date: '',
    priority: 'medium' as TaskPriority,
  });

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    assigned_to: null as number | null,
    due_date: '',
    priority: 'medium' as TaskPriority,
  });

  // ✅ B : Modale de confirmation (remplace window.confirm)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const { message, showMessage } = useTemporaryMessage();

  // ✅ A : filtrage en temps réel
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchStatus = statusFilter === 'tous' || t.status === statusFilter;
      const term = searchTerm.toLowerCase();
      const matchSearch =
        term === '' ||
        t.name.toLowerCase().includes(term) ||
        (t.description || '').toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }, [tasks, statusFilter, searchTerm]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTask.name.trim()) {
      showMessage('Veuillez remplir tous les champs', 3000, 'error');
      return;
    }
    try {
      await addTask(selectedProject.id, {
        name: newTask.name,
        description: newTask.description || undefined,
        status: newTask.status,
        complexity: 'moyenne',
        assigned_to: newTask.assigned_to,
        due_date: newTask.due_date || null,
        priority: newTask.priority,
      });
      setNewTask({ name: '', description: '', status: 'a_faire', assigned_to: null, due_date: '', priority: 'medium' });
      showMessage('Tâche ajoutée avec succès !');
    } catch {
      showMessage('Erreur lors de l\'ajout.', 5000, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProject || !deleteTarget) return;
    try {
      await removeTask(selectedProject.id, deleteTarget.id);
      showMessage('Tâche supprimée avec succès !');
    } catch {
      showMessage('Erreur lors de la suppression.', 3000, 'error');
    }
    setDeleteTarget(null);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setEditForm({
      name: task.name,
      description: task.description || '',
      assigned_to: task.assigned_to || null,
      due_date: task.due_date ? task.due_date.slice(0, 10) : '',
      priority: task.priority || 'medium',
    });
  };

  const handleEditSave = async (taskId: number) => {
    if (!editForm.name.trim()) {
      showMessage('Le nom de la tâche est requis', 3000, 'error');
      return;
    }
    try {
      if (!selectedProject) return;
      await updateTaskStatus(selectedProject.id, taskId, {
        status: tasks.find(t => t.id === taskId)?.status || 'a_faire',
        ...editForm,
        due_date: editForm.due_date || null,
      });
      setEditingTask(null);
      showMessage('Tâche modifiée avec succès !');
    } catch {
      showMessage('Erreur lors de la modification.', 5000, 'error');
    }
  };

  const handleEditCancel = () => {
    setEditingTask(null);
    setEditForm({ name: '', description: '', assigned_to: null, due_date: '', priority: 'medium' });
  };

  const getEstimationForTask = (taskId: number) => estimations.find(e => e.task_id === taskId);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { a_faire: '#94a3b8', en_cours: '#f59e0b', terminee: '#10b981' };
    return colors[status] || '#64748b';
  };

  const getAssignmentStatusLabel = (status?: string | null) => {
    const labels: Record<string, string> = { pending: '⏳ En attente', accepted: '✅ Acceptée', in_progress: '🔄 En cours', completed: '🎉 Terminée' };
    return status ? labels[status] || status : 'Non assignée';
  };

  const getAssignmentStatusColor = (status?: string | null) => {
    const colors: Record<string, string> = { pending: '#f59e0b', accepted: '#3b82f6', in_progress: '#8b5cf6', completed: '#10b981' };
    return status ? colors[status] || '#64748b' : '#94a3b8';
  };

  // ✅ C : deadline + retard
  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'terminee') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.due_date) < today;
  };

  const formatDueDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : null);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  const userName = user?.name || 'Utilisateur';
  const userRole = user?.type === 'chef_de_projet' ? 'Chef de projet' : 'Développeur';

  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}><span className={styles.logoLetter}>S</span></div>
          <h1 className={styles.logoText}>SmartPM</h1>
        </div>
        <nav className={styles.navMenu}>
          <button onClick={() => navigate('/dashboard')} className={styles.navButton}>📊 Tableau de bord</button>
          <button onClick={() => navigate('/projects')} className={styles.navButton}>📁 Projets</button>
          <button className={`${styles.navButton} ${styles.navButtonActive}`}>✅ Tâches</button>
          <button onClick={() => navigate('/my-tasks')} className={styles.navButton}>📥 Mes Tâches</button>
          <button onClick={() => navigate('/profile')} className={styles.navButton}>👤 Profil</button>
        </nav>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>{userInitial}</div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>{userName}</p>
            <p className={styles.userRole}>{userRole}</p>
          </div>
          <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }} className={styles.logoutBtn}>
            Déconnexion
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Gestion des Tâches</h1>
        {message && <div className={styles.alert}>{message}</div>}

        <section className={styles.section}>
          <h2>Sélectionnez un projet</h2>
          <div className={styles.projectsGrid}>
            {projects.map((project: Project) => (
              <div
                key={project.id}
                className={`${styles.projectCard} ${selectedProject?.id === project.id ? styles.selected : ''}`}
                onClick={() => setSelectedProject(project)}
              >
                <div className={styles.projectIcon}>{project.name.charAt(0).toUpperCase()}</div>
                <h3>{project.name}</h3>
                <p className={styles.projectDesc}>{project.description || 'Aucune description'}</p>
                <span className={styles.statusBadge}>{project.status}</span>
              </div>
            ))}
          </div>
        </section>

        {selectedProject && (
          <section className={styles.section}>
            <h2>Tâches pour : <span className={styles.highlight}>{selectedProject.name}</span></h2>

            {/* ✅ A : Barre de recherche + filtres par statut */}
            <div className={styles.toolbar}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="🔍 Rechercher une tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className={styles.filterChips}>
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    className={`${styles.chip} ${statusFilter === f.value ? styles.chipActive : ''}`}
                    onClick={() => setStatusFilter(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddTask} className={styles.taskForm}>
              <input
                type="text"
                placeholder="Nom de la tâche..."
                value={newTask.name}
                onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                required
              />
              <textarea
                placeholder="Description..."
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                rows={2}
              />
              <div className={styles.formRow}>
                <select value={newTask.status} onChange={(e) => setNewTask({...newTask, status: e.target.value})}>
                  <option value="a_faire">À faire</option>
                  <option value="en_cours">En cours</option>
                  <option value="terminee">Terminée</option>
                </select>
                <select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value as TaskPriority})}>
                  <option value="low">🟢 Priorité basse</option>
                  <option value="medium">🟡 Priorité moyenne</option>
                  <option value="high">🟠 Priorité haute</option>
                  <option value="urgent">🔴 Urgente</option>
                </select>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                />
              </div>
              <AssigneeSelect
                value={newTask.assigned_to}
                onChange={(userId: number | null) => setNewTask({...newTask, assigned_to: userId})}
                className={styles.assigneeSelect}
              />
              <button type="submit" className={styles.primaryBtn}>+ Ajouter une tâche</button>
            </form>

            <div className={styles.tasksList}>
              {filteredTasks.map((task: Task) => {
                const estimation = getEstimationForTask(task.id);
                const overdue = isOverdue(task);

                return (
                  <div key={task.id} className={styles.taskCard}>
                    {editingTask?.id === task.id ? (
                      <div className={styles.editMode}>
                        {editingTask.assignedTo && (
                          <div className={styles.alreadyAssigned}>
                            ✅ Déjà assignée à : <strong>{editingTask.assignedTo.name}</strong> — {getAssignmentStatusLabel(editingTask.assignment_status)}
                          </div>
                        )}
                        <div className={styles.formGroup}>
                          <label>Nom de la tâche</label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({...editForm, name: e.target.value})}
                            className={styles.input}
                            autoFocus
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Description</label>
                          <textarea
                            value={editForm.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm({...editForm, description: e.target.value})}
                            className={styles.textarea}
                            rows={2}
                          />
                        </div>
                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label>Priorité</label>
                            <select value={editForm.priority} onChange={(e) => setEditForm({...editForm, priority: e.target.value as TaskPriority})} className={styles.input}>
                              <option value="low">🟢 Basse</option>
                              <option value="medium">🟡 Moyenne</option>
                              <option value="high">🟠 Haute</option>
                              <option value="urgent">🔴 Urgente</option>
                            </select>
                          </div>
                          <div className={styles.formGroup}>
                            <label>Deadline</label>
                            <input type="date" value={editForm.due_date} onChange={(e) => setEditForm({...editForm, due_date: e.target.value})} className={styles.input} />
                          </div>
                        </div>
                        <div className={styles.formGroup}>
                          <label>Assigné à</label>
                          <AssigneeSelect
                            value={editForm.assigned_to}
                            onChange={(userId: number | null) => setEditForm({...editForm, assigned_to: userId})}
                            className={styles.input}
                          />
                        </div>
                        <div className={styles.editActions}>
                          <button onClick={() => handleEditSave(task.id)} className={styles.saveBtn}>✅ Sauvegarder</button>
                          <button onClick={handleEditCancel} className={styles.cancelBtn}>❌ Annuler</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={styles.taskHeader}>
                          <h4>{task.name}</h4>
                          <span className={styles.taskStatus} style={{ backgroundColor: getStatusColor(task.status) }}>
                            {task.status === 'a_faire' ? 'À faire' : task.status === 'en_cours' ? 'En cours' : 'Terminée'}
                          </span>
                        </div>
                        <p className={styles.taskDesc}>{task.description || 'Aucune description'}</p>

                        {/* ✅ C : Badges priorité + deadline */}
                        <div className={styles.badgesRow}>
                          <span className={styles.priorityBadge} style={{ backgroundColor: PRIORITY_COLORS[task.priority || 'medium'] }}>
                            {PRIORITY_LABELS[task.priority || 'medium']}
                          </span>
                          {formatDueDate(task.due_date) && (
                            <span className={`${styles.dueBadge} ${overdue ? styles.dueBadgeOverdue : ''}`}>
                              {overdue ? '⚠️ En retard — ' : '📅 '} {formatDueDate(task.due_date)}
                            </span>
                          )}
                        </div>

                        {task.assignedTo && (
                          <div className={styles.assignmentInfo}>
                            <span className={styles.assignmentLabel}>👤 Assigné à :</span>
                            <span className={styles.assignmentName}>{task.assignedTo.name}</span>
                            <span className={styles.assignmentStatus} style={{ backgroundColor: getAssignmentStatusColor(task.assignment_status) }}>
                              {getAssignmentStatusLabel(task.assignment_status)}
                            </span>
                          </div>
                        )}

                        <div className={styles.taskActions}>
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(selectedProject.id, task.id, { status: e.target.value })}
                            className={styles.statusSelect}
                          >
                            <option value="a_faire">À faire</option>
                            <option value="en_cours">En cours</option>
                            <option value="terminee">Terminée</option>
                          </select>
                          <button onClick={() => handleEditClick(task)} className={styles.editBtn} disabled={isEstimating}>✏️ Modifier</button>
                          <button
                            onClick={() => handleEstimate(task.id)}
                            disabled={isEstimating || !!estimation}
                            className={styles.aiBtn}
                            style={estimation ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                          >
                            {isEstimating ? '⏳...' : estimation ? '✅ Déjà estimée' : '🤖 Estimer via IA'}
                          </button>
                          <button onClick={() => setDeleteTarget(task)} className={styles.deleteBtn}>🗑️</button>
                        </div>
                        {estimation && (
                          <div className={styles.estimationResult}>
                            <div className={styles.estimationHeader}>
                              <span className={styles.estimationTitle}>📊 Résultat de l'estimation</span>
                              <span className={styles.estimationDate}>{new Date(estimation.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className={styles.estimationGrid}>
                              <div className={styles.estimationItem}>
                                <span className={styles.estimationLabel}>Effort estimé</span>
                                <span className={styles.estimationValue}>{estimation.predicted_effort} heures</span>
                              </div>
                              <div className={styles.estimationItem}>
                                <span className={styles.estimationLabel}>Confiance IA</span>
                                <span className={styles.estimationValue}>{Math.round(estimation.confidence_score * 100)}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
              {filteredTasks.length === 0 && (
                <div className={styles.taskEmpty}>Aucune tâche ne correspond à votre recherche.</div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* ✅ B : Modale de confirmation professionnelle */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Supprimer cette tâche ?"
        message={`La tâche "${deleteTarget?.name || ''}" sera définitivement supprimée.`}
        confirmLabel="🗑️ Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default TasksPage;