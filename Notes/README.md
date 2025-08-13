## Notes du proto (racine)

Ce dossier regroupe les informations utiles pour lancer, diagnostiquer et maintenir le proto.

### Lancement rapide
- Double‑clique `proto/scraper-sample/go.bat`
- Sinon en terminal:
  - `cd proto/scraper-sample`
  - `npm i`
  - `node server.mjs`
  - Ouvrir `http://localhost:5174/ui/index.html`

### Endpoints et sorties
- API déclencheur: `GET http://localhost:5174/api/scrape?date=YYYY-MM-DD`
- Sorties JSON:
  - `proto/scraper-sample/data/tirage.json`
  - `proto/scraper-sample/data/tirage_etoile.json`

### Journaux
- Côté serveur: `proto/scraper-sample/data/journal_proto.log`
  - Trace: TIRAGE (GET/HTTP, nb numéros/étoiles, nb lignes), ÉTOILE+ (PDJ/LBN GET/HTTP, nb lignes), écritures JSON
- Côté PowerShell (variante log): `proto/scraper-sample/data/journal_gains_etoile.log`
  - Trace: PDJ → LBN → fallback EuroMillones, nb lignes, écritures JSON

### Règle immuable
Ne jamais modifier/renommer/supprimer (lecture/exécution uniquement):
- `proto/scraper-sample/start_gains.bat`, `start_gains.ps1`
- `proto/scraper-sample/start_tirage.bat`, `start_tirage.ps1`
- `proto/scraper-sample/start_gains_etoile.bat`, `start_gains_etoile.ps1`
Créer une variante (`_v2`, `_alt`, etc.) si nécessaire et demander validation avant édition.

