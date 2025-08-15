/**
 * FDJ Project - Application Web Refactorisée
 * Version modernisée utilisant la nouvelle architecture OOP
 * 
 * @description Remplace apps/web/app.js avec l'architecture modulaire
 */

// Import de l'architecture OOP
import { initializeApp } from '../../src/index.js';
import DrawController from '../../src/controllers/DrawController.js';
import UIController from '../../src/controllers/UIController.js';
import LotteryBallComponent from '../../src/components/LotteryBallComponent.js';
import DataSourceSelectorComponent from '../../src/components/DataSourceSelectorComponent.js';
import PaginationComponent from '../../src/components/PaginationComponent.js';

/**
 * Classe principale de l'application web
 */
class FDJWebApp {
  constructor() {
    this.app = null;
    this.drawController = null;
    this.uiController = null;
    this.components = {
      dataSourceSelector: null,
      pagination: null,
      lotteryBalls: new Map()
    };
    
    this.isInitialized = false;
    this.currentDataSource = 'json';
  }

  /**
   * Initialise l'application
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialiser l'application principale
      this.app = await initializeApp({
        dataService: { 
          storageType: this.currentDataSource,
          dataPath: './data'
        }
      });

      // Créer les contrôleurs
      this.drawController = new DrawController(
        this.app.dataService, 
        this.app.scrapingService
      );

      this.uiController = new UIController(this.drawController, {
        autoRefresh: false,
        enableAnimations: true,
        defaultPageSize: 10
      });

      // Initialiser les composants
      this.initializeComponents();

      // Configurer les événements globaux
      this.setupGlobalEvents();

      // Initialiser l'interface legacy
      this.initializeLegacyElements();

      this.isInitialized = true;
      console.log('FDJ Web App initialized successfully');

    } catch (error) {
      console.error('Failed to initialize FDJ Web App:', error);
      this.showError('Erreur d\'initialisation de l\'application');
    }
  }

  /**
   * Initialise les composants réutilisables
   */
  initializeComponents() {
    // Sélecteur de source de données
    const selectorContainer = document.getElementById('dataSourceContainer') || 
                             this.createDataSourceContainer();
    
    this.components.dataSourceSelector = new DataSourceSelectorComponent({
      defaultSource: this.currentDataSource,
      style: 'toggle',
      showStatus: true,
      animated: true
    });

    this.components.dataSourceSelector.render(selectorContainer);
    
    // Écouter les changements de source
    this.components.dataSourceSelector.onChange(async (data) => {
      await this.switchDataSource(data.newSource);
    });

    // Pagination pour l'historique
    const paginationContainer = document.getElementById('paginationContainer') ||
                               this.createPaginationContainer();

    this.components.pagination = new PaginationComponent({
      pageSize: 10,
      showInfo: true,
      showSizeSelector: true,
      animated: true
    });

    this.components.pagination.render(paginationContainer);
    
    // Écouter les changements de pagination
    this.components.pagination.onPageChange(async (data) => {
      await this.loadHistoryPage(data.page, data.pageSize);
    });

    this.components.pagination.onSizeChange(async (data) => {
      await this.loadHistoryPage(1, data.pageSize);
    });
  }

  /**
   * Crée le conteneur pour le sélecteur de source
   * @returns {HTMLElement} Conteneur créé
   */
  createDataSourceContainer() {
    const container = document.createElement('div');
    container.id = 'dataSourceContainer';
    container.className = 'data-source-container';
    
    // Insérer avant le contenu principal
    const mainContent = document.querySelector('.content') || document.body;
    mainContent.insertBefore(container, mainContent.firstChild);
    
    return container;
  }

  /**
   * Crée le conteneur pour la pagination
   * @returns {HTMLElement} Conteneur créé
   */
  createPaginationContainer() {
    const container = document.createElement('div');
    container.id = 'paginationContainer';
    container.className = 'pagination-container';
    
    // Insérer après le tableau d'historique
    const historyTable = document.getElementById('historyTable');
    if (historyTable && historyTable.parentNode) {
      historyTable.parentNode.insertBefore(container, historyTable.nextSibling);
    }
    
    return container;
  }

  /**
   * Configure les événements globaux
   */
  setupGlobalEvents() {
    // Remplacer les anciens gestionnaires d'événements
    this.replaceMenuHandlers();
    this.replaceButtonHandlers();
    this.replaceHealthHandler();
    
    // Ajouter les nouveaux gestionnaires
    this.setupCanvasDrawing();
  }

  /**
   * Remplace les gestionnaires de menu
   */
  replaceMenuHandlers() {
    const menu = document.querySelector('.menu');
    if (!menu) return;

    // Supprimer les anciens listeners (clonage pour supprimer tous les listeners)
    const newMenu = menu.cloneNode(true);
    menu.parentNode.replaceChild(newMenu, menu);

    // Ajouter les nouveaux gestionnaires
    newMenu.addEventListener('click', async (e) => {
      const link = e.target.closest('a[data-target]');
      if (!link) return;
      
      e.preventDefault();
      const targetId = link.getAttribute('data-target');
      await this.switchPage(targetId);
    });

    // Gestion des sous-menus (conservée)
    newMenu.addEventListener('mouseover', (e) => {
      const item = e.target.closest('.menu-root > li');
      document.querySelectorAll('.submenu').forEach(s => (s.style.display = 'none'));
      if (!item) return;
      const sm = item.querySelector('.submenu');
      if (sm) sm.style.display = 'block';
    });

    newMenu.addEventListener('mouseleave', () => {
      document.querySelectorAll('.submenu').forEach(s => (s.style.display = 'none'));
    });
  }

  /**
   * Remplace les gestionnaires de boutons
   */
  replaceButtonHandlers() {
    // Bouton d'action principal
    const actionBtn = document.getElementById('actionBtn');
    if (actionBtn) {
      actionBtn.replaceWith(actionBtn.cloneNode(true));
      const newActionBtn = document.getElementById('actionBtn');
      newActionBtn.addEventListener('click', () => {
        this.showToast('Action déclenchée via nouvelle architecture');
      });
    }

    // Bouton de sélection de date
    const btnPick = document.getElementById('btnPick');
    if (btnPick) {
      btnPick.replaceWith(btnPick.cloneNode(true));
      const newBtnPick = document.getElementById('btnPick');
      newBtnPick.addEventListener('click', async () => {
        await this.loadDrawForSelectedDate();
      });
    }

    // Boutons de pagination historique
    this.setupHistoryButtons();
  }

  /**
   * Configure les boutons de l'historique
   */
  setupHistoryButtons() {
    const btnHistLoad = document.getElementById('btnHistLoad');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');

    if (btnHistLoad) {
      btnHistLoad.replaceWith(btnHistLoad.cloneNode(true));
      const newBtnHistLoad = document.getElementById('btnHistLoad');
      newBtnHistLoad.addEventListener('click', async () => {
        await this.refreshHistory();
      });
    }

    if (prevPage) {
      prevPage.replaceWith(prevPage.cloneNode(true));
      const newPrevPage = document.getElementById('prevPage');
      newPrevPage.addEventListener('click', async () => {
        if (this.components.pagination) {
          const state = this.components.pagination.getState();
          if (state.hasPrev) {
            this.components.pagination.goToPage(state.currentPage - 1);
          }
        }
      });
    }

    if (nextPage) {
      nextPage.replaceWith(nextPage.cloneNode(true));
      const newNextPage = document.getElementById('nextPage');
      newNextPage.addEventListener('click', async () => {
        if (this.components.pagination) {
          const state = this.components.pagination.getState();
          if (state.hasNext) {
            this.components.pagination.goToPage(state.currentPage + 1);
          }
        }
      });
    }
  }

  /**
   * Remplace le gestionnaire de santé
   */
  replaceHealthHandler() {
    const btnHealth = document.getElementById('btnHealth');
    const healthOut = document.getElementById('healthOut');
    
    if (btnHealth && healthOut) {
      btnHealth.replaceWith(btnHealth.cloneNode(true));
      const newBtnHealth = document.getElementById('btnHealth');
      
      newBtnHealth.addEventListener('click', async () => {
        healthOut.textContent = 'Chargement...';
        try {
          const stats = this.app.getStatistics();
          healthOut.textContent = JSON.stringify(stats, null, 2);
        } catch (error) {
          healthOut.textContent = 'Erreur: ' + error.message;
        }
      });
    }
  }

  /**
   * Initialise les éléments legacy pour compatibilité
   */
  initializeLegacyElements() {
    // Conserver le rendu du graphique
    this.renderChart();
    
    // Dessiner le canvas du menu
    this.drawCylMenu();
    
    // Configuration des événements de redimensionnement
    window.addEventListener('resize', () => this.drawCylMenu());
  }

  /**
   * Bascule vers une page spécifique
   * @param {string} pageId - ID de la page
   */
  async switchPage(pageId) {
    // Cacher toutes les pages
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));

    // Afficher la page cible
    const targetPage = document.getElementById(pageId);
    if (!targetPage) return;
    
    targetPage.classList.remove('hidden');

    // Actions spécifiques par page avec nouvelle architecture
    switch (pageId) {
      case 'page-monitor-metrics':
        this.renderChart();
        break;
      case 'page-latest':
        await this.loadLatestDraw();
        break;
      case 'page-history':
        await this.loadHistory();
        break;
    }
  }

  /**
   * Charge le dernier tirage
   */
  async loadLatestDraw() {
    const latestCard = document.getElementById('latestCard');
    if (!latestCard) return;

    try {
      latestCard.innerHTML = 'Chargement...';
      const result = await this.drawController.getLatestDraws({ limit: 1 });
      
      if (result.draws && result.draws.length > 0) {
        this.renderDrawWithComponents(result.draws[0], latestCard);
      } else {
        latestCard.textContent = 'Aucun tirage disponible.';
      }
    } catch (error) {
      latestCard.textContent = 'Erreur: ' + error.message;
    }
  }

  /**
   * Charge l'historique des tirages
   */
  async loadHistory() {
    if (!this.components.pagination) return;

    try {
      const state = this.components.pagination.getState();
      await this.loadHistoryPage(state.currentPage, state.pageSize);
    } catch (error) {
      this.showError('Erreur lors du chargement de l\'historique: ' + error.message);
    }
  }

  /**
   * Charge une page spécifique de l'historique
   * @param {number} page - Numéro de page
   * @param {number} pageSize - Taille de page
   */
  async loadHistoryPage(page, pageSize) {
    const tbody = document.querySelector('#historyTable tbody');
    const pageInfo = document.getElementById('pageInfo');
    
    if (!tbody) return;

    try {
      tbody.innerHTML = '<tr><td colspan="3">Chargement...</td></tr>';
      
      const offset = (page - 1) * pageSize;
      const result = await this.drawController.getLatestDraws({ 
        limit: pageSize, 
        offset 
      });

      // Mettre à jour la pagination
      this.components.pagination.update({
        totalItems: result.pagination.total,
        currentPage: page,
        pageSize: pageSize
      });

      // Rendu des tirages avec composants
      this.renderHistoryWithComponents(result.draws, tbody);
      
      // Mettre à jour l'info de page (legacy)
      if (pageInfo) {
        pageInfo.textContent = `Page ${page} (${result.draws.length} tirages)`;
      }

    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="3">Erreur: ${error.message}</td></tr>`;
    }
  }

  /**
   * Rafraîchit l'historique
   */
  async refreshHistory() {
    if (this.components.pagination) {
      this.components.pagination.reset();
      await this.loadHistoryPage(1, this.components.pagination.getState().pageSize);
    }
  }

  /**
   * Charge un tirage pour la date sélectionnée
   */
  async loadDrawForSelectedDate() {
    const datePick = document.getElementById('datePick');
    const latestCard = document.getElementById('latestCard');
    
    if (!datePick || !datePick.value || !latestCard) {
      this.showToast('Veuillez sélectionner une date', 'error');
      return;
    }

    try {
      latestCard.innerHTML = 'Chargement...';
      const draw = await this.drawController.scrapeAndSaveDraw(datePick.value);
      
      if (draw) {
        this.renderDrawWithComponents(draw, latestCard);
        this.showToast('Tirage chargé avec succès');
      } else {
        latestCard.textContent = 'Aucun tirage trouvé pour cette date.';
      }
    } catch (error) {
      latestCard.textContent = 'Erreur: ' + error.message;
    }
  }

  /**
   * Rendu d'un tirage avec les nouveaux composants
   * @param {Draw} draw - Tirage à afficher
   * @param {HTMLElement} container - Conteneur
   */
  renderDrawWithComponents(draw, container) {
    // Créer le conteneur du tirage
    const drawCard = document.createElement('div');
    drawCard.className = 'draw-card';

    // Date du tirage
    const dateElement = document.createElement('div');
    dateElement.className = 'draw-date';
    dateElement.textContent = `Tirage du ${draw.getFormattedDate()}`;
    drawCard.appendChild(dateElement);

    // Composant des boules de loterie
    const ballsComponent = new LotteryBallComponent({
      size: 'normal',
      animated: true,
      theme: 'default'
    });
    
    const ballsElement = ballsComponent.render(draw.numbers, draw.stars);
    drawCard.appendChild(ballsElement);

    // Stocker le composant pour nettoyage futur
    const componentKey = `draw_${draw.id}`;
    if (this.components.lotteryBalls.has(componentKey)) {
      this.components.lotteryBalls.get(componentKey).destroy();
    }
    this.components.lotteryBalls.set(componentKey, ballsComponent);

    // Breakdown des gains (si disponible)
    if (draw.breakdown && draw.breakdown.length > 0) {
      const breakdownElement = this.renderBreakdown(draw.breakdown);
      drawCard.appendChild(breakdownElement);
    }

    // Métadonnées
    if (draw.meta) {
      const metaElement = document.createElement('div');
      metaElement.className = 'draw-meta';
      metaElement.innerHTML = `
        <small>
          Source: ${draw.meta.source || 'N/A'} | 
          Type: ${draw.meta.type || 'N/A'}
        </small>
      `;
      drawCard.appendChild(metaElement);
    }

    // Remplacer le contenu
    container.innerHTML = '';
    container.appendChild(drawCard);
  }

  /**
   * Rendu de l'historique avec les nouveaux composants
   * @param {Draw[]} draws - Liste des tirages
   * @param {HTMLElement} tbody - Corps du tableau
   */
  renderHistoryWithComponents(draws, tbody) {
    if (draws.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3">Aucun tirage disponible</td></tr>';
      return;
    }

    tbody.innerHTML = '';

    draws.forEach(draw => {
      const row = document.createElement('tr');
      row.className = 'draw-row';
      row.dataset.drawId = draw.id;

      // Cellule de date
      const dateCell = document.createElement('td');
      dateCell.innerHTML = `<span class="date-chip">${draw.getFormattedDate()}</span>`;
      row.appendChild(dateCell);

      // Cellule des numéros
      const numbersCell = document.createElement('td');
      const numbersComponent = new LotteryBallComponent({
        size: 'small',
        animated: false,
        compact: true
      });
      const numbersElement = numbersComponent.render(draw.numbers, []);
      numbersCell.appendChild(numbersElement);
      row.appendChild(numbersCell);

      // Cellule des étoiles
      const starsCell = document.createElement('td');
      const starsComponent = new LotteryBallComponent({
        size: 'small',
        animated: false,
        compact: true
      });
      const starsElement = starsComponent.render([], draw.stars);
      starsCell.appendChild(starsElement);
      row.appendChild(starsCell);

      // Stocker les composants
      const numberKey = `history_numbers_${draw.id}`;
      const starKey = `history_stars_${draw.id}`;
      
      if (this.components.lotteryBalls.has(numberKey)) {
        this.components.lotteryBalls.get(numberKey).destroy();
      }
      if (this.components.lotteryBalls.has(starKey)) {
        this.components.lotteryBalls.get(starKey).destroy();
      }
      
      this.components.lotteryBalls.set(numberKey, numbersComponent);
      this.components.lotteryBalls.set(starKey, starsComponent);

      // Événement de clic
      row.addEventListener('click', () => {
        this.showDrawDetails(draw.id);
      });

      tbody.appendChild(row);
    });
  }

  /**
   * Bascule la source de données
   * @param {string} source - Nouvelle source
   */
  async switchDataSource(source) {
    if (source === this.currentDataSource) return;

    try {
      await this.app.switchDataSource(source);
      this.currentDataSource = source;
      
      // Mettre à jour le statut du sélecteur
      this.components.dataSourceSelector.updateSourceStatus(source, {
        available: true,
        lastUpdate: new Date().toISOString()
      });

      this.showToast(`Basculé vers ${source.toUpperCase()}`);
      
      // Rafraîchir les données affichées
      const currentPage = document.querySelector('.page:not(.hidden)');
      if (currentPage) {
        const pageId = currentPage.id;
        if (pageId === 'page-history') {
          await this.refreshHistory();
        } else if (pageId === 'page-latest') {
          await this.loadLatestDraw();
        }
      }

    } catch (error) {
      this.showError(`Erreur lors du changement de source: ${error.message}`);
    }
  }

  /**
   * Affiche les détails d'un tirage
   * @param {string} drawId - ID du tirage
   */
  async showDrawDetails(drawId) {
    try {
      const draw = await this.drawController.getDrawById(drawId);
      if (draw) {
        // Pour l'instant, afficher dans une alerte
        // TODO: Créer un modal ou une page de détails
        alert(`Détails du tirage ${draw.id}:\n${draw.toString()}`);
      }
    } catch (error) {
      this.showError(`Erreur lors du chargement des détails: ${error.message}`);
    }
  }

  // === MÉTHODES LEGACY CONSERVÉES ===

  /**
   * Affiche un toast (legacy compatible)
   * @param {string} message - Message
   * @param {string} type - Type de toast
   */
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => toast.classList.add('hidden'), 3000);
  }

  /**
   * Affiche une erreur
   * @param {string} message - Message d'erreur
   */
  showError(message) {
    this.showToast(message, 'error');
    console.error('App Error:', message);
  }

  /**
   * Rendu du graphique (conservé de l'ancien code)
   */
  renderChart() {
    const chart = document.getElementById('chart');
    if (!chart) return;

    const width = 640; const height = 240; const padding = 28;
    const data = [5, 10, 8, 15, 20, 18, 24, 22, 27, 30];
    const maxV = Math.max(...data);
    const points = data.map((v, i) => {
      const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
      const y = height - padding - (v / maxV) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    chart.innerHTML = '';
    const grid = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    grid.setAttribute('stroke', 'rgba(255,255,255,0.12)');
    for (let i = 0; i < 5; i++) {
      const y = padding + i * ((height - 2 * padding) / 4);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', `${padding}`);
      line.setAttribute('x2', `${width - padding}`);
      line.setAttribute('y1', `${y}`);
      line.setAttribute('y2', `${y}`);
      grid.appendChild(line);
    }
    chart.appendChild(grid);

    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', '#3fb6ff');
    polyline.setAttribute('stroke-width', '2');
    polyline.setAttribute('points', points);
    chart.appendChild(polyline);
  }

  /**
   * Dessine le canvas du menu (conservé)
   */
  drawCylMenu() {
    const menuCanvas = document.getElementById('menuCanvas');
    if (!menuCanvas) return;

    const header = document.querySelector('.topbar');
    const dpr = window.devicePixelRatio || 1;
    const w = header.clientWidth;
    const h = header.clientHeight;
    menuCanvas.style.position = 'absolute';
    menuCanvas.style.left = '0';
    menuCanvas.style.top = '0';
    menuCanvas.style.width = w + 'px';
    menuCanvas.style.height = h + 'px';
    menuCanvas.width = Math.floor(w * dpr);
    menuCanvas.height = Math.floor(h * dpr);
    const ctx = menuCanvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const radius = Math.min(18, h / 2 - 2);
    const padding = 8;
    const barH = Math.max(h - padding * 2, 12);
    const barW = w - padding * 2;
    const x = padding;
    const y = (h - barH) / 2;

    const grd = ctx.createLinearGradient(0, y, 0, y + barH);
    grd.addColorStop(0, 'rgba(255,255,255,0.18)');
    grd.addColorStop(0.5, 'rgba(255,255,255,0.06)');
    grd.addColorStop(1, 'rgba(0,0,0,0.18)');

    ctx.beginPath();
    this.roundRect(ctx, x, y, barW, barH, radius);
    ctx.fillStyle = grd;
    ctx.fill();

    // highlight specular
    ctx.beginPath();
    this.roundRect(ctx, x + 2, y + 2, barW - 4, barH * 0.35, radius * 0.8);
    const hi = ctx.createLinearGradient(0, y + 2, 0, y + 2 + barH * 0.35);
    hi.addColorStop(0, 'rgba(255,255,255,0.25)');
    hi.addColorStop(1, 'rgba(255,255,255,0.02)');
    ctx.fillStyle = hi;
    ctx.fill();

    // shadow bottom
    ctx.beginPath();
    this.roundRect(ctx, x + 2, y + barH * 0.6, barW - 4, barH * 0.35, radius * 0.8);
    const sh = ctx.createLinearGradient(0, y + barH * 0.6, 0, y + barH);
    sh.addColorStop(0, 'rgba(0,0,0,0.08)');
    sh.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = sh;
    ctx.fill();
  }

  /**
   * Dessine un rectangle arrondi (helper legacy)
   */
  roundRect(ctx, x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, height / 2));
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  /**
   * Configure le dessin du canvas
   */
  setupCanvasDrawing() {
    window.addEventListener('resize', () => this.drawCylMenu());
    window.addEventListener('load', () => this.drawCylMenu());
  }

  /**
   * Rendu du breakdown des gains (helper)
   */
  renderBreakdown(breakdown) {
    const table = document.createElement('table');
    table.className = 'breakdown';
    table.innerHTML = `
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
    `;
    return table;
  }

  /**
   * Formate un montant (helper)
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
   * Nettoie les ressources avant fermeture
   */
  cleanup() {
    // Nettoyer les composants
    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    
    this.components.lotteryBalls.forEach(component => {
      component.destroy();
    });
    
    // Nettoyer les contrôleurs
    if (this.drawController) {
      this.drawController.cleanup();
    }
    
    if (this.uiController) {
      this.uiController.cleanup();
    }
  }
}

// Instance globale
const webApp = new FDJWebApp();

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => webApp.initialize());
} else {
  webApp.initialize();
}

// Nettoyer avant fermeture
window.addEventListener('beforeunload', () => webApp.cleanup());

// Exposer globalement pour debug
window.fdjWebApp = webApp;

export default webApp;