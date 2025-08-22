// ========================================
// SYSTÈME DE ROUTAGE DYNAMIQUE
// ========================================

class PageRouter {
  constructor() {
    this.currentPage = 'home';
    this.pages = {
      'home': { file: null, script: null }, // Page d'accueil intégrée
      'training': { file: 'pages/training.html', script: 'js/training.js' },
      't2': { file: 'pages/t2.html', script: 'js/t2.js' },
      'scraping': { file: 'pages/scraping.html', script: null }, // Page extraite
      'tirage': { file: 'pages/tirage.html', script: null }, // Page extraite
      'ia-config': { file: 'pages/ia-config.html', script: null }, // Page extraite
      'admin-diagnostic': { file: null, script: null }, // Section intégrée (à extraire)
      'admin-monitoring': { file: null, script: null } // Section intégrée (à extraire)
    };
    this.loadedScripts = new Set();
    this.init();
  }

  init() {
    // Gérer l'historique du navigateur
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.page) {
        this.loadPage(e.state.page, false);
      }
    });

    // Charger la page initiale
    const initialPage = this.getInitialPage();
    this.navigateTo(initialPage, false);
  }

  getInitialPage() {
    // Vérifier l'URL pour déterminer la page initiale
    const hash = window.location.hash.substring(1);
    return hash && this.pages[hash] ? hash : 'home';
  }

  async navigateTo(pageName, addToHistory = true) {
    if (!this.pages[pageName]) {
      console.error(`Page "${pageName}" non trouvée`);
      return;
    }

    // Masquer toutes les sections
    this.hideAllSections();

    // Charger la page
    await this.loadPage(pageName, addToHistory);

    this.currentPage = pageName;
  }

  async loadPage(pageName, addToHistory = true) {
    const pageConfig = this.pages[pageName];

    try {
      // Si la page a un fichier HTML externe, le charger
      if (pageConfig.file) {
        await this.loadPageContent(pageName, pageConfig.file);
      } else {
        // Afficher la section correspondante
        this.showSection(pageName);
      }

      // Charger le script JavaScript si nécessaire
      if (pageConfig.script && !this.loadedScripts.has(pageConfig.script)) {
        await this.loadScript(pageConfig.script);
        this.loadedScripts.add(pageConfig.script);
      }

      // Ajouter à l'historique
      if (addToHistory) {
        window.history.pushState({ page: pageName }, '', `#${pageName}`);
      }

      // Déclencher l'événement de changement de page
      this.triggerPageChangeEvent(pageName);

    } catch (error) {
      console.error(`Erreur lors du chargement de la page ${pageName}:`, error);
      this.showError(`Impossible de charger la page ${pageName}`);
    }
  }

  async loadPageContent(pageName, filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Créer ou mettre à jour la section
      let section = document.getElementById(pageName);
      if (!section) {
        section = document.createElement('section');
        section.id = pageName;
        section.className = 'section hidden';
        document.querySelector('main').appendChild(section);
      }

      section.innerHTML = html;
      this.showSection(pageName);

    } catch (error) {
      throw new Error(`Impossible de charger ${filePath}: ${error.message}`);
    }
  }

  async loadScript(scriptPath) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = scriptPath;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Impossible de charger ${scriptPath}`));
      document.head.appendChild(script);
    });
  }

  hideAllSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      section.classList.add('hidden');
    });
  }

  showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.remove('hidden');
    }
  }



  triggerPageChangeEvent(pageName) {
    const event = new CustomEvent('pageChanged', {
      detail: { page: pageName, previousPage: this.currentPage }
    });
    document.dispatchEvent(event);
  }

  showError(message) {
    console.error(message);
    // Afficher une notification d'erreur à l'utilisateur
    // (peut être amélioré avec un système de notifications)
  }

  // Méthodes utilitaires publiques
  getCurrentPage() {
    return this.currentPage;
  }

  registerPage(name, config) {
    this.pages[name] = config;
  }

  isPageLoaded(pageName) {
    const pageConfig = this.pages[pageName];
    return !pageConfig.script || this.loadedScripts.has(pageConfig.script);
  }
}

// ========================================
// INITIALISATION GLOBALE
// ========================================

// Instance globale du routeur
let router;

// Initialiser le routeur quand le DOM est prêt
document.addEventListener('DOMContentLoaded', async () => {
  // Charger la navigation d'abord
  await loadNavigation();
  
  // Puis initialiser le routeur
  router = new PageRouter();
  
  // Exposer le routeur globalement pour les autres scripts
  window.router = router;
});

// Fonction pour charger la navigation
async function loadNavigation() {
  try {
    const response = await fetch('components/navigation.html');
    if (response.ok) {
      const navHTML = await response.text();
      const navContainer = document.getElementById('navigation-container');
      if (navContainer) {
        navContainer.innerHTML = navHTML;
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement de la navigation:', error);
  }
}

// ========================================
// API PUBLIQUE
// ========================================

// Fonctions utilitaires pour la navigation
function navigateTo(pageName) {
  if (router) {
    router.navigateTo(pageName);
  }
}

function getCurrentPage() {
  return router ? router.getCurrentPage() : null;
}

// Fonction de compatibilité pour l'ancien système
function showSection(sectionId) {
  if (router) {
    router.navigateTo(sectionId);
  }
}

// Fonction spéciale pour l'historique
function showHistorique() {
  // Cette fonction peut être implémentée selon les besoins spécifiques
  console.log('showHistorique appelée - à implémenter selon les besoins');
}

// Écouter les changements de page pour les actions spécifiques
document.addEventListener('pageChanged', (e) => {
  const { page, previousPage } = e.detail;
  
  console.log(`Navigation: ${previousPage} → ${page}`);
  
  // Actions spécifiques selon la page
  switch (page) {
    case 'training':
      // Initialiser les modèles de training si nécessaire
      if (typeof initializeTrainingModels === 'function') {
        initializeTrainingModels();
      }
      break;
      
    case 't2':
      // Initialiser la page T2 si nécessaire
      if (typeof initializeT2 === 'function') {
        initializeT2();
      }
      break;
      
    case 'scraping':
      // Initialiser le scraping si nécessaire
      break;
      
    case 'ia-config':
      // Charger les configurations IA si nécessaire
      break;
  }
});
