import React, { useState } from 'react';
import { post } from '../services/api';
import { ApiResponse, Estimation, Task } from '../types';

interface DashboardPageProps {
  // On pourrait passer projectId et taskId via les props ou React Router params
  projectId: number;
  taskId: number;
  taskName: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ projectId, taskId, taskName }) => {
  const [estimation, setEstimation] = useState<Estimation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleEstimate = async () => {
    setIsLoading(true);
    setError('');
    setEstimation(null);

    try {
      // Appel strictement typé au backend Laravel
      // Nous envoyons rien dans le body (ou un body vide {}), et nous attendons une Estimation en retour
      const response: ApiResponse<Estimation> = await post<Estimation, Record<string, never>>(
        `/projects/${projectId}/tasks/${taskId}/estimate`,
        {}
      );

      if (response.success && response.data) {
        setEstimation(response.data);
      } else {
        setError(response.message || "L'estimation a échoué.");
      }
    } catch (err) {
      // Gestion d'erreur typée grâce à notre service api.ts
      setError(err instanceof Error ? err.message : "Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Tableau de Bord SmartPM</h1>
      
      <div style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h2>Tâche : {taskName}</h2>
        <p>ID Tâche: {taskId} | ID Projet: {projectId}</p>
        
        <button
          onClick={handleEstimate}
          disabled={isLoading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isLoading ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            marginTop: '1rem'
          }}
        >
          {isLoading ? 'Calcul en cours via IA...' : '🤖 Estimer l\'effort via IA'}
        </button>
      </div>

      {error && (
        <div style={{ color: '#dc3545', backgroundColor: '#f8d7da', padding: '1rem', borderRadius: '4px' }}>
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {estimation && (
        <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '1.5rem', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
          <h3>✅ Résultat de l'Estimation IA</h3>
          <p><strong>Effort prédit :</strong> {estimation.predicted_effort} heures</p>
          <p><strong>Score de confiance :</strong> {(estimation.confidence_score * 100).toFixed(0)}%</p>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '1rem' }}>
            Estimation générée le {new Date(estimation.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;