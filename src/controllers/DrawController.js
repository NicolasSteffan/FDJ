/**
 * FDJ Project - Draw Controller
 * Contrôleur responsable de la gestion des tirages
 * 
 * @class DrawController
 * @description Gère la logique métier des tirages (CRUD, recherche, statistiques)
 */

import Draw from '../models/Draw.js';

class DrawController {
  /**
   * Crée une instance de DrawController
   * @param {DataService} dataService - Service de données
   * @param {ScrapingService} scrapingService - Service de scraping
   */
  constructor(dataService, scrapingService) {
    this.dataService = dataService;
    this.scrapingService = scrapingService;
    this.cache = new Map();
    this.listeners = new Map(); // Event listeners
  }

  /**
   * Récupère les derniers tirages avec pagination
   * @param {Object} options - Options de récupération
   * @param {number} [options.limit=10] - Nombre de tirages
   * @param {number} [options.offset=0] - Décalage
   * @param {boolean} [options.useCache=true] - Utiliser le cache
   * @returns {Promise<Object>} Résultat avec tirages et métadonnées
   */
  async getLatestDraws(options = {}) {
    const { limit = 10, offset = 0, useCache = true } = options;
    
    const cacheKey = `latest_${limit}_${offset}`;
    
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 60000) { // Cache 1 minute
        return cached.data;
      }
    }

    try {
      const draws = await this.dataService.getLatestDraws(limit, offset);
      const totalCount = await this.dataService.getTotalDrawCount();
      
      const result = {
        draws,
        pagination: {
          limit,
          offset,
          total: totalCount,
          hasNext: offset + limit < totalCount,
          hasPrev: offset > 0,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: Math.floor(offset / limit) + 1
        },
        timestamp: new Date().toISOString()
      };

      // Mettre en cache
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      this.emit('drawsLoaded', { draws, pagination: result.pagination });
      
      return result;
      
    } catch (error) {
      this.emit('error', { action: 'getLatestDraws', error });
      throw new Error(`Failed to get latest draws: ${error.message}`);
    }
  }

  /**
   * Récupère un tirage par ID
   * @param {string} drawId - ID du tirage
   * @param {boolean} [useCache=true] - Utiliser le cache
   * @returns {Promise<Draw|null>} Tirage ou null
   */
  async getDrawById(drawId, useCache = true) {
    const cacheKey = `draw_${drawId}`;
    
    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const draw = await this.dataService.getDrawById(drawId);
      
      if (draw) {
        this.cache.set(cacheKey, {
          data: draw,
          timestamp: Date.now()
        });
        
        this.emit('drawLoaded', { draw });
      }
      
      return draw;
      
    } catch (error) {
      this.emit('error', { action: 'getDrawById', error, drawId });
      throw new Error(`Failed to get draw ${drawId}: ${error.message}`);
    }
  }

  /**
   * Recherche des tirages par date
   * @param {Date|string} startDate - Date de début
   * @param {Date|string} [endDate] - Date de fin (optionnelle)
   * @returns {Promise<Draw[]>} Tirages trouvés
   */
  async getDrawsByDateRange(startDate, endDate = null) {
    try {
      const start = startDate instanceof Date ? startDate : new Date(startDate);
      const end = endDate ? (endDate instanceof Date ? endDate : new Date(endDate)) : new Date();
      
      // Pour l'instant, récupérer tous et filtrer (à optimiser avec requête SQL)
      const allDraws = await this.dataService.getLatestDraws(1000, 0);
      
      const filteredDraws = allDraws.filter(draw => {
        const drawDate = draw.date;
        return drawDate >= start && drawDate <= end;
      });

      this.emit('drawsSearched', { 
        startDate: start, 
        endDate: end, 
        count: filteredDraws.length 
      });
      
      return filteredDraws;
      
    } catch (error) {
      this.emit('error', { action: 'getDrawsByDateRange', error, startDate, endDate });
      throw new Error(`Failed to search draws by date: ${error.message}`);
    }
  }

  /**
   * Scrappe et sauvegarde un tirage pour une date
   * @param {Date|string} date - Date du tirage
   * @param {Object} [options] - Options de scraping
   * @returns {Promise<Draw|null>} Tirage scrapé et sauvegardé
   */
  async scrapeAndSaveDraw(date, options = {}) {
    try {
      this.emit('scrapingStarted', { date });
      
      const draw = await this.scrapingService.scrapeDrawForDate(date, options);
      
      if (draw) {
        const saved = await this.dataService.saveDraw(draw);
        
        if (saved) {
          // Invalider le cache
          this.invalidateCache();
          
          this.emit('drawScraped', { draw });
          return draw;
        } else {
          throw new Error('Failed to save scraped draw');
        }
      }
      
      this.emit('scrapingCompleted', { date, success: false });
      return null;
      
    } catch (error) {
      this.emit('scrapingFailed', { date, error });
      this.emit('error', { action: 'scrapeAndSaveDraw', error, date });
      throw new Error(`Failed to scrape draw for ${date}: ${error.message}`);
    }
  }

  /**
   * Calcule les statistiques globales des tirages
   * @param {Object} [options] - Options de calcul
   * @param {number} [options.limit] - Limite de tirages à analyser
   * @returns {Promise<Object>} Statistiques complètes
   */
  async getDrawStatistics(options = {}) {
    try {
      const { limit = 100 } = options;
      const draws = await this.dataService.getLatestDraws(limit, 0);
      
      if (draws.length === 0) {
        return { error: 'No draws available for statistics' };
      }

      const stats = {
        totalDraws: draws.length,
        dateRange: {
          oldest: draws[draws.length - 1]?.getFormattedDate(),
          newest: draws[0]?.getFormattedDate()
        },
        numbers: this.calculateNumberStatistics(draws),
        stars: this.calculateStarStatistics(draws),
        patterns: this.calculatePatternStatistics(draws),
        jackpots: this.calculateJackpotStatistics(draws)
      };

      this.emit('statisticsCalculated', { stats, analyzedCount: draws.length });
      
      return stats;
      
    } catch (error) {
      this.emit('error', { action: 'getDrawStatistics', error });
      throw new Error(`Failed to calculate statistics: ${error.message}`);
    }
  }

  /**
   * Calcule les statistiques des numéros principaux
   * @param {Draw[]} draws - Liste des tirages
   * @returns {Object} Statistiques des numéros
   */
  calculateNumberStatistics(draws) {
    const frequency = new Map();
    const lastAppearance = new Map();
    let totalSum = 0;

    draws.forEach((draw, index) => {
      draw.numbers.forEach(num => {
        // Fréquence
        frequency.set(num, (frequency.get(num) || 0) + 1);
        
        // Dernière apparition (index inversé pour avoir la plus récente)
        if (!lastAppearance.has(num)) {
          lastAppearance.set(num, index);
        }
        
        totalSum += num;
      });
    });

    // Trier par fréquence
    const sortedByFreq = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1]);

    // Calculer les moyennes
    const totalNumbers = draws.length * 5;
    const averageNumber = totalSum / totalNumbers;

    return {
      frequency: Object.fromEntries(frequency),
      mostFrequent: sortedByFreq.slice(0, 10),
      leastFrequent: sortedByFreq.slice(-10).reverse(),
      average: Math.round(averageNumber * 100) / 100,
      distribution: this.calculateDistribution(frequency, 1, 50)
    };
  }

  /**
   * Calcule les statistiques des étoiles
   * @param {Draw[]} draws - Liste des tirages
   * @returns {Object} Statistiques des étoiles
   */
  calculateStarStatistics(draws) {
    const frequency = new Map();
    let totalSum = 0;

    draws.forEach(draw => {
      draw.stars.forEach(star => {
        frequency.set(star, (frequency.get(star) || 0) + 1);
        totalSum += star;
      });
    });

    const sortedByFreq = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1]);

    const totalStars = draws.length * 2;
    const averageStar = totalSum / totalStars;

    return {
      frequency: Object.fromEntries(frequency),
      mostFrequent: sortedByFreq.slice(0, 5),
      leastFrequent: sortedByFreq.slice(-5).reverse(),
      average: Math.round(averageStar * 100) / 100,
      distribution: this.calculateDistribution(frequency, 1, 12)
    };
  }

  /**
   * Calcule les statistiques de patterns
   * @param {Draw[]} draws - Liste des tirages
   * @returns {Object} Statistiques de patterns
   */
  calculatePatternStatistics(draws) {
    let consecutiveCount = 0;
    const parityStats = { evenDominant: 0, oddDominant: 0, balanced: 0 };
    const sumRanges = { low: 0, medium: 0, high: 0 };

    draws.forEach(draw => {
      // Numéros consécutifs
      if (draw.hasConsecutiveNumbers()) {
        consecutiveCount++;
      }

      // Parité
      const parity = draw.getParityStats();
      if (parity.numbers.even > parity.numbers.odd) {
        parityStats.evenDominant++;
      } else if (parity.numbers.odd > parity.numbers.even) {
        parityStats.oddDominant++;
      } else {
        parityStats.balanced++;
      }

      // Somme des numéros
      const sum = draw.numbers.reduce((s, n) => s + n, 0);
      if (sum < 100) sumRanges.low++;
      else if (sum < 150) sumRanges.medium++;
      else sumRanges.high++;
    });

    return {
      consecutiveNumbers: {
        count: consecutiveCount,
        percentage: Math.round((consecutiveCount / draws.length) * 100)
      },
      parity: parityStats,
      sumDistribution: sumRanges
    };
  }

  /**
   * Calcule les statistiques des jackpots
   * @param {Draw[]} draws - Liste des tirages
   * @returns {Object} Statistiques des jackpots
   */
  calculateJackpotStatistics(draws) {
    const jackpots = draws
      .map(draw => draw.getJackpot())
      .filter(amount => amount > 0);

    if (jackpots.length === 0) {
      return { error: 'No jackpot data available' };
    }

    const sorted = [...jackpots].sort((a, b) => a - b);
    const sum = jackpots.reduce((s, j) => s + j, 0);

    return {
      count: jackpots.length,
      average: Math.round(sum / jackpots.length),
      median: sorted[Math.floor(sorted.length / 2)],
      min: sorted[0],
      max: sorted[sorted.length - 1],
      total: sum
    };
  }

  /**
   * Calcule la distribution dans des plages
   * @param {Map} frequency - Map des fréquences
   * @param {number} min - Valeur minimale
   * @param {number} max - Valeur maximale
   * @returns {Object} Distribution par déciles
   */
  calculateDistribution(frequency, min, max) {
    const range = max - min + 1;
    const bucketSize = Math.ceil(range / 5);
    const distribution = {};

    for (let i = 0; i < 5; i++) {
      const start = min + (i * bucketSize);
      const end = Math.min(start + bucketSize - 1, max);
      const key = `${start}-${end}`;
      distribution[key] = 0;

      for (let num = start; num <= end; num++) {
        distribution[key] += frequency.get(num) || 0;
      }
    }

    return distribution;
  }

  /**
   * Invalide le cache
   * @param {string} [pattern] - Pattern à invalider (optionnel)
   */
  invalidateCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    
    this.emit('cacheInvalidated', { pattern });
  }

  /**
   * Ajoute un listener d'événement
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Fonction de callback
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Supprime un listener d'événement
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Fonction de callback
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Émet un événement
   * @param {string} event - Nom de l'événement
   * @param {Object} data - Données de l'événement
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Obtient les statistiques du contrôleur
   * @returns {Object} Statistiques
   */
  getControllerStats() {
    return {
      cacheSize: this.cache.size,
      listenersCount: Array.from(this.listeners.values())
        .reduce((total, callbacks) => total + callbacks.length, 0)
    };
  }

  /**
   * Nettoie les ressources du contrôleur
   */
  cleanup() {
    this.cache.clear();
    this.listeners.clear();
  }
}

export default DrawController;