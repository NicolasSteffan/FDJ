/**
 * FDJ Project - Scraping Service
 * Service responsable du scraping des données de tirage
 * 
 * @class ScrapingService
 * @description Gère la collecte de données depuis les sources configurées
 */

import DataSource from '../models/DataSource.js';
import Draw from '../models/Draw.js';

class ScrapingService {
  /**
   * Crée une instance de ScrapingService
   * @param {Object} options - Options de configuration
   * @param {DataSource[]} [options.sources] - Sources de données configurées
   * @param {Object} [options.config] - Configuration générale
   */
  constructor(options = {}) {
    this.sources = options.sources || [];
    this.config = {
      maxRetries: 3,
      timeoutMs: 10000,
      rateLimitWindow: 60000, // 1 minute
      userAgent: 'FDJ-Analytics/1.0',
      ...options.config
    };
    
    this.requestHistory = new Map(); // Track requests per source
    this.cache = new Map(); // Simple cache for recent requests
    this.isRunning = false;
    this.activeRequests = new Set();
  }

  /**
   * Ajoute une source de données
   * @param {DataSource} source - Source à ajouter
   */
  addSource(source) {
    if (!(source instanceof DataSource)) {
      throw new Error('Source must be an instance of DataSource');
    }
    
    if (!this.sources.find(s => s.id === source.id)) {
      this.sources.push(source);
    }
  }

  /**
   * Supprime une source de données
   * @param {string} sourceId - ID de la source à supprimer
   */
  removeSource(sourceId) {
    this.sources = this.sources.filter(s => s.id !== sourceId);
    this.requestHistory.delete(sourceId);
  }

  /**
   * Obtient les sources actives triées par priorité
   * @returns {DataSource[]} Sources utilisables triées
   */
  getActiveSources() {
    return this.sources
      .filter(source => source.isUsable())
      .sort((a, b) => a.comparePriority(b));
  }

  /**
   * Scrappe les données pour une date spécifique
   * @param {string|Date} date - Date du tirage à scraper
   * @param {Object} [options] - Options de scraping
   * @returns {Promise<Draw|null>} Données du tirage ou null
   */
  async scrapeDrawForDate(date, options = {}) {
    const targetDate = date instanceof Date ? date : new Date(date);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    // Vérifier le cache
    const cacheKey = `draw_${dateStr}`;
    if (this.cache.has(cacheKey) && !options.forceRefresh) {
      return this.cache.get(cacheKey);
    }

    const activeSources = this.getActiveSources();
    if (activeSources.length === 0) {
      throw new Error('No active sources available for scraping');
    }

    let lastError = null;
    
    // Essayer chaque source jusqu'à obtenir des données
    for (const source of activeSources) {
      try {
        if (!this.canMakeRequest(source)) {
          continue; // Skip if rate limited
        }

        const drawData = await this.scrapeFromSource(source, targetDate, options);
        if (drawData) {
          // Cache the result
          this.cache.set(cacheKey, drawData);
          
          // Clean old cache entries
          this.cleanCache();
          
          return drawData;
        }
      } catch (error) {
        lastError = error;
        source.recordFailure(error);
        console.warn(`Scraping failed for source ${source.name}:`, error.message);
      }
    }

    throw new Error(`Failed to scrape draw for date ${dateStr}: ${lastError?.message || 'All sources failed'}`);
  }

