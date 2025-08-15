# 📋 Guide d'utilisation du système TODO

## 🚀 **Ouverture automatique**

### Au démarrage de Cursor
Le fichier `Notes/TODO.md` s'ouvre automatiquement grâce à la configuration VSCode.

### Manuel
```bash
# Ouvrir le TODO
npm run open:todo

# Ou directement
npm run startup
```

## 🎨 **Fonctionnalités de la TODO List**

### ✅ **Suivi des tâches**
- Cases à cocher interactives
- Codes couleur pour les priorités
- États des tâches (en cours, terminé, etc.)

### 🎨 **Propositions de styles**
5 styles d'application détaillés avec :
- Palettes de couleurs complètes
- Caractéristiques visuelles
- Code CSS de base

### 📁 **Organisation du code**
Plan de rationalisation en multi-fichiers :
- Séparation des composants
- Architecture modulaire
- Structure claire

## 🔧 **Configuration**

### Fichiers impliqués
- `Notes/TODO.md` - La note principale
- `.vscode/settings.json` - Configuration Cursor/VSCode
- `.vscode/workspace.json` - Configuration workspace
- `scripts/open-todo.mjs` - Script d'ouverture
- `package.json` - Scripts npm

### Personnalisation
Vous pouvez modifier :
- Le style de la TODO dans `Notes/TODO.md`
- Les paramètres d'ouverture dans `.vscode/settings.json`
- Les scripts dans `package.json`

## 📝 **Utilisation quotidienne**

1. **Démarrage** : Le TODO s'ouvre automatiquement
2. **Suivi** : Cochez les tâches terminées
3. **Ajout** : Ajoutez de nouvelles tâches dans les sections appropriées
4. **Mise à jour** : Modifiez les priorités et deadlines

## 🎯 **Bonnes pratiques**

- ✅ Mettez à jour régulièrement les états des tâches
- 🎨 Documentez vos choix de design
- 📅 Respectez les deadlines fixées
- 🔄 Revoyez la liste en début de journée

---

*Cette TODO list est conçue pour maximiser votre productivité sur le projet FDJ !* 🚀