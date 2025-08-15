/**
 * FDJ Project - UI Controller
 * Contrôleur responsable de la gestion de l'interface utilisateur
 * 
 * @class UIController
 * @description Gère les interactions UI, la navigation et les mises à jour d'affichage
 */

class UIController {
  /**
   * Crée une instance de UIController
   * @param {DrawController} drawController - Contrôleur des tirages
   * @param {Object} [options] - Options de configuration
   */
  constructor(drawController, options = {}) {
    this.drawController = drawController;
    this.options = {
      autoRefresh: false,
      refreshInterval: 30000,
      defaultPageSize: 10,
      enableAnimations: true,
      ...options
    };

    // État de l'UI
    this.currentPage = 'home';
    this.currentDataSource = 'json';
    this.isLoading = false;
    this.currentDraws = [];
    this.pagination = null;
    this.refreshTimer = null;

    // Éléments DOM cachés
    this.elements = new Map();
    
    // Gestionnaires d'événements
    this.eventHandlers = new Map();
    
    this.initialize();
  }

  /**
   * Initialise le contrôleur UI
   */
  initialize() {
    this.setupEventListeners();
    this.loadUIElements();
    this.setupAutoRefresh();
    
    // Écouter les événements du DrawController
    this.drawController.on('drawsLoaded', (data) => this.onDrawsLoaded(data));
    this.drawController.on('drawLoaded', (data) => this.onDrawLoaded(data));
    this.drawController.on('scrapingStarted', (data) => this.onScrapingStarted(data));
    this.drawController.on('scrapingCompleted', (data) => this.onScrapingCompleted(data));
    this.drawController.on('error', (data) => this.onError(data));
  }

