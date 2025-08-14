# Changelog FDJ Projet

## [v0.000B] - 2025-08-14
### État: "C'est le bordel pré-Sprint 2"

**Problèmes identifiés à corriger :**
- ❌ Dernier tirage moisi (données simulées défaillantes)
- ❌ Interface incohérente entre sections
- ❌ Endpoints API mal synchronisés
- ❌ Données de scraping non persistées
- ❌ Navigation UI cassée par endroits
- ❌ Pas de go.bat unifié pour le démarrage

**État technique :**
- Commit: `bcc5843` - Sprint 2 spécifié mais non implémenté
- Sprint 1: Partiellement fonctionnel avec bugs
- Base de données: Non implémentée (still mocks)
- Scraper: Fonctionnel mais données non intégrées à l'UI

**Prochaines étapes Sprint 2 :**
1. Nettoyer l'interface utilisateur
2. Implémenter la base de données SQLite
3. Corriger le système de scraping et import
4. Créer un go.bat robuste
5. Synchroniser API ↔ UI ↔ Database

---

## [v0.000A] - Initial
### État: Sprint 0 terminé
- ✅ Structure monorepo
- ✅ API basique fonctionnelle  
- ✅ UI minimal
- ✅ Scraper prototype