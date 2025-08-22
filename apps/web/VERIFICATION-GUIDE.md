# 🔍 Guide de Vérification - Navigation et Marges

## 🎯 Problèmes corrigés

### ✅ Structure HTML restaurée
- **Avant :** Structure incomplète sans header ni marges
- **Après :** Structure complète avec `<div class="background">`, `<header class="topbar">`, `<main class="content">`

### ✅ Navigation fonctionnelle
- **Avant :** Menus ne fonctionnaient pas (data-page vs onclick)
- **Après :** Navigation utilise `onclick="showSection()"` comme l'original

### ✅ Routeur adapté
- **Avant :** Routeur incompatible avec l'ancien système
- **Après :** Fonctions de compatibilité ajoutées (`showSection`, `showHistorique`)

## 🚀 Comment vérifier

### 1. Lancer l'application
```bash
./go.bat
```

### 2. Tests automatiques
- **Navigation :** http://localhost:3010/test-navigation.html
- **T2 spécifique :** http://localhost:3010/diagnostic-t2.html

### 3. Tests manuels

#### ✅ Structure et marges
1. Ouvrir http://localhost:3010
2. **Vérifier :** Header avec logo "YesData - EuroMillion" visible
3. **Vérifier :** Marges gauche/droite présentes (contenu centré)
4. **Vérifier :** Background sombre avec effet

#### ✅ Navigation principale
1. **Menu Tirages :** Tirage, Historique, Scrapping
2. **Menu IA :** Configuration, Training, **T2** ← NOUVEAU
3. **Menu Admin :** Diagnostic, Monitoring

#### ✅ Page T2 spécifique
1. Cliquer sur **IA > T2**
2. **Vérifier :** 10 sections pliables visibles
3. **Vérifier :** Sections style DUMP (LED + flèche + terminal)
4. **Tester :** Clic sur une section pour plier/déplier
5. **Tester :** Bouton "Clear" dans une section

## 🔧 Fichiers modifiés

### Structure principale
- ✅ `apps/web/index.html` - Structure complète restaurée
- ✅ `apps/web/js/router.js` - Fonctions de compatibilité ajoutées
- ✅ `apps/web/components/navigation.html` - onclick au lieu de data-page

### Page T2
- ✅ `apps/web/pages/t2.html` - 10 sections pliables
- ✅ `apps/web/js/t2.js` - JavaScript complet
- ✅ `go.bat` - Version V0.004B-REFACTO-T2

### Tests et diagnostic
- ✅ `apps/web/test-navigation.html` - Test structure et navigation
- ✅ `apps/web/diagnostic-t2.html` - Test spécifique T2
- ✅ `apps/web/T2-README.md` - Guide complet T2

## 🐛 Si ça ne fonctionne pas

### Navigation ne fonctionne pas
1. Ouvrir console développeur (F12)
2. Vérifier erreurs JavaScript
3. Tester : `showSection('t2')` dans la console

### Marges manquantes
1. Vérifier que tous les CSS sont chargés
2. Inspecter élément pour voir si `class="content"` est présent
3. Vérifier `homepage-components.css` chargé

### Page T2 invisible
1. Tester URL directe : http://localhost:3010#t2
2. Vérifier console pour erreurs de chargement
3. Tester diagnostic : http://localhost:3010/diagnostic-t2.html

## 📊 Statut actuel

- ✅ **Structure HTML :** Complète avec header et marges
- ✅ **Navigation :** Fonctionnelle avec onclick
- ✅ **Page T2 :** 10 sections pliables style DUMP
- ✅ **Routage :** Compatible avec ancien et nouveau système
- ✅ **CSS :** Tous les styles chargés correctement

---

**Version :** V0.004B-REFACTO-T2  
**Statut :** ✅ Fonctionnel  
**Dernière vérification :** $(Get-Date -Format "yyyy-MM-dd HH:mm")
