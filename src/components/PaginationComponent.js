/**
 * FDJ Project - Pagination Component
 * Composant réutilisable pour la pagination des données
 * 
 * @class PaginationComponent
 * @description Composant pour gérer la navigation entre les pages de données
 */

class PaginationComponent {
  /**
   * Crée une instance de PaginationComponent
   * @param {Object} options - Options du composant
   * @param {number} [options.pageSize=10] - Nombre d'éléments par page
   * @param {number} [options.maxVisiblePages=5] - Nombre maximum de pages visibles
   * @param {boolean} [options.showInfo=true] - Afficher les informations de pagination
   * @param {boolean} [options.showSizeSelector=true] - Afficher le sélecteur de taille
   * @param {string} [options.theme='default'] - Thème visuel
   */
  constructor(options = {}) {
    this.options = {
      pageSize: 10,
      maxVisiblePages: 5,
      showInfo: true,
      showSizeSelector: true,
      showFirstLast: true,
      theme: 'default',
      animated: true,
      ...options
    };

    // État de pagination
    this.currentPage = 1;
    this.totalItems = 0;
    this.totalPages = 0;
    this.pageSize = this.options.pageSize;
    
    // Éléments DOM
    this.element = null;
    this.pageButtons = [];
    
    // Gestionnaires d'événements
    this.changeHandlers = [];
    this.isEnabled = true;
    
    // Tailles de page disponibles
    this.availablePageSizes = [5, 10, 20, 50, 100];
  }

  /**
   * Crée et retourne l'élément DOM du composant
   * @param {HTMLElement} [container] - Conteneur où insérer le composant
   * @returns {HTMLElement} Élément DOM créé
   */
  render(container = null) {
    this.element = document.createElement('div');
    this.element.className = this.buildContainerClasses();
    
    this.element.innerHTML = `
      <div class="pagination-wrapper">
        ${this.options.showInfo ? this.renderInfoSection() : ''}
        <div class="pagination-controls">
          ${this.renderNavigationButtons()}
          ${this.renderPageNumbers()}
        </div>
        ${this.options.showSizeSelector ? this.renderSizeSelector() : ''}
      </div>
    `;
    
    this.setupEventListeners();
    this.updateDisplay();
    
    if (container) {
      container.appendChild(this.element);
    }
    
    return this.element;
  }

  /**
   * Construit les classes CSS du conteneur
   * @returns {string} Classes CSS
   */
  buildContainerClasses() {
    const classes = ['pagination-component'];
    classes.push(`pagination-${this.options.theme}`);
    
    if (this.options.animated) {
      classes.push('pagination-animated');
    }
    
    if (!this.isEnabled) {
      classes.push('pagination-disabled');
    }
    
    return classes.join(' ');
  }

  /**
   * Rendu de la section d'informations
   * @returns {string} HTML de la section info
   */
  renderInfoSection() {
    return `
      <div class="pagination-info">
        <span class="info-text">
          <span class="items-range"></span>
          <span class="items-total"></span>
        </span>
      </div>
    `;
  }

  /**
   * Rendu des boutons de navigation
   * @returns {string} HTML des boutons de navigation
   */
  renderNavigationButtons() {
    return `
      <div class="pagination-nav">
        ${this.options.showFirstLast ? '<button class="nav-btn first-btn" data-action="first" title="Première page">⟪</button>' : ''}
        <button class="nav-btn prev-btn" data-action="prev" title="Page précédente">‹</button>
        <div class="page-numbers"></div>
        <button class="nav-btn next-btn" data-action="next" title="Page suivante">›</button>
        ${this.options.showFirstLast ? '<button class="nav-btn last-btn" data-action="last" title="Dernière page">⟫</button>' : ''}
      </div>
    `;
  }

  /**
   * Rendu des numéros de page
   * @returns {string} HTML des numéros de page
   */
  renderPageNumbers() {
    return '<div class="page-numbers"></div>';
  }

