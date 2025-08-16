🔍 Sprint 2 – Scraping complet & stockage

> **📋 SUIVI DES TÂCHES :** Consultez la section "RESTE À FAIRE Sprint 2" en fin de document pour cocher l'avancement. Cette section doit toujours rester en fin de fichier.

📦 Livrables

- Scraping historique complet, normalisé
- Séparation 100 derniers (test) vs reste (train)
- Persistance en base SQLite locale
- Interface utilisateur avec accès direct à SQLite
- Sélecteur de source de données (JSON/SQLite) dans l'UI

## 🎯 Prérequis UI - Sélecteur de source

**Tâche préliminaire :**
- Ajouter un sélecteur dans les tableaux d'affichage des résultats permettant de basculer entre :
  - 📄 **Mode JSON** : lecture directe des fichiers JSON existants
  - 🗄️ **Mode SQLite** : accès direct à la base SQLite locale
- Interface simple (toggle, radio buttons ou dropdown)
- Permutation en temps réel sans rechargement de page

**Objectif :** Faciliter les tests et la migration progressive des données JSON vers SQLite.

## 🗂️ Organisation par fonctionnalité

### 1️⃣ **Base de données locale** (Foundation)
> Compléter entièrement avant de passer au scraping

**Choix technique :** SQLite (base locale, simple, pas de serveur)

**Tâches :**
- Finaliser les schémas SQLite (tables `draws`, `payouts`, `sources`)
- Créer les scripts d'initialisation et structure DB
- Intégrer SQLite directement dans l'UI web (better-sqlite3 via Node.js ou sql.js pour le navigateur)
- Créer les fonctions d'accès direct aux données (insert, select, pagination)
- Ajouter la gestion des index pour les performances
- Tester les requêtes directes depuis l'interface

**Critères de validation :**
- ✅ Fichier SQLite créé avec schémas documentés
- ✅ Script d'initialisation fonctionnel
- ✅ Accès SQLite direct depuis l'UI
- ✅ Fonctions de lecture/écriture testées
- ✅ Index sur les colonnes critiques (date, id)

### 2️⃣ **Scraping robuste** (Data Collection)
> Compléter entièrement avant de passer à l'UI

**Tâches :**
- Cartographier et documenter 1-2 sources fiables Euromillions
- Implémenter le scraping robuste avec retry/rate-limiting
- Développer la normalisation et validation des données
- Ajouter la déduplication (hash de tirage)
- Implémenter la séparation train/test (100 derniers)
- Créer l'import direct vers SQLite

**Critères de validation :**
- ✅ Sources documentées et testées
- ✅ Scraping robuste avec gestion d'erreurs
- ✅ Données normalisées et validées
- ✅ Séparation train/test fonctionnelle
- ✅ Import SQLite sans doublons

### 3️⃣ **Interface utilisateur** (User Experience)
> Finaliser avec les données réelles et le sélecteur

**Tâches :**
- **Sélecteur de source :** Implémenter le toggle JSON/SQLite dans les tableaux
- Créer les fonctions d'accès direct à SQLite depuis l'UI
- Maintenir la compatibilité avec les fichiers JSON existants
- Implémenter la pagination directe sur SQLite et JSON
- Améliorer le rendu des boules et étoiles
- Ajouter les indicateurs de chargement/erreurs
- Créer l'interface de déclenchement du scraping
- Tester l'expérience utilisateur complète :
  - Déclencher scraping (batch)
  - Basculer entre sources JSON/SQLite
  - Pagination fluide sur les deux sources
  - Vérifier navigation page X/Y
  - Valider rendu visuel des tirages

**Critères de validation :**
- ✅ Sélecteur JSON/SQLite fonctionnel
- ✅ Accès direct SQLite depuis l'UI
- ✅ Navigation historique fluide sur les deux sources
- ✅ Pagination efficace sans API
- ✅ Rendu visuel optimisé
- ✅ Gestion des états (loading, error, success)
- ✅ Basculement temps réel entre les sources

## ✅ Critères d'acceptation globaux

- **Données :** Historique complet sans doublons, séparation train/test effective
- **Base locale :** SQLite opérationnelle avec accès direct depuis l'UI
- **Interface :** Sélecteur JSON/SQLite fonctionnel, pagination fluide
- **Simplicité :** Pas de couche API, accès direct aux données
- **Qualité :** Tests unitaires passants, gestion d'erreurs robuste
- **Flexibilité :** Basculement transparent entre sources de données

---

## ❌ **RESTE À FAIRE Sprint 2**

> **Instructions :** Cette section doit TOUJOURS rester en fin de document. Cochez `[x]` les tâches terminées et laissez `[ ]` pour les tâches en cours/à faire.

### **1. 🗄️ Base SQLite (PRIORITÉ 1)**
- [ ] Remplacer localStorage par SQLite local
- [ ] Schémas draws, gains, sources
- [ ] Accès direct SQLite depuis UI web

### **2. 🔄 Sélecteur JSON/SQLite (PRIORITÉ 2)**  
- [ ] Toggle dans interface Tirage/Historique
- [ ] Basculement temps réel JSON ↔ SQLite
- [ ] Compatibilité données existantes

### **3. 📊 Scraping robuste (PRIORITÉ 3)**
- [ ] Cartographier 1-2 sources fiables
- [ ] Retry/rate-limiting automatique
- [ ] Déduplication des doublons
- [ ] Import direct en SQLite

### **4. 🎨 Finitions UI (PRIORITÉ 4)**
- [ ] Pagination native SQLite 
- [ ] Indicateurs loading/erreur
- [ ] Interface déclenchement scraping batch

## 📋 **ORDRE DE TRAVAIL**
1. **SQLite local** → Test accès direct UI
2. **Sélecteur** → Toggle JSON/SQLite opérationnel  
3. **Scraping** → Sources + import SQLite
4. **Finitions** → UX complète

## 🎯 **Livrable Sprint 2**
**Base SQLite + Scraping robuste + Sélecteur JSON/SQLite fonctionnel**

---
**📌 IMPORTANT :** Cette section "RESTE À FAIRE Sprint 2" doit toujours être maintenue en fin de document pour un suivi facile de l'avancement.

