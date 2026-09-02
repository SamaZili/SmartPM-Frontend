import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Project, Task } from '../../../types';

const STATUS_LABELS: Record<string, string> = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  terminee: 'Terminée',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
  urgent: 'Urgente',
};

export function exportTasksToPdf(project: Project, tasks: Task[]): void {
  const doc = new jsPDF();

  // ===== En-tête vert SmartPM =====
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('SmartPM - Rapport des Tâches', 14, 13);
  doc.setFontSize(11);
  doc.text(`Projet : ${project.name}`, 14, 21);
  doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 14, 27);

  // ===== Statistiques =====
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === 'a_faire').length;
  const inProgress = tasks.filter((t) => t.status === 'en_cours').length;
  const done = tasks.filter((t) => t.status === 'terminee').length;
  const totalEffort = tasks.reduce((acc, t) => acc + (t.estimation?.predicted_effort || 0), 0);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.text('Statistiques', 14, 40);
  doc.setFontSize(10);
  doc.text(
    `Total : ${total}   |   À faire : ${todo}   |   En cours : ${inProgress}   |   Terminées : ${done}   |   Effort IA total : ${totalEffort.toFixed(1)} h`,
    14,
    47
  );

  // ===== Tableau des tâches =====
  autoTable(doc, {
    startY: 53,
    head: [['Tâche', 'Statut', 'Priorité', 'Deadline', 'Assigné à', 'Effort IA (h)']],
    body: tasks.map((t) => [
      t.name,
      STATUS_LABELS[t.status] || t.status,
      PRIORITY_LABELS[t.priority || 'medium'] || 'Moyenne',
      t.due_date ? new Date(t.due_date).toLocaleDateString('fr-FR') : '—',
      t.assignedTo?.name || '—',
      t.estimation ? String(t.estimation.predicted_effort) : '—',
    ]),
    headStyles: { fillColor: [16, 185, 129] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    styles: { fontSize: 9 },
  });

  doc.save(`SmartPM_Rapport_${project.name.replace(/\s+/g, '_')}.pdf`);
}