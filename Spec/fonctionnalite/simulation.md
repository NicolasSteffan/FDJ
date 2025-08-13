🎲 Fonctionnalité: Simulation de tirage

🎯 Objectif

- Générer un nouveau tirage (aléatoire, respectant règles Euromillions) et l’associer aux dernières prédictions de chaque IA.

📏 Règles

- numbers: 5 distincts entre 1..50
- stars: 2 distincts entre 1..12

🧩 API

- POST /simulate → { draw, associations: [{ ia_id, prediction }] }

🛠️ Tâches

- Service `simulator`: génération sécurisée, seed optionnelle (tests)
- Récupérer dernière prédiction pour chaque IA
- Stocker tirage simulé (table simulated_draws)

✅ Critères d’acceptation

- Tirage valide généré, associations complètes enregistrées

📝 Checklist d’avancement

- [ ] Génération tirage (seedable) implémentée
- [ ] Récupération des dernières prédictions par IA
- [ ] Stockage du tirage simulé

