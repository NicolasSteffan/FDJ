# 📄 Page T2 - Guide d'accès

## 🎯 Objectif
La page T2 contient 10 sous-sections pliables identiques au style "DUMP" de la page Admin - Monitoring Base de Données.

## 🚀 Comment accéder à T2

### Méthode 1: Via le menu principal (recommandée)
1. Lancer l'application avec `go.bat`
2. Ouvrir http://localhost:3010
3. Dans le menu principal, cliquer sur **IA**
4. Cliquer sur **T2** dans le sous-menu

### Méthode 2: Via l'URL directe
- Ouvrir http://localhost:3010#t2

### Méthode 3: Tests de diagnostic
- **Test complet:** http://localhost:3010/diagnostic-t2.html
- **Test isolé:** http://localhost:3010/test-t2.html

## 📋 Contenu de la page T2

La page T2 contient **10 sections pliables** :

1. **Section Alpha** - `alpha-main-tag`
2. **Section Beta** - `beta-main-tag`
3. **Section Gamma** - `gamma-main-tag`
4. **Section Delta** - `delta-main-tag`
5. **Section Epsilon** - `epsilon-main-tag`
6. **Section Zeta** - `zeta-main-tag`
7. **Section Eta** - `eta-main-tag`
8. **Section Theta** - `theta-main-tag`
9. **Section Iota** - `iota-main-tag`
10. **Section Kappa** - `kappa-main-tag`

## 🎨 Fonctionnalités

### Style identique à DUMP
- **LED générique** (grise/verte selon l'état)
- **Flèche d'expansion** (▼/▲)
- **Zone terminal** (fond noir, texte vert)
- **Bouton Clear** pour vider chaque section
- **Animations CSS** pour le pliage/dépliage

### Fonctions JavaScript disponibles
- `toggleTirageTag(tagId)` - Plier/déplier une section
- `clearAlphaLog()` à `clearKappaLog()` - Vider une section
- `addAlphaLog(message, type)` à `addKappaLog(message, type)` - Ajouter des logs
- `initializeT2()` - Initialisation automatique

## 🔧 Architecture technique

### Fichiers créés/modifiés
- `apps/web/pages/t2.html` - Contenu HTML de la page
- `apps/web/js/t2.js` - JavaScript spécifique à T2
- `apps/web/components/navigation.html` - Menu mis à jour
- `apps/web/js/router.js` - Configuration de routage
- `go.bat` - Version mise à jour V0.004B-REFACTO-T2

### Intégration
- ✅ Routage dynamique client-side
- ✅ Chargement automatique HTML + JavaScript
- ✅ Initialisation automatique au changement de page
- ✅ Style CSS cohérent avec le reste de l'application

## 🐛 Dépannage

### Si T2 n'apparaît pas :
1. Vérifier que le serveur utilise bien le bon `index.html` (refactorisé)
2. Ouvrir la console développeur (F12) pour voir les erreurs
3. Tester avec `diagnostic-t2.html` pour identifier le problème
4. Vérifier que tous les fichiers CSS sont chargés

### Si les sections ne se plient pas :
1. Vérifier que `tirage-components.css` est chargé
2. Vérifier que `t2.js` est chargé
3. Tester la fonction `toggleTirageTag()` dans la console

## 📊 Tests disponibles

- **diagnostic-t2.html** : Vérifie tous les fichiers et configurations
- **test-t2.html** : Test isolé de la page T2
- **Console développeur** : `router.getCurrentPage()` doit retourner "t2"

---

**Version :** V0.004B-REFACTO-T2  
**Date :** $(Get-Date -Format "yyyy-MM-dd")  
**Statut :** ✅ Fonctionnel
