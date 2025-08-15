## Note: Gains Étoile+

### Sources et stratégie
- PDJ: `https://www.pdj.pf/resultats/resultats-de-leuro-millions-my-million/`
  - Chercher la section « Répartition des gains pour ce tirage », parser le tableau.
- LesBonsNumeros (LBN):
  - `https://www.lesbonsnumeros.com/euromillions/resultats/rapports-tirage-1866-vendredi-8-aout-2025.htm`
  - `https://www.lesbonsnumeros.com/euromillions/`
  - Chercher une table contenant « Option Etoile+ ».
- Fallback EuroMillones (breakdown général):
  - `https://www.euromillones.com/en/results/euromillions`
  - Tableau avec thead Category | Winners | Prize; filtrer les lignes dont la catégorie matche `^\d+\+\d+$`.

### JSON ciblé
```json
{
  "date": "YYYY-MM-DDT00:00:00.000Z",
  "provider": "<pdj|lesbonsnumeros|euromillones|none>",
  "endpoint": "<url source>",
  "etoilePlus": {
    "breakdown": [
      { "rankLabel": "3+1", "winners": 123, "amount": 11.23, "currency": "EUR" }
    ],
    "aggregate": null
  },
  "errors": [ { "provider": "pdj", "status": 200, "message": "no table" } ]
}
```

### Lancement
- Scripts PowerShell (immutables, lecture/exec uniquement):
  - `proto/scraper-sample/start_gains_etoile.bat` → écrit `data/tirage_etoile.json`
  - Variante log: `proto/scraper-sample/log_gains_etoile.bat` → écrit `data/journal_gains_etoile.log`
- Serveur Node:
  - `cd proto/scraper-sample && node server.mjs`
  - API: `GET /api/scrape?date=YYYY-MM-DD` → écrit `data/tirage.json` et `data/tirage_etoile.json`

### Journaux
- PowerShell: `proto/scraper-sample/data/journal_gains_etoile.log`
- Serveur: `proto/scraper-sample/data/journal_proto.log`

### Dépannage rapide
- Étoile+ vide: vérifier PDJ/LBN (HTTP 200 mais « rows=0 »), le fallback EuroMillones doit remplir 13 lignes pour 2025‑08‑08.
- UI vide: `http://localhost:5174/ui/index.html` (Ctrl+F5), vérifier que `node server.mjs` tourne.
- Chemins: exécuter depuis `proto/scraper-sample`.

