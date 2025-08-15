🧠 Fonctionnalité: Gestion des IA

🎯 Objectif

- Enregistrer/lister les IA participantes et stocker leur dernière combinaison prédite.

🗂️ Modèle de données

- ia { id, name, owner, description, created_at }
- ia_prediction { ia_id, draw_ref (historique utilisé), numbers[5], stars[2], created_at }

🧩 API

- GET /ia
- POST /ia { name, owner, description }
- GET /ia/:id
- POST /ia/:id/prediction { numbers, stars, draw_ref }
- GET /ia/:id/prediction/latest

🛠️ Tâches

- Définir format de prédiction et validations (unicité numbers, ranges)
- Créer service `registry-ia` (DB + API interne)
- Connecter gateway `services/api`

✅ Critères d’acceptation

- CRUD IA opérationnel, dépôt de dernière prédiction fonctionnel

📝 Checklist d’avancement

- [ ] Schémas de données validés
- [ ] Endpoints CRUD IA disponibles
- [ ] Endpoint dépôt de prédiction opérationnel
- [ ] Validation numbers/stars (unicité, ranges)