  /**
   * Scrappe depuis une source spécifique
   * @param {DataSource} source - Source à utiliser
   * @param {Date} date - Date du tirage
   * @param {Object} options - Options de scraping
   * @returns {Promise<Draw|null>} Données scrapées
   */
  async scrapeFromSource(source, date, options = {}) {
    const startTime = Date.now();
    const requestId = `${source.id}_${Date.now()}`;
    
    this.activeRequests.add(requestId);
    this.recordRequest(source.id);
    
    try {
      let drawData = null;
      
      if (source.type === 'api') {
        drawData = await this.scrapeFromAPI(source, date, options);
      } else {
        drawData = await this.scrapeFromHTML(source, date, options);
      }

      const responseTime = Date.now() - startTime;
      source.recordSuccess(responseTime);
      
      return drawData;
      
    } finally {
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Scrappe depuis une API
   * @param {DataSource} source - Source API
   * @param {Date} date - Date du tirage
   * @param {Object} options - Options
   * @returns {Promise<Draw|null>} Données scrapées
   */
  async scrapeFromAPI(source, date, options = {}) {
    const dateStr = date.toISOString().split('T')[0];
    const url = source.buildUrl(source.config.endpoint || 'draws', { date: dateStr });
    
    const response = await this.makeRequest(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': this.config.userAgent,
        ...source.config.headers
      },
      timeout: this.config.timeoutMs
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseAPIResponse(data, source);
  }

  /**
   * Scrappe depuis du HTML
   * @param {DataSource} source - Source HTML
   * @param {Date} date - Date du tirage
   * @param {Object} options - Options
   * @returns {Promise<Draw|null>} Données scrapées
   */
  async scrapeFromHTML(source, date, options = {}) {
    const dateStr = date.toISOString().split('T')[0];
    const url = source.buildUrl(source.config.drawPath || '', { date: dateStr });
    
    const response = await this.makeRequest(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': this.config.userAgent,
        ...source.config.headers
      },
      timeout: this.config.timeoutMs
    });

    if (!response.ok) {
      throw new Error(`HTML request failed: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    return this.parseHTMLResponse(html, source, date);
  }

  /**
   * Parse une réponse API
   * @param {Object} data - Données JSON
   * @param {DataSource} source - Source utilisée
   * @returns {Draw|null} Tirage parsé
   */
  parseAPIResponse(data, source) {
    try {
      // Structure attendue selon la source
      const drawData = data.draw || data.result || data;
      
      if (!drawData.numbers || !drawData.stars) {
        return null;
      }

      return new Draw({
        date: drawData.date,
        numbers: drawData.numbers,
        stars: drawData.stars,
        breakdown: drawData.breakdown || drawData.payouts || [],
        meta: {
          source: source.id,
          scrapedAt: new Date().toISOString(),
          type: 'api'
        }
      });
    } catch (error) {
      throw new Error(`Failed to parse API response from ${source.name}: ${error.message}`);
    }
  }

  /**
   * Parse une réponse HTML
   * @param {string} html - Contenu HTML
   * @param {DataSource} source - Source utilisée
   * @param {Date} date - Date du tirage
   * @returns {Draw|null} Tirage parsé
   */
  parseHTMLResponse(html, source, date) {
    try {
      // Utiliser DOMParser si disponible (navigateur) ou cheerio-like parsing
      const parser = typeof DOMParser !== 'undefined' 
        ? new DOMParser() 
        : this.createHTMLParser();
        
      const doc = parser.parseFromString ? 
        parser.parseFromString(html, 'text/html') : 
        parser(html);

      const selectors = source.selectors;
      if (!selectors || !selectors.numbers || !selectors.stars) {
        throw new Error('HTML selectors not configured for source');
      }

      // Extraire les numéros
      const numberElements = this.querySelectorAll(doc, selectors.numbers);
      const numbers = Array.from(numberElements)
        .map(el => parseInt(this.getTextContent(el).trim()))
        .filter(n => !isNaN(n));

      // Extraire les étoiles
      const starElements = this.querySelectorAll(doc, selectors.stars);
      const stars = Array.from(starElements)
        .map(el => parseInt(this.getTextContent(el).trim()))
        .filter(n => !isNaN(n));

      if (numbers.length !== 5 || stars.length !== 2) {
        throw new Error(`Invalid extracted data: ${numbers.length} numbers, ${stars.length} stars`);
      }

      // Extraire le breakdown si les sélecteurs sont disponibles
      let breakdown = [];
      if (selectors.breakdown) {
        breakdown = this.extractBreakdown(doc, selectors.breakdown);
      }

      return new Draw({
        date: date.toISOString(),
        numbers,
        stars,
        breakdown,
        meta: {
          source: source.id,
          scrapedAt: new Date().toISOString(),
          type: 'html'
        }
      });

    } catch (error) {
      throw new Error(`Failed to parse HTML response from ${source.name}: ${error.message}`);
    }
  }

  /**
   * Vérifie si une requête peut être faite (rate limiting)
   * @param {DataSource} source - Source à vérifier
   * @returns {boolean} True si autorisé
   */
  canMakeRequest(source) {
    const history = this.requestHistory.get(source.id) || [];
    return source.isWithinRateLimit(history);
  }

  /**
   * Enregistre une requête pour le rate limiting
   * @param {string} sourceId - ID de la source
   */
  recordRequest(sourceId) {
    const now = Date.now();
    const history = this.requestHistory.get(sourceId) || [];
    
    // Ajouter la requête actuelle
    history.push(now);
    
    // Nettoyer l'historique (garder seulement la dernière heure)
    const oneHourAgo = now - (60 * 60 * 1000);
    const cleanHistory = history.filter(timestamp => timestamp > oneHourAgo);
    
    this.requestHistory.set(sourceId, cleanHistory);
  }

  /**
   * Effectue une requête HTTP avec retry
   * @param {string} url - URL à requêter
   * @param {Object} options - Options de requête
   * @returns {Promise<Response>} Réponse HTTP
   */
  async makeRequest(url, options = {}) {
    let lastError = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeoutMs);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
        
      } catch (error) {
        lastError = error;
        
        if (attempt < this.config.maxRetries) {
          // Attendre avant le retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Nettoie le cache des anciens éléments
   */
  cleanCache() {
    const maxCacheAge = 30 * 60 * 1000; // 30 minutes
    const now = Date.now();
    
    for (const [key, value] of this.cache.entries()) {
      if (value && value.meta && value.meta.scrapedAt) {
        const age = now - new Date(value.meta.scrapedAt).getTime();
        if (age > maxCacheAge) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * Helpers pour le parsing HTML (dépendant de l'environnement)
   */
  querySelectorAll(doc, selector) {
    return doc.querySelectorAll ? doc.querySelectorAll(selector) : [];
  }

  getTextContent(element) {
    return element.textContent || element.innerText || '';
  }

  extractBreakdown(doc, selectors) {
    // Implémentation basique - à adapter selon la structure HTML
    return [];
  }

  createHTMLParser() {
    // Fallback pour environnement Node.js
    throw new Error('HTML parsing requires DOMParser or server-side implementation');
  }

  /**
   * Obtient les statistiques du service
   * @returns {Object} Statistiques
   */
  getStatistics() {
    return {
      totalSources: this.sources.length,
      activeSources: this.getActiveSources().length,
      activeRequests: this.activeRequests.size,
      cacheSize: this.cache.size,
      isRunning: this.isRunning,
      sources: this.sources.map(s => s.getHealthStatus())
    };
  }

  /**
   * Nettoie les ressources du service
   */
  cleanup() {
    this.cache.clear();
    this.requestHistory.clear();
    this.activeRequests.clear();
    this.isRunning = false;
  }
}

export default ScrapingService;