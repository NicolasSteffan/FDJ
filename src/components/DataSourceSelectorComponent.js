/**
 * FDJ Project - Data Source Selector Component
 * Composant pour sélectionner entre les sources de données JSON/SQLite
 * 
 * @class DataSourceSelectorComponent
 * @description Composant toggle pour basculer entre les sources de données
 */

class DataSourceSelectorComponent {
  /**
   * Crée une instance de DataSourceSelectorComponent
   * @param {Object} options - Options du composant
   * @param {string} [options.defaultSource='json'] - Source par défaut
   * @param {string} [options.style='toggle'] - Style d'affichage (toggle, radio, dropdown)
   * @param {boolean} [options.showLabels=true] - Afficher les labels
   * @param {boolean} [options.showStatus=true] - Afficher le statut des sources
   */
  constructor(options = {}) {
    this.options = {
      defaultSource: 'json',
      style: 'toggle',
      showLabels: true,
      showStatus: true,
      animated: true,
      ...options
    };

    this.currentSource = this.options.defaultSource;
    this.element = null;
    this.changeHandlers = [];
    this.isEnabled = true;
    
    // Statuts des sources
    this.sourceStatus = {
      json: { available: true, count: 0, lastUpdate: null },
      sqlite: { available: true, count: 0, lastUpdate: null }
    };
  }

  /**
   * Crée et retourne l'élément DOM du composant
   * @param {HTMLElement} [container] - Conteneur où insérer le composant
   * @returns {HTMLElement} Élément DOM créé
   */
  render(container = null) {
    this.element = document.createElement('div');
    this.element.className = this.buildContainerClasses();
    
    // Créer le contenu selon le style
    switch (this.options.style) {
      case 'toggle':
        this.renderToggleStyle();
        break;
      case 'radio':
        this.renderRadioStyle();
        break;
      case 'dropdown':
        this.renderDropdownStyle();
        break;
      default:
        this.renderToggleStyle();
    }
    
    // Ajouter les événements
    this.setupEventListeners();
    
    // Insérer dans le conteneur si fourni
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
    const classes = ['data-source-selector'];
    classes.push(`selector-${this.options.style}`);
    
    if (this.options.animated) {
      classes.push('selector-animated');
    }
    
    if (!this.isEnabled) {
      classes.push('selector-disabled');
    }
    
    return classes.join(' ');
  }

  /**
   * Rendu en style toggle switch
   */
  renderToggleStyle() {
    this.element.innerHTML = `
      <div class="selector-wrapper">
        ${this.options.showLabels ? '<label class="selector-label">Source de données</label>' : ''}
        <div class="toggle-container">
          <div class="toggle-option" data-source="json">
            <span class="option-icon">📄</span>
            <span class="option-text">JSON</span>
            ${this.options.showStatus ? '<span class="option-status"></span>' : ''}
          </div>
          <div class="toggle-switch">
            <div class="toggle-slider"></div>
          </div>
          <div class="toggle-option" data-source="sqlite">
            <span class="option-icon">🗄️</span>
            <span class="option-text">SQLite</span>
            ${this.options.showStatus ? '<span class="option-status"></span>' : ''}
          </div>
        </div>
        <div class="selector-info">
          <small class="current-source-info"></small>
        </div>
      </div>
    `;
    
    this.updateToggleState();
  }

  /**
   * Rendu en style boutons radio
   */
  renderRadioStyle() {
    const radioId = `selector_${Date.now()}`;
    
    this.element.innerHTML = `
      <div class="selector-wrapper">
        ${this.options.showLabels ? '<label class="selector-label">Source de données</label>' : ''}
        <div class="radio-container">
          <div class="radio-option">
            <input type="radio" id="${radioId}_json" name="${radioId}" value="json" ${this.currentSource === 'json' ? 'checked' : ''}>
            <label for="${radioId}_json" class="radio-label">
              <span class="option-icon">📄</span>
              <span class="option-text">Fichiers JSON</span>
              ${this.options.showStatus ? '<span class="option-status"></span>' : ''}
            </label>
          </div>
          <div class="radio-option">
            <input type="radio" id="${radioId}_sqlite" name="${radioId}" value="sqlite" ${this.currentSource === 'sqlite' ? 'checked' : ''}>
            <label for="${radioId}_sqlite" class="radio-label">
              <span class="option-icon">🗄️</span>
              <span class="option-text">Base SQLite</span>
              ${this.options.showStatus ? '<span class="option-status"></span>' : ''}
            </label>
          </div>
        </div>
        <div class="selector-info">
          <small class="current-source-info"></small>
        </div>
      </div>
    `;
  }

