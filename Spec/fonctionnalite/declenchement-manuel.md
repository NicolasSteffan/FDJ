🕹️ Fonctionnalité: Déclenchement manuel

🎯 Objectif

- Permettre de lancer manuellement scraping, simulation, calcul des gains depuis l’UI.

🧩 API (gateway)

- POST /ops/scrape
- POST /ops/simulate
- POST /ops/gains/calcule

🖥️ UI

- Panneau Opérations avec boutons, journal des exécutions

✅ Critères d’acceptation

- Actions exécutées et feedback visible (succès/erreurs)

📝 Checklist d’avancement

- [ ] Boutons d’action dans l’UI
- [ ] Endpoints gateway `/ops/*`
- [ ] Journal des exécutions

