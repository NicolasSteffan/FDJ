🕸️ Fonctionnalité: Scraping des données – Euromillions

🎯 Objectif

- Récupérer l’historique complet des tirages et gains depuis des sources fiables, normaliser et stocker.

🔌 Entrées / Sources

- Pages résultats officielles/miroirs (à confirmer), limites anti‑bot possibles.
- Fallback: API communautaire si disponible (à vérifier au sprint 2).

📤 Sorties

- Données normalisées: tirage { date ISO, numbers[5], stars[2], jackpots, payouts par rang }.
- Séparation: 100 derniers = test, reste = entraînement.

💾 Stockage (sprint 2)

- DB cible: PostgreSQL (pressenti). Tables: draws, payouts, sources.
- Proto: fichiers JSON temporaires.

🧩 API (exposition via `services/api`)

- GET /draws?limit=100
- GET /draws/:id
- GET /draws/latest

🛠️ Tâches

- Cartographier 1‑2 sources fiables et structure HTML/API
- Implémenter scraping robuste (timeouts, retries, user‑agent, rate limit)
- Normaliser schéma (validation)
- Dédupliquer et historiser (hash de tirage)
- Séparer train/test (100 derniers)
- Persister en DB + migrations

⚠️ Risques

- Changement de DOM, blocages anti‑bot → backoff + cache + fallback

✅ Critères d’acceptation

- Dataset complet reconstitué, cohérence champs validée, 100 derniers isolés

📝 Checklist d’avancement

- [x] Prototype: échantillon minimal généré
- [ ] Sources fiables sélectionnées et documentées
- [ ] Scraping complet implémenté (retry, rate limit)
- [ ] Normalisation et validation des schémas
- [ ] Persistance DB et séparation train/test

