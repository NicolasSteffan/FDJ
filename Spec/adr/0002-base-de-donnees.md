📝 ADR 0002 – Base de données

📍 Contexte

- Données structurées (tirages, gains, prédictions), requêtes relationnelles.

✅ Décision

- PostgreSQL comme base relationnelle principale.
- Pour prototypage: JSON fichiers, puis migration vers PostgreSQL au sprint 2.

🎯 Conséquences

- Schémas versionnés, migrations (tools à définir au sprint 2).
- Possibilité d’indexer par date, IA, rangs.