  /**
   * Charge et cache les éléments DOM importants
   */
  loadUIElements() {
    const selectors = {
      // Navigation et pages
      menuItems: '.menu-root a[data-target]',
      pages: '.page',
      currentPage: '.page:not(.hidden)',
      
      // Tirages
      latestCard: '#latestCard',
      historyTable: '#historyTable tbody',
      pageInfo: '#pageInfo',
      
      // Controls
      datePicker: '#datePick',
      pickButton: '#btnPick',
      refreshButton: '#btnHistLoad',
      prevPageButton: '#prevPage',
      nextPageButton: '#nextPage',
      limitSelector: '#histLimit',
      
      // Status et feedback
      toast: '#toast',
      globalStatus: '#global-status',
      loadingSpinner: '.loading-spinner',
      
      // Data source selector (nouveau)
      dataSourceSelector: '#dataSourceSelector'
    };

    Object.entries(selectors).forEach(([key, selector]) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 1) {
        this.elements.set(key, elements[0]);
      } else if (elements.length > 1) {
        this.elements.set(key, elements);
      }
    });
  }

  /**
   * Configure les gestionnaires d'événements
   */
  setupEventListeners() {
    // Navigation entre pages
    this.addDelegatedListener(document, 'click', '.menu-root a[data-target]', (e) => {
      e.preventDefault();
      const targetId = e.target.getAttribute('data-target');
      this.switchPage(targetId);
    });

    // Boutons de pagination
    this.addDelegatedListener(document, 'click', '#prevPage', () => this.previousPage());
    this.addDelegatedListener(document, 'click', '#nextPage', () => this.nextPage());
    this.addDelegatedListener(document, 'click', '#btnHistLoad', () => this.refreshDrawHistory());

    // Sélection de date
    this.addDelegatedListener(document, 'click', '#btnPick', () => this.loadDrawForSelectedDate());
    this.addDelegatedListener(document, 'change', '#datePick', (e) => this.onDateChanged(e));

    // Changement de limite d'affichage
    this.addDelegatedListener(document, 'change', '#histLimit', () => this.refreshDrawHistory());

    // Data source selector
    this.addDelegatedListener(document, 'change', '#dataSourceSelector', (e) => {
      this.switchDataSource(e.target.value);
    });

    // Raccourcis clavier
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Gestion des erreurs globales
    window.addEventListener('error', (e) => this.onGlobalError(e));
  }

  /**
   * Ajoute un listener délégué pour éviter les fuites mémoire
   * @param {Element} parent - Élément parent
   * @param {string} event - Type d'événement
   * @param {string} selector - Sélecteur CSS
   * @param {Function} handler - Gestionnaire
   */
  addDelegatedListener(parent, event, selector, handler) {
    const delegatedHandler = (e) => {
      const target = e.target.closest(selector);
      if (target) {
        handler.call(this, e, target);
      }
    };

    parent.addEventListener(event, delegatedHandler);
    
    // Stocker pour cleanup
    const key = `${event}_${selector}`;
    this.eventHandlers.set(key, { parent, event, handler: delegatedHandler });
  }

  /**
   * Bascule vers une page spécifique
   * @param {string} pageId - ID de la page cible
   */
  switchPage(pageId) {
    if (this.currentPage === pageId) return;

    // Cacher toutes les pages
    const pages = this.elements.get('pages');
    if (pages) {
      pages.forEach(page => page.classList.add('hidden'));
    }

    // Afficher la page cible
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.remove('hidden');
      this.currentPage = pageId;

      // Actions spécifiques par page
      this.onPageSwitch(pageId);
      
      this.showToast(`Navigation vers ${pageId}`);
    }
  }

  /**
   * Actions à exécuter lors du changement de page
   * @param {string} pageId - ID de la nouvelle page
   */
  onPageSwitch(pageId) {
    switch (pageId) {
      case 'page-latest':
        this.loadLatestDraw();
        break;
      case 'page-history':
        this.loadDrawHistory();
        break;
      case 'page-draw-details':
        this.initializeDrawDetails();
        break;
    }
  }

  /**
   * Charge le dernier tirage
   */
  async loadLatestDraw() {
    try {
      this.setLoading(true);
      const result = await this.drawController.getLatestDraws({ limit: 1 });
      
      if (result.draws && result.draws.length > 0) {
        this.renderDrawCard(result.draws[0]);
      } else {
        this.showError('Aucun tirage disponible');
      }
    } catch (error) {
      this.showError(`Erreur lors du chargement: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Charge l'historique des tirages
   */
  async loadDrawHistory() {
    try {
      this.setLoading(true);
      
      const limit = this.getSelectedLimit();
      const offset = this.getCurrentOffset();
      
      const result = await this.drawController.getLatestDraws({ limit, offset });
      
      this.currentDraws = result.draws;
      this.pagination = result.pagination;
      
      this.renderDrawHistory(result.draws);
      this.updatePaginationUI();
      
    } catch (error) {
      this.showError(`Erreur lors du chargement de l'historique: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Rafraîchit l'historique des tirages
   */
  async refreshDrawHistory() {
    // Réinitialiser à la première page
    this.setCurrentOffset(0);
    await this.loadDrawHistory();
  }

  /**
   * Charge un tirage pour la date sélectionnée
   */
  async loadDrawForSelectedDate() {
    const datePicker = this.elements.get('datePicker');
    if (!datePicker || !datePicker.value) {
      this.showError('Veuillez sélectionner une date');
      return;
    }

    try {
      this.setLoading(true);
      const draw = await this.drawController.scrapeAndSaveDraw(datePicker.value);
      
      if (draw) {
        this.renderDrawCard(draw);
        this.showToast('Tirage chargé avec succès');
      } else {
        this.showError('Aucun tirage trouvé pour cette date');
      }
    } catch (error) {
      this.showError(`Erreur lors du chargement: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Rendu d'une carte de tirage
   * @param {Draw} draw - Tirage à afficher
   */
  renderDrawCard(draw) {
    const container = this.elements.get('latestCard');
    if (!container) return;

    const html = `
      <div class="draw-card">
        <div class="draw-date">Tirage du ${draw.getFormattedDate()}</div>
        <div class="balls">
          ${draw.numbers.map(num => `<div class="ball">${num}</div>`).join('')}
          ${draw.stars.map(star => `<div class="ball star">${star}</div>`).join('')}
        </div>
        ${this.renderBreakdown(draw.breakdown)}
        <div class="draw-meta">
          <small>Source: ${draw.meta.source || 'N/A'} | 
                 Type: ${draw.meta.type || 'N/A'}</small>
        </div>
      </div>
    `;

    container.innerHTML = html;
    
    if (this.options.enableAnimations) {
      this.animateDrawCard(container);
    }
  }

  /**
   * Rendu du tableau d'historique
   * @param {Draw[]} draws - Liste des tirages
   */
  renderDrawHistory(draws) {
    const tbody = this.elements.get('historyTable');
    if (!tbody) return;

    if (draws.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3">Aucun tirage disponible</td></tr>';
      return;
    }

    const html = draws.map(draw => `
      <tr class="draw-row" data-draw-id="${draw.id}">
        <td><span class="date-chip">${draw.getFormattedDate()}</span></td>
        <td>
          <div class="balls compact">
            ${draw.numbers.map(num => `<div class="ball small">${num}</div>`).join('')}
          </div>
        </td>
        <td>
          <div class="balls compact">
            ${draw.stars.map(star => `<div class="ball small star">${star}</div>`).join('')}
          </div>
        </td>
      </tr>
    `).join('');

    tbody.innerHTML = html;

    // Ajouter des listeners pour les clics sur les lignes
    tbody.querySelectorAll('.draw-row').forEach(row => {
      row.addEventListener('click', () => {
        const drawId = row.dataset.drawId;
        this.showDrawDetails(drawId);
      });
    });
  }

  /**
   * Rendu du breakdown des gains
   * @param {Array} breakdown - Détails des gains
   * @returns {string} HTML du breakdown
   */
  renderBreakdown(breakdown) {
    if (!breakdown || breakdown.length === 0) {
      return '<p class="no-breakdown">Détails des gains non disponibles</p>';
    }

    return `
      <table class="breakdown">
        <thead>
          <tr>
            <th>Rang</th>
            <th>Gagnants</th>
            <th>Gain</th>
          </tr>
        </thead>
        <tbody>
          ${breakdown.map(item => `
            <tr>
              <td>${item.rankLabel || item.rank}</td>
              <td>${(item.winners || 0).toLocaleString('fr-FR')}</td>
              <td>${this.formatMoney(item.amount, item.currency)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  /**
   * Met à jour l'interface de pagination
   */
  updatePaginationUI() {
    if (!this.pagination) return;

    const pageInfo = this.elements.get('pageInfo');
    const prevButton = this.elements.get('prevPageButton');
    const nextButton = this.elements.get('nextPageButton');

    if (pageInfo) {
      pageInfo.textContent = `Page ${this.pagination.currentPage} sur ${this.pagination.totalPages} (${this.pagination.total} tirages)`;
    }

    if (prevButton) {
      prevButton.disabled = !this.pagination.hasPrev;
    }

    if (nextButton) {
      nextButton.disabled = !this.pagination.hasNext;
    }
  }

  /**
   * Page précédente
   */
  async previousPage() {
    if (!this.pagination || !this.pagination.hasPrev) return;
    
    const newOffset = Math.max(0, this.getCurrentOffset() - this.getSelectedLimit());
    this.setCurrentOffset(newOffset);
    await this.loadDrawHistory();
  }

  /**
   * Page suivante
   */
  async nextPage() {
    if (!this.pagination || !this.pagination.hasNext) return;
    
    const newOffset = this.getCurrentOffset() + this.getSelectedLimit();
    this.setCurrentOffset(newOffset);
    await this.loadDrawHistory();
  }

  /**
   * Bascule la source de données
   * @param {string} sourceType - Type de source ('json' ou 'sqlite')
   */
  async switchDataSource(sourceType) {
    if (this.currentDataSource === sourceType) return;

    try {
      this.setLoading(true);
      
      // Notifier l'application principale du changement
      if (window.fdjApp && window.fdjApp.switchDataSource) {
        await window.fdjApp.switchDataSource(sourceType);
      }
      
      this.currentDataSource = sourceType;
      
      // Rafraîchir les données affichées
      if (this.currentPage === 'page-history') {
        await this.refreshDrawHistory();
      } else if (this.currentPage === 'page-latest') {
        await this.loadLatestDraw();
      }
      
      this.showToast(`Basculé vers la source ${sourceType.toUpperCase()}`);
      
    } catch (error) {
      this.showError(`Erreur lors du changement de source: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Gestion des raccourcis clavier
   * @param {KeyboardEvent} e - Événement clavier
   */
  handleKeyboard(e) {
    // Échapper pour fermer les modales ou revenir
    if (e.key === 'Escape') {
      this.closeModals();
    }
    
    // F5 pour rafraîchir (empêcher le comportement par défaut)
    if (e.key === 'F5') {
      e.preventDefault();
      this.refreshCurrentPage();
    }
    
    // Ctrl+R pour rafraîchir
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      this.refreshCurrentPage();
    }
  }

  /**
   * Affiche un toast de notification
   * @param {string} message - Message à afficher
   * @param {string} [type='info'] - Type de notification
   */
  showToast(message, type = 'info') {
    const toast = this.elements.get('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast toast-${type}`;
    toast.classList.remove('hidden');

    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }

  /**
   * Affiche une erreur
   * @param {string} message - Message d'erreur
   */
  showError(message) {
    this.showToast(message, 'error');
    console.error('UI Error:', message);
  }

  /**
   * Définit l'état de chargement
   * @param {boolean} loading - État de chargement
   */
  setLoading(loading) {
    this.isLoading = loading;
    
    const spinner = this.elements.get('loadingSpinner');
    if (spinner) {
      spinner.style.display = loading ? 'block' : 'none';
    }
    
    // Désactiver les boutons pendant le chargement
    const buttons = document.querySelectorAll('button:not(.no-disable)');
    buttons.forEach(btn => btn.disabled = loading);
  }

  /**
   * Formate un montant en devise
   * @param {number} amount - Montant
   * @param {string} [currency='EUR'] - Devise
   * @returns {string} Montant formaté
   */
  formatMoney(amount, currency = 'EUR') {
    if (typeof amount !== 'number') return `${amount || ''} ${currency}`;
    
    try {
      return amount.toLocaleString('fr-FR', {
        style: 'currency',
        currency: currency
      });
    } catch {
      return `${amount.toLocaleString('fr-FR')} ${currency}`;
    }
  }

  /**
   * Obtient la limite sélectionnée
   * @returns {number} Limite
   */
  getSelectedLimit() {
    const selector = this.elements.get('limitSelector');
    return selector ? parseInt(selector.value) || this.options.defaultPageSize : this.options.defaultPageSize;
  }

  /**
   * Obtient l'offset actuel
   * @returns {number} Offset
   */
  getCurrentOffset() {
    return this.pagination ? this.pagination.offset : 0;
  }

  /**
   * Définit l'offset actuel
   * @param {number} offset - Nouvel offset
   */
  setCurrentOffset(offset) {
    if (this.pagination) {
      this.pagination.offset = offset;
    }
  }

  /**
   * Configuration de l'auto-refresh
   */
  setupAutoRefresh() {
    if (this.options.autoRefresh) {
      this.refreshTimer = setInterval(() => {
        this.refreshCurrentPage();
      }, this.options.refreshInterval);
    }
  }

  /**
   * Rafraîchit la page actuelle
   */
  async refreshCurrentPage() {
    switch (this.currentPage) {
      case 'page-latest':
        await this.loadLatestDraw();
        break;
      case 'page-history':
        await this.loadDrawHistory();
        break;
    }
  }

  // Event handlers pour les événements du DrawController
  onDrawsLoaded(data) {
    console.log('Draws loaded:', data.draws.length);
  }

  onDrawLoaded(data) {
    console.log('Draw loaded:', data.draw.id);
  }

  onScrapingStarted(data) {
    this.showToast(`Scraping démarré pour ${data.date}`, 'info');
  }

  onScrapingCompleted(data) {
    const message = data.success ? 'Scraping terminé avec succès' : 'Scraping terminé sans résultat';
    this.showToast(message, data.success ? 'success' : 'warning');
  }

  onError(data) {
    this.showError(`Erreur ${data.action}: ${data.error.message}`);
  }

  onGlobalError(e) {
    this.showError(`Erreur JavaScript: ${e.message}`);
  }

  onDateChanged(e) {
    // Optionnel: charger automatiquement quand la date change
    // this.loadDrawForSelectedDate();
  }

  /**
   * Animation pour les cartes de tirage
   * @param {Element} container - Conteneur à animer
   */
  animateDrawCard(container) {
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    
    requestAnimationFrame(() => {
      container.style.transition = 'all 0.5s ease-out';
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    });
  }

  /**
   * Ferme les modales ouvertes
   */
  closeModals() {
    // Implémentation pour fermer les modales si nécessaire
  }

  /**
   * Affiche les détails d'un tirage
   * @param {string} drawId - ID du tirage
   */
  async showDrawDetails(drawId) {
    // Implémentation pour afficher les détails
    console.log('Show details for draw:', drawId);
  }

  /**
   * Initialise la page de détails
   */
  initializeDrawDetails() {
    // Implémentation pour initialiser la page de détails
  }

  /**
   * Nettoie les ressources du contrôleur
   */
  cleanup() {
    // Nettoyer les event listeners
    this.eventHandlers.forEach(({ parent, event, handler }) => {
      parent.removeEventListener(event, handler);
    });
    this.eventHandlers.clear();

    // Nettoyer le timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    // Nettoyer le cache
    this.elements.clear();
  }
}

export default UIController;