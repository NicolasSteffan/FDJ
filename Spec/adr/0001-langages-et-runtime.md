📝 ADR 0001 – Langages et runtime

📍 Contexte

- Besoin d’itérer vite en microservices, tooling mature, forte communauté.

✅ Décision

- Node.js LTS + TypeScript pour tous les services (API, scraper, scheduler, etc.).
- UI en web standard pour protos, migration vers framework (React/Vite) au sprint 5.

🎯 Conséquences

- Outils communs (tsc, tsx, eslint futur), réutilisation d’outils JS.
- Perf suffisante pour le scope; optimisation possible plus tard.

