/**
 * Routeur simple pour charger les pages dynamiquement
 * Version V0.004A avec système modulaire
 */

class PageRouter {
  constructor() {
    this.pages = {
      'training': {
        html: 'pages/training.html',
        script: 'js/training.js'
      }
    };
    this.currentPage = null;
  }

  /**
   * Navigue vers une page spécifique
   * @param {string} pageName - Nom de la page à charger
   */
  async navigateTo(pageName) {
    try {
      // Vérifier si la page existe
      if (!this.pages[pageName]) {
        console.error(`Page "${pageName}" non trouvée`);
        return;
      }

      // Cacher toutes les sections
      this.hideAllSections();

      // Charger le contenu de la page
      await this.loadPageContent(pageName, this.pages[pageName].html);

      // Charger le script associé si nécessaire
      if (this.pages[pageName].script) {
        await this.loadScript(this.pages[pageName].script);
      }

      // Afficher la section training
      this.showSection('training');

      // Mettre à jour l'historique
      if (history.pushState) {
        history.pushState({ page: pageName }, '', `#${pageName}`);
      }

      this.currentPage = pageName;
      console.log(`Navigation vers ${pageName} réussie`);

    } catch (error) {
      console.error(`Erreur lors de la navigation vers ${pageName}:`, error);
    }
  }

  /**
   * Charge le contenu HTML d'une page
   * @param {string} pageName - Nom de la page
   * @param {string} filePath - Chemin vers le fichier HTML
   */
  async loadPageContent(pageName, filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      
      // Injecter le contenu dans la section training
      const trainingSection = document.getElementById('training');
      if (trainingSection) {
        trainingSection.innerHTML = content;
        console.log(`Contenu de ${pageName} chargé depuis ${filePath}`);
      } else {
        console.error('Section #training non trouvée');
      }

    } catch (error) {
      console.error(`Erreur lors du chargement de ${filePath}:`, error);
    }
  }

  /**
   * Charge dynamiquement un script JavaScript
   * @param {string} scriptPath - Chemin vers le script
   */
  async loadScript(scriptPath) {
    return new Promise((resolve, reject) => {
      // Vérifier si le script est déjà chargé
      const existingScript = document.querySelector(`script[src="${scriptPath}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = scriptPath;
      script.onload = () => {
        console.log(`Script ${scriptPath} chargé`);
        resolve();
      };
      script.onerror = () => {
        console.error(`Erreur lors du chargement du script ${scriptPath}`);
        reject(new Error(`Impossible de charger ${scriptPath}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Cache toutes les sections
   */
  hideAllSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      section.classList.add('hidden');
    });
  }

  /**
   * Affiche une section spécifique
   * @param {string} sectionId - ID de la section à afficher
   */
  showSection(sectionId) {
    // Cacher toutes les sections
    this.hideAllSections();

    // Afficher la section demandée
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.remove('hidden');
      console.log(`Section ${sectionId} affichée`);
      
      // Si c'est la section training et qu'elle est vide, la charger
      if (sectionId === 'training') {
        setTimeout(ensureTrainingLoaded, 100);
      }
    } else {
      console.error(`Section ${sectionId} non trouvée`);
    }
  }
}

// Instance globale du routeur
const router = new PageRouter();

/**
 * Fonction de compatibilité pour showSection
 * Permet de garder la compatibilité avec les onclick existants
 */
function showSection(sectionId) {
  // Si c'est une page modulaire, utiliser le routeur
  if (router.pages[sectionId]) {
    router.navigateTo(sectionId);
  } else {
    // Sinon, utiliser la méthode classique
    router.showSection(sectionId);
  }
}

/**
 * Charge automatiquement la page training si elle est vide
 */
function ensureTrainingLoaded() {
  const trainingSection = document.getElementById('training');
  if (trainingSection && !trainingSection.classList.contains('hidden')) {
    // Si la section training est visible mais vide, la charger
    const content = trainingSection.innerHTML.trim();
    if (!content || content === '<!-- Le contenu sera chargé dynamiquement depuis pages/training.html -->') {
      console.log('Section training vide, chargement automatique...');
      router.navigateTo('training');
    }
  }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  console.log('Router initialisé');
  
  // Gérer les changements d'URL
  window.addEventListener('popstate', function(event) {
    if (event.state && event.state.page) {
      router.navigateTo(event.state.page);
    }
  });

  // Charger la page depuis l'URL si présente
  const hash = window.location.hash.substring(1);
  if (hash && router.pages[hash]) {
    router.navigateTo(hash);
  }
  
  // Observer les changements de visibilité des sections
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target;
        if (target.id === 'training' && !target.classList.contains('hidden')) {
          // La section training est devenue visible, s'assurer qu'elle est chargée
          setTimeout(ensureTrainingLoaded, 100);
        }
      }
    });
  });
  
  // Observer la section training
  const trainingSection = document.getElementById('training');
  if (trainingSection) {
    observer.observe(trainingSection, { attributes: true, attributeFilter: ['class'] });
  }
});