  /**
   * Rendu en style dropdown
   */
  renderDropdownStyle() {
    this.element.innerHTML = `
      <div class="selector-wrapper">
        ${this.options.showLabels ? '<label class="selector-label" for="source-select">Source de données</label>' : ''}
        <div class="dropdown-container">
          <select id="source-select" class="source-dropdown">
            <option value="json" ${this.currentSource === 'json' ? 'selected' : ''}>
              📄 Fichiers JSON
            </option>
            <option value="sqlite" ${this.currentSource === 'sqlite' ? 'selected' : ''}>
              🗄️ Base SQLite
            </option>
          </select>
          <div class="dropdown-status">
            ${this.options.showStatus ? '<span class="status-indicator"></span>' : ''}
            <span class="status-text"></span>
          </div>
        </div>
        <div class="selector-info">
          <small class="current-source-info"></small>
        </div>
      </div>
    `;
  }

  /**
   * Configure les gestionnaires d'événements
   */
  setupEventListeners() {
    if (!this.element) return;

    switch (this.options.style) {
      case 'toggle':
        this.setupToggleListeners();
        break;
      case 'radio':
        this.setupRadioListeners();
        break;
      case 'dropdown':
        this.setupDropdownListeners();
        break;
    }
  }

  /**
   * Configure les listeners pour le style toggle
   */
  setupToggleListeners() {
    const toggleContainer = this.element.querySelector('.toggle-container');
    const options = this.element.querySelectorAll('.toggle-option');
    
    options.forEach(option => {
      option.addEventListener('click', () => {
        if (!this.isEnabled) return;
        
        const source = option.dataset.source;
        this.selectSource(source);
      });
    });
    
    // Support clavier
    toggleContainer.addEventListener('keydown', (e) => {
      if (!this.isEnabled) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const newSource = this.currentSource === 'json' ? 'sqlite' : 'json';
        this.selectSource(newSource);
      }
    });
    
