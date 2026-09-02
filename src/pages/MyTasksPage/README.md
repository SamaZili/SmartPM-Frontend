# SmartPM Frontend

Application React pour la gestion de projets avec IA d'estimation.

## Stack Technique
- React 18 + TypeScript
- Vite
- CSS Modules (design system v2)
- Recharts (graphiques)
- jsPDF (export PDF)

## Installation
1. `npm install`
2. `npm run dev`

## Pages
- `/login` — Connexion
- `/dashboard` — Tableau de bord (chef de projet)
- `/projects` — Gestion des projets
- `/tasks` — Centre de contrôle des tâches (Liste / Kanban / Calendrier)
- `/my-tasks` — Tâches assignées (développeur)
- `/profile` — Profil utilisateur

## Fonctionnalités
- ✅ Assignation de tâches (PM ↔ Développeur)
- ✅ Workflow Accepter → Commencer → Terminer
- ✅ Notifications en temps réel (cloche + email)
- ✅ Recherche + filtres
- ✅ Deadlines + priorités
- ✅ Vue Kanban (drag & drop)
- ✅ Vue Calendrier
- ✅ Export PDF
- ✅ Estimation IA (intégration FastAPI)
- ✅ Design v2 professionnel (badges soft, boutons plats)

## Architecture
- Pages : composants de page
- Features : logique métier (hooks + API)
- Components : composants réutilisables
- Types : interfaces TypeScript