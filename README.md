🌟 FDJ – Concours de prévisions IA sur Euromillions

Bienvenue! Ce projet organise un concours de prévisions statistiques entre IA à partir des tirages Euromillions, avec une architecture en microservices simple et modulaire.

🔧 Structure (Sprint 0–1)

- `Spec/` — documentation vivante (spécifications, sprints, ADR)
- `apps/web` — proto UI minimal (fond, menu, bouton, monitoring fictif)
- `services/api` — proto backend (API ping/pong)
- `services/scraper` — proto scraping (échantillon minimal)

🚀 Démarrage rapide

- API
  - cd `services/api`
  - `npm install`
  - `npm run dev`
  - Ouvrir `http://localhost:3001/ping` → `{ pong: true }`

- UI
  - Ouvrir `apps/web/index.html` dans un navigateur

- Scraper
  - cd `services/scraper`
  - `npm install`
  - `npm run dev`
  - Les données sont sauvegardées dans `services/scraper/data/`

📚 Méthodologie

- Agile par sprints, livrables fréquents
- Chaque microservice possède son README
- Documentation centralisée dans `Spec/`

✅ Checklist d’avancement (Sprint 0)

- [x] Arborescence monorepo créée (`Spec`, `apps/web`, `services/api`, `services/scraper`)
- [x] API dev lancée et `/ping`/`/health` OK
- [x] Scraper exécuté et `data/sample_draws.json` généré
- [x] UI ouverte et bouton/monitoring vérifiés manuellement
- [x] Plan & ADR initiaux rédigés (`Spec/PLAN.md`, `Spec/adr/*`)

