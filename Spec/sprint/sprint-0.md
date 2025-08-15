🌱 Sprint 0 – Spécifications & choix techniques

🎯 Objectifs

- Établir le périmètre, l'architecture et les techno.
- Scaffolding monorepo minimal.

🧰 Choix techniques (provisoires pour prototypage)

- Backend (API): Node.js + TypeScript + Express
- Scraping (proto): Node.js + TypeScript + axios + cheerio
- UI (proto): page statique (HTML/CSS/JS). Migration possible vers React/Vite au sprint 5.
- Base de données: à confirmer au sprint 2 (PostgreSQL pressenti). Pour le proto: fichiers JSON.
- Orchestration: scripts npm simples (Docker/Compose au sprint 2+ si utile)

🏗️ Architecture (microservices)

- apps/web
- services/api
- services/scraper

✅ Critères d'acceptation

- [x] Dossier `Spec` créé et rempli
- [x] API `/ping` retourne `{ pong: true }`
- [x] UI minimale affichée avec bouton fonctionnel (à vérifier dans le navigateur)
- [x] Scraper génère un échantillon JSON dans `services/scraper/data/`

⚠️ Risques

- Variabilité du HTML côté sources Euromillions.
- Limitations réseau et CORS. Prévoir mode mock.

🧾 Définition de Fini (DoD)

- [x] Référentiel initial créé (`Spec`, `apps/web`, `services/api`, `services/scraper`)
- [x] API `/ping` et `/health` OK
- [x] Scraper produit un échantillon
- [x] UI ouverte et validée manuellement
- [x] Plan détaillé rédigé (`Spec/PLAN.md` et sous‑plans)
- [x] ADRs clés présents (langages/runtime, base de données)
- [x] Outils transverses basiques: `.editorconfig`, scripts npm racine (pas de Docker pour l’instant)

📝 Checklist exécution

- [x] Installer dépendances: `npm --prefix services/api i` et `npm --prefix services/scraper i`
- [x] Lancer API: `npm run dev:api` puis vérifier `GET /health`
- [x] Exécuter scraper: `npm run dev:scraper` et vérifier `services/scraper/data/sample_draws.json`
- [x] Ouvrir `apps/web/index.html` et valider bouton + monitoring fictif
- [ ] Lire `Spec/PLAN.md` et documents de fonctionnalités pour valider le périmètre

📦 Livrables Sprint 0

- Arborescence monorepo, documents Spec et ADR, scripts et compose
- Prototypes minimaux livrés et testés manuellement

