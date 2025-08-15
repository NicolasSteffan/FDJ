⏱️ Fonctionnalité: Automatisation

🎯 Objectif

- Planifier l’exécution des tâches (cron‑like) et gérer la configuration.

🗂️ Modèle

- job { id, name, cron, action, enabled, last_run, status }

🧩 API

- GET /jobs
- POST /jobs
- PATCH /jobs/:id { enabled, cron }
- POST /jobs/:id/run

🛠️ Tâches

- Service `scheduler` (node-cron ou équivalent)
- Persistance des jobs
- Sécurité: éviter doublons d’exécution (mutex)

✅ Critères d’acceptation

- Exécutions automatiques selon plan, logs disponibles

📝 Checklist d’avancement

- [ ] Service scheduler opérationnel
- [ ] CRUD des jobs via API
- [ ] Exécutions planifiées visibles dans les logs