  /**
   * Rendu du sélecteur de taille de page
   * @returns {string} HTML du sélecteur
   */
  renderSizeSelector() {
    return `
      <div class="pagination-size-selector">
        <label class="size-label">
          Éléments par page:
          <select class="size-select">
            ${this.availablePageSizes.map(size => 
              `<option value="${size}" ${size === this.pageSize ? 'selected' : ''}>${size}</option>`
            ).join('')}
          </select>
        </label>
      </div>
    `;
  }

  /**
   * Configure les gestionnaires d'événements
   */
  setupEventListeners() {
    if (!this.element) return;

    // Boutons de navigation
    this.element.addEventListener('click', (e) => {
      if (!this.isEnabled) return;
      
      const button = e.target.closest('.nav-btn, .page-btn');
      if (button) {
        this.handleButtonClick(button);
      }
    });

    // Sélecteur de taille de page
    const sizeSelect = this.element.querySelector('.size-select');
    if (sizeSelect) {
      sizeSelect.addEventListener('change', (e) => {
        if (!this.isEnabled) return;
        this.changePageSize(parseInt(e.target.value));
      });
    }

    // Support clavier
    this.element.addEventListener('keydown', (e) => {
      if (!this.isEnabled) return;
      this.handleKeyboard(e);
    });
  }

  /**
   * Gestion des clics sur les boutons
   * @param {HTMLElement} button - Bouton cliqué
   */
  handleButtonClick(button) {
    const action = button.dataset.action;
    const page = button.dataset.page;

    if (page) {
      this.goToPage(parseInt(page));
    } else {
      switch (action) {
        case 'first':
          this.goToPage(1);
          break;
        case 'prev':
          this.goToPage(this.currentPage - 1);
          break;
        case 'next':
          this.goToPage(this.currentPage + 1);
          break;
        case 'last':
          this.goToPage(this.totalPages);
          break;
      }
    }
  }

  /**
   * Gestion des raccourcis clavier
   * @param {KeyboardEvent} e - Événement clavier
   */
  handleKeyboard(e) {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.goToPage(this.currentPage - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.goToPage(this.currentPage + 1);
        break;
      case 'Home':
        e.preventDefault();
        this.goToPage(1);
        break;
      case 'End':
        e.preventDefault();
        this.goToPage(this.totalPages);
        break;
    }
  }

  /**
   * Met à jour la pagination avec de nouvelles données
   * @param {Object} data - Données de pagination
   * @param {number} data.totalItems - Nombre total d'éléments
   * @param {number} [data.currentPage] - Page actuelle
   * @param {number} [data.pageSize] - Taille de page
   */
  update(data) {
    this.totalItems = data.totalItems;
    
    if (data.currentPage !== undefined) {
      this.currentPage = data.currentPage;
    }
    
    if (data.pageSize !== undefined) {
      this.pageSize = data.pageSize;
    }
    
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    // Vérifier que la page actuelle est valide
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.currentPage < 1) {
      this.currentPage = 1;
    }
    
    this.updateDisplay();
  }

  /**
   * Met à jour l'affichage complet
   */
  updateDisplay() {
    if (!this.element) return;
    
    this.updateInfoSection();
    this.updateNavigationButtons();
    this.updatePageNumbers();
    this.updateSizeSelector();
  }

  /**
   * Met à jour la section d'informations
   */
  updateInfoSection() {
    if (!this.options.showInfo) return;
    
    const rangeElement = this.element.querySelector('.items-range');
    const totalElement = this.element.querySelector('.items-total');
    
    if (rangeElement && totalElement) {
      const start = (this.currentPage - 1) * this.pageSize + 1;
      const end = Math.min(this.currentPage * this.pageSize, this.totalItems);
      
      rangeElement.textContent = this.totalItems > 0 ? `${start}-${end}` : '0';
      totalElement.textContent = ` sur ${this.totalItems} éléments`;
    }
  }

  /**
   * Met à jour les boutons de navigation
   */
  updateNavigationButtons() {
    const firstBtn = this.element.querySelector('.first-btn');
    const prevBtn = this.element.querySelector('.prev-btn');
    const nextBtn = this.element.querySelector('.next-btn');
    const lastBtn = this.element.querySelector('.last-btn');
    
    const isFirstPage = this.currentPage === 1;
    const isLastPage = this.currentPage === this.totalPages;
    const hasPages = this.totalPages > 1;
    
    if (firstBtn) {
      firstBtn.disabled = !hasPages || isFirstPage;
    }
    
    if (prevBtn) {
      prevBtn.disabled = !hasPages || isFirstPage;
    }
    
    if (nextBtn) {
      nextBtn.disabled = !hasPages || isLastPage;
    }
    
    if (lastBtn) {
      lastBtn.disabled = !hasPages || isLastPage;
    }
  }

  /**
   * Met à jour les numéros de page
   */
  updatePageNumbers() {
    const container = this.element.querySelector('.page-numbers');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (this.totalPages <= 1) {
      return;
    }
    
    const pages = this.calculateVisiblePages();
    
    pages.forEach(page => {
      if (page === '...') {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'page-ellipsis';
        ellipsis.textContent = '...';
        container.appendChild(ellipsis);
      } else {
        const button = document.createElement('button');
        button.className = `page-btn ${page === this.currentPage ? 'active' : ''}`;
        button.textContent = page;
        button.dataset.page = page;
        button.setAttribute('aria-label', `Page ${page}`);
        button.setAttribute('aria-current', page === this.currentPage ? 'page' : 'false');
        container.appendChild(button);
      }
    });
  }

  /**
   * Calcule les pages visibles selon l'algorithme de pagination
   * @returns {Array} Pages à afficher
   */
  calculateVisiblePages() {
    const pages = [];
    const maxVisible = this.options.maxVisiblePages;
    const current = this.currentPage;
    const total = this.totalPages;
    
    if (total <= maxVisible) {
      // Afficher toutes les pages
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Affichage complexe avec ellipses
      const halfVisible = Math.floor(maxVisible / 2);
      
      if (current <= halfVisible + 1) {
        // Début: 1, 2, 3, 4, 5, ..., last
        for (let i = 1; i <= maxVisible - 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      } else if (current >= total - halfVisible) {
        // Fin: 1, ..., n-4, n-3, n-2, n-1, n
        pages.push(1);
        pages.push('...');
        for (let i = total - maxVisible + 2; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // Milieu: 1, ..., current-1, current, current+1, ..., last
        pages.push(1);
        pages.push('...');
        for (let i = current - halfVisible + 1; i <= current + halfVisible - 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      }
    }
    
    return pages;
  }

  /**
   * Met à jour le sélecteur de taille de page
   */
  updateSizeSelector() {
    if (!this.options.showSizeSelector) return;
    
    const select = this.element.querySelector('.size-select');
    if (select) {
      select.value = this.pageSize;
    }
  }

  /**
   * Navigue vers une page spécifique
   * @param {number} page - Numéro de page
   */
  goToPage(page) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    
    const previousPage = this.currentPage;
    this.currentPage = page;
    
    this.updateDisplay();
    this.emitChange(page, previousPage);
    
    if (this.options.animated) {
      this.animatePageChange();
    }
  }

  /**
   * Change la taille de page
   * @param {number} size - Nouvelle taille
   */
  changePageSize(size) {
    if (!this.availablePageSizes.includes(size) || size === this.pageSize) {
      return;
    }
    
    const previousSize = this.pageSize;
    this.pageSize = size;
    
    // Recalculer la page actuelle pour maintenir la position approximative
    const currentFirstItem = (this.currentPage - 1) * previousSize + 1;
    this.currentPage = Math.ceil(currentFirstItem / size);
    
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    this.updateDisplay();
    this.emitSizeChange(size, previousSize);
  }

  /**
   * Active ou désactive le composant
   * @param {boolean} enabled - État d'activation
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    
    if (this.element) {
      this.element.classList.toggle('pagination-disabled', !enabled);
      
      const buttons = this.element.querySelectorAll('button, select');
      buttons.forEach(btn => btn.disabled = !enabled);
    }
  }

  /**
   * Ajoute un gestionnaire de changement de page
   * @param {Function} handler - Gestionnaire
   */
  onPageChange(handler) {
    if (typeof handler === 'function') {
      this.changeHandlers.push({ type: 'page', handler });
    }
  }

  /**
   * Ajoute un gestionnaire de changement de taille
   * @param {Function} handler - Gestionnaire
   */
  onSizeChange(handler) {
    if (typeof handler === 'function') {
      this.changeHandlers.push({ type: 'size', handler });
    }
  }

  /**
   * Supprime un gestionnaire
   * @param {Function} handler - Gestionnaire à supprimer
   */
  off(handler) {
    this.changeHandlers = this.changeHandlers.filter(h => h.handler !== handler);
  }

  /**
   * Émet l'événement de changement de page
   * @param {number} newPage - Nouvelle page
   * @param {number} previousPage - Page précédente
   */
  emitChange(newPage, previousPage) {
    const eventData = {
      page: newPage,
      previousPage,
      pageSize: this.pageSize,
      offset: (newPage - 1) * this.pageSize,
      totalItems: this.totalItems,
      totalPages: this.totalPages
    };
    
    this.changeHandlers
      .filter(h => h.type === 'page')
      .forEach(h => {
        try {
          h.handler(eventData);
        } catch (error) {
          console.error('Error in page change handler:', error);
        }
      });
    
    this.emitDOMEvent('pageChange', eventData);
  }

  /**
   * Émet l'événement de changement de taille
   * @param {number} newSize - Nouvelle taille
   * @param {number} previousSize - Taille précédente
   */
  emitSizeChange(newSize, previousSize) {
    const eventData = {
      pageSize: newSize,
      previousPageSize: previousSize,
      page: this.currentPage,
      offset: (this.currentPage - 1) * newSize,
      totalItems: this.totalItems,
      totalPages: this.totalPages
    };
    
    this.changeHandlers
      .filter(h => h.type === 'size')
      .forEach(h => {
        try {
          h.handler(eventData);
        } catch (error) {
          console.error('Error in size change handler:', error);
        }
      });
    
    this.emitDOMEvent('sizeChange', eventData);
  }

  /**
   * Émet un événement DOM personnalisé
   * @param {string} eventName - Nom de l'événement
   * @param {Object} data - Données de l'événement
   */
  emitDOMEvent(eventName, data) {
    if (this.element) {
      const customEvent = new CustomEvent(eventName, {
        detail: data,
        bubbles: true
      });
      this.element.dispatchEvent(customEvent);
    }
  }

  /**
   * Animation de changement de page
   */
  animatePageChange() {
    if (!this.element) return;
    
    this.element.classList.add('changing');
    
    setTimeout(() => {
      this.element.classList.remove('changing');
    }, 200);
  }

  /**
   * Obtient l'état actuel de la pagination
   * @returns {Object} État de pagination
   */
  getState() {
    return {
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      totalItems: this.totalItems,
      totalPages: this.totalPages,
      offset: (this.currentPage - 1) * this.pageSize,
      hasNext: this.currentPage < this.totalPages,
      hasPrev: this.currentPage > 1
    };
  }

  /**
   * Réinitialise à la première page
   */
  reset() {
    this.goToPage(1);
  }

  /**
   * Détruit le composant et nettoie les ressources
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.changeHandlers = [];
    this.element = null;
  }

  /**
   * Crée un composant statique
   * @param {HTMLElement} container - Conteneur
   * @param {Object} [options] - Options
   * @returns {PaginationComponent} Instance du composant
   */
  static create(container, options = {}) {
    const component = new PaginationComponent(options);
    component.render(container);
    return component;
  }
}

export default PaginationComponent;