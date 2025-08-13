Proto scraping – services/scraper

Objectif

- Récupérer un petit échantillon de tirages Euromillions (3 tirages) depuis une source publique.
- Basculer automatiquement en mock si la structure source change.

Commande

- npm install
- npm run dev

Résultat

- Fichier data/sample_draws.json contenant 3 tirages (réels si parsing réussi, sinon mock).

Évolution

- Sprint 2: scraping complet, normalisation, séparation train/test, persistance en base.

