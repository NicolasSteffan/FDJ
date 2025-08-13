🗺️ Plan détaillé – Répertoires et sous‑plans par items

Arborescence (cible)

- apps/
  - web/ — UI (dashboard, déclenchements manuels, monitoring)
- services/
  - api/ — Gateway HTTP (agrège et expose API publiques)
  - scraper/ — Récupération/normalisation des tirages Euromillions
  - simulator/ — Simulation de nouveau tirage (sprint 3)
  - registry-ia/ — Gestion des IA, dernière prédiction (sprint 3)
  - gains/ — Calcul des gains, historique (sprint 4)
  - scheduler/ — Automatisation (sprint 6)
- Spec/
  - fonctionnalite/ — Plans par fonctionnalité
  - sprint/ — Plans par sprint
  - adr/ — Décisions d’architecture

Sous‑plans par items

- Scraping — `fonctionnalite/scraping.md`
- Gestion des IA — `fonctionnalite/gestion-ia.md`
- Simulation — `fonctionnalite/simulation.md`
- Calcul des gains — `fonctionnalite/calcul-gains.md`
- Dashboard — `fonctionnalite/dashboard.md`
- Déclenchement manuel — `fonctionnalite/declenchement-manuel.md`
- Automatisation — `fonctionnalite/automatisation.md`

Standards transverses

- Conventions API: JSON, HTTP 2xx/4xx/5xx, erreurs typées `{ code, message }`
- Observabilité: logs structurés (JSON), métriques basiques (req/s, latence, erreurs)
- Qualité: lint, tests unitaires par service, READMEs à jour
- Données: schémas versionnés, migrations documentées