    toggleContainer.setAttribute('tabindex', '0');
    toggleContainer.setAttribute('role', 'switch');
    toggleContainer.setAttribute('aria-checked', this.currentSource === 'sqlite');
  }

  /**
   * Configure les listeners pour le style radio
   */
  setupRadioListeners() {
    const radios = this.element.querySelectorAll('input[type="radio"]');
    
    radios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (!this.isEnabled) return;
        
        if (e.target.checked) {
          this.selectSource(e.target.value);
        }
      });
    });
  }

  /**
   * Configure les listeners pour le style dropdown
   */
  setupDropdownListeners() {
    const dropdown = this.element.querySelector('.source-dropdown');
    
    dropdown.addEventListener('change', (e) => {
      if (!this.isEnabled) return;
      
      this.selectSource(e.target.value);
    });
  }

  /**
   * Sélectionne une source de données
   * @param {string} source - Source à sélectionner ('json' ou 'sqlite')
   */
  selectSource(source) {
    if (!['json', 'sqlite'].includes(source) || source === this.currentSource) {
      return;
    }

    const previousSource = this.currentSource;
    this.currentSource = source;
    
    // Mettre à jour l'affichage
    this.updateDisplay();
    
    // Émettre l'événement de changement
    this.emitChange(source, previousSource);
  }

  /**
   * Met à jour l'affichage selon la source sélectionnée
   */
  updateDisplay() {
    switch (this.options.style) {
      case 'toggle':
        this.updateToggleState();
        break;
      case 'radio':
        this.updateRadioState();
        break;
      case 'dropdown':
        this.updateDropdownState();
        break;
    }
    
    this.updateSourceInfo();
    this.updateStatusDisplay();
  }

  /**
   * Met à jour l'état du toggle
   */
  updateToggleState() {
    const slider = this.element.querySelector('.toggle-slider');
    const container = this.element.querySelector('.toggle-container');
    
    if (slider && container) {
      container.classList.toggle('sqlite-selected', this.currentSource === 'sqlite');
      container.setAttribute('aria-checked', this.currentSource === 'sqlite');
      
      if (this.options.animated) {
        slider.style.transform = this.currentSource === 'sqlite' ? 'translateX(100%)' : 'translateX(0%)';
      }
    }
  }

  /**
   * Met à jour l'état des radios
   */
  updateRadioState() {
    const radios = this.element.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
      radio.checked = radio.value === this.currentSource;
    });
  }

  /**
   * Met à jour l'état du dropdown
   */
  updateDropdownState() {
    const dropdown = this.element.querySelector('.source-dropdown');
    if (dropdown) {
      dropdown.value = this.currentSource;
    }
  }

  /**
   * Met à jour les informations sur la source courante
   */
  updateSourceInfo() {
    const infoElement = this.element.querySelector('.current-source-info');
    if (!infoElement) return;
    
    const status = this.sourceStatus[this.currentSource];
    const sourceNames = {
      json: 'Fichiers JSON',
      sqlite: 'Base de données SQLite'
    };
    
    let info = `Source active: ${sourceNames[this.currentSource]}`;
    
    if (status.count > 0) {
      info += ` (${status.count} tirages)`;
    }
    
    if (status.lastUpdate) {
      const updateTime = new Date(status.lastUpdate).toLocaleTimeString('fr-FR');
      info += ` - Dernière maj: ${updateTime}`;
    }
    
    infoElement.textContent = info;
  }

  /**
   * Met à jour l'affichage du statut des sources
   */
  updateStatusDisplay() {
    if (!this.options.showStatus) return;
    
    ['json', 'sqlite'].forEach(source => {
      const statusElement = this.element.querySelector(`[data-source="${source}"] .option-status, .option-status`);
      if (statusElement) {
        const status = this.sourceStatus[source];
        statusElement.className = `option-status status-${status.available ? 'available' : 'unavailable'}`;
        statusElement.textContent = status.available ? '✓' : '✗';
        statusElement.title = status.available ? 'Source disponible' : 'Source indisponible';
      }
    });
  }

  /**
   * Met à jour le statut d'une source
   * @param {string} source - Source à mettre à jour
   * @param {Object} status - Nouveau statut
   */
  updateSourceStatus(source, status) {
    if (this.sourceStatus[source]) {
      this.sourceStatus[source] = { ...this.sourceStatus[source], ...status };
      this.updateStatusDisplay();
      this.updateSourceInfo();
    }
  }

  /**
   * Active ou désactive le composant
   * @param {boolean} enabled - État d'activation
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    
    if (this.element) {
      this.element.classList.toggle('selector-disabled', !enabled);
      
      // Désactiver les éléments interactifs
      const interactiveElements = this.element.querySelectorAll('input, select, [tabindex]');
      interactiveElements.forEach(el => {
        el.disabled = !enabled;
        if (!enabled) {
          el.setAttribute('tabindex', '-1');
        } else {
          el.removeAttribute('tabindex');
        }
      });
    }
  }

  /**
   * Ajoute un gestionnaire de changement
   * @param {Function} handler - Fonction appelée lors du changement
   */
  onChange(handler) {
    if (typeof handler === 'function') {
      this.changeHandlers.push(handler);
    }
  }

  /**
   * Supprime un gestionnaire de changement
   * @param {Function} handler - Gestionnaire à supprimer
   */
  offChange(handler) {
    const index = this.changeHandlers.indexOf(handler);
    if (index > -1) {
      this.changeHandlers.splice(index, 1);
    }
  }

  /**
   * Émet l'événement de changement
   * @param {string} newSource - Nouvelle source
   * @param {string} previousSource - Source précédente
   */
  emitChange(newSource, previousSource) {
    const eventData = {
      newSource,
      previousSource,
      timestamp: new Date().toISOString()
    };
    
    // Appeler les gestionnaires enregistrés
    this.changeHandlers.forEach(handler => {
      try {
        handler(eventData);
      } catch (error) {
        console.error('Error in change handler:', error);
      }
    });
    
    // Émettre un événement DOM personnalisé
    if (this.element) {
      const customEvent = new CustomEvent('sourceChange', {
        detail: eventData,
        bubbles: true
      });
      this.element.dispatchEvent(customEvent);
    }
  }

  /**
   * Obtient la source actuellement sélectionnée
   * @returns {string} Source courante
   */
  getCurrentSource() {
    return this.currentSource;
  }

  /**
   * Obtient le statut de toutes les sources
   * @returns {Object} Statuts des sources
   */
  getSourceStatuses() {
    return { ...this.sourceStatus };
  }

  /**
   * Force une source spécifique (sans émettre d'événement)
   * @param {string} source - Source à forcer
   */
  setSourceSilently(source) {
    if (['json', 'sqlite'].includes(source)) {
      this.currentSource = source;
      this.updateDisplay();
    }
  }

  /**
   * Vérifie si une source est disponible
   * @param {string} source - Source à vérifier
   * @returns {boolean} True si disponible
   */
  isSourceAvailable(source) {
    return this.sourceStatus[source]?.available || false;
  }

  /**
   * Effectue une animation de transition
   * @param {string} direction - Direction de la transition
   */
  animateTransition(direction = 'slide') {
    if (!this.options.animated || !this.element) return;
    
    this.element.classList.add(`transition-${direction}`);
    
    setTimeout(() => {
      this.element.classList.remove(`transition-${direction}`);
    }, 300);
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
   * @returns {DataSourceSelectorComponent} Instance du composant
   */
  static create(container, options = {}) {
    const component = new DataSourceSelectorComponent(options);
    component.render(container);
    return component;
  }
}

export default DataSourceSelectorComponent;