import React from 'react';

interface HomePageProps {
  // Props typées pour le futur
}

const HomePage: React.FC<HomePageProps> = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Bienvenue sur SmartPM</h1>
      <p>Le tableau de bord de gestion de projets.</p>
      <a href="/login" style={{ color: '#007bff' }}>Aller à la connexion</a>
    </div>
  );
};

export default HomePage;