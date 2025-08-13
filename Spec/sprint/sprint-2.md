🔍 Sprint 2 – Scraping complet & stockage

📦 Livrables

- Scraping historique complet, normalisé
- Séparation 100 derniers (test) vs reste (train)
- Persistance en DB

🛠️ Tâches

- Choix DB et schémas (draws, payouts)
- Implémentation scraping robuste + retry
- Normalisation/validation
- Migrations et import initial
- Endpoints lecture basiques (/draws, /draws/latest)
- Ajouter un test UI/UX post-scraping: valider la pagination Historique sur un échantillon suffisant
  - Étapes: déclencher scraping (batch), recharger UI, vérifier page X/Y, navigation et rendu des boules/étoiles
  - Condition: à réaliser après validation du scraping (actuellement données simulées insuffisantes)

✅ Critères d’acceptation

- Données complètes, sans doublons, endpoints OK

