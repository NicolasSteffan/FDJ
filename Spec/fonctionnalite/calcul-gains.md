🏆 Fonctionnalité: Calcul des gains

🎯 Objectif

- Calculer les gains par IA sur le dernier tirage (réel ou simulé), et historiser.

📏 Règles de scoring (résumé)

- Comptage des matches: nMatch (0..5), sMatch (0..2)
- Mapping vers rang officiel (5+2, 5+1, …, 2+0) et gains correspondants

🗂️ Modèle

- ia_gain { ia_id, draw_id, rank, amount, matches_numbers, matches_stars, created_at }

🧩 API

- POST /gains/calcule?draw_id=xxx
- GET /gains/ia/:id?limit=50
- GET /gains/cumul/ia/:id

🛠️ Tâches

- Implémenter matching et table de gains par rang
- Calcul cumulatif (vue matérialisée ou agrégé à la volée)
- Stockage et endpoints de lecture

✅ Critères d’acceptation

- Parité avec grilles officielles de gains (tests unitaires sur cas connus)

📝 Checklist d’avancement

- [ ] Matching numbers/stars implémenté
- [ ] Table des rangs et montants disponible
- [ ] Endpoints de lecture (historique, cumul)

