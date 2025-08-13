## Prompt opérationnel pour demain matin

Contexte:
- Projet: FDJ/proto/scraper-sample
- Objectif: Scraping EuroMillions (tirage + Étoile+) avec UI locale et journaux.
- Règle immuable: ne pas modifier/renommer/supprimer les `.bat/.ps1` de base; créer variantes si besoin.

Checklist démarrage:
1) `cd proto/scraper-sample`
2) `npm i`
3) `node server.mjs`
4) Ouvrir `http://localhost:5174/ui/index.html`

Tests rapides:
- `http://localhost:5174/api/scrape?date=2025-08-08`
- `type data\tirage.json`
- `type data\tirage_etoile.json`
- `type data\journal_proto.log`

Diagnostics Étoile+:
- Si vide: lancer `log_gains_etoile.bat`, puis `type data\journal_gains_etoile.log`.
- Attendu pour 2025-08-08: fallback `euromillones` avec 13 lignes.

Actions si régression:
- Comparer `data/journal_proto.log` vs `data/journal_gains_etoile.log`.
- Vérifier regex PDJ/LBN et fallback EuroMillones identiques entre Node et PS.

Commande simplifiée:
- Double‑cliquer `proto/scraper-sample/go.bat`.

