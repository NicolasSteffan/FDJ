/**
 * FDJ Project - DataSource Model
 * Modèle représentant une source de données pour le scraping
 * 
 * @class DataSource
 * @description Encapsule les informations et la logique d'une source de données
 */

class DataSource {
  /**
   * Crée une instance de DataSource
   * @param {Object} data - Données de la source
   * @param {string} data.id - Identifiant unique de la source
   * @param {string} data.name - Nom de la source
   * @param {string} data.baseUrl - URL de base
   * @param {string} data.type - Type de source (official, mirror, api)
   * @param {boolean} [data.isActive=true] - Si la source est active
   * @param {Object} [data.config] - Configuration spécifique
   * @param {Object} [data.selectors] - Sélecteurs CSS pour le scraping
   * @param {Object} [data.rateLimit] - Configuration de limitation de débit
   */
  constructor(data) {
    this.validateData(data);
    
    this.id = data.id;
    this.name = data.name;
    this.baseUrl = data.baseUrl;
    this.type = data.type;
    this.isActive = data.isActive !== false; // true par défaut
    this.config = data.config || {};
    this.selectors = data.selectors || {};
    this.rateLimit = data.rateLimit || { requests: 10, perMinute: 1 };
    
    // Métriques de performance
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastSuccessAt: null,
      lastFailureAt: null,
      lastError: null,
      availability: 1.0
    };
    
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Valide les données d'entrée
   * @param {Object} data - Données à valider
   * @throws {Error} Si les données sont invalides
   */
  validateData(data) {
    if (!data) {
      throw new Error('DataSource data is required');
    }

    if (!data.id || typeof data.id !== 'string') {
      throw new Error('DataSource ID is required and must be a string');
    }

    if (!data.name || typeof data.name !== 'string') {
      throw new Error('DataSource name is required and must be a string');
    }

    if (!data.baseUrl || typeof data.baseUrl !== 'string') {
      throw new Error('DataSource baseUrl is required and must be a string');
    }

    if (!data.type || !['official', 'mirror', 'api'].includes(data.type)) {
      throw new Error('DataSource type must be one of: official, mirror, api');
    }

    // Validation URL
    try {
      new URL(data.baseUrl);
    } catch (error) {
      throw new Error(`Invalid baseUrl: ${data.baseUrl}`);
    }
  }

  /**
   * Construit l'URL complète pour une requête spécifique
   * @param {string} endpoint - Endpoint ou chemin relatif
   * @param {Object} [params] - Paramètres de requête
   * @returns {string} URL complète
   */
  buildUrl(endpoint = '', params = {}) {
    let url = this.baseUrl;
    
    if (endpoint) {
      // Assurer que l'URL se termine par / si nécessaire
      if (!url.endsWith('/') && !endpoint.startsWith('/')) {
        url += '/';
      }
      url += endpoint;
    }

    // Ajouter les paramètres de requête
    if (Object.keys(params).length > 0) {
      const urlObj = new URL(url);
      Object.entries(params).forEach(([key, value]) => {
        urlObj.searchParams.set(key, value);
      });
      url = urlObj.toString();
    }

    return url;
  }

  /**
   * Vérifie si la source peut être utilisée (active et disponible)
   * @returns {boolean} True si utilisable
   */
  isUsable() {
    return this.isActive && this.metrics.availability > 0.5;
  }

  /**
   * Enregistre une requête réussie
   * @param {number} responseTime - Temps de réponse en ms
   */
  recordSuccess(responseTime) {
    this.metrics.totalRequests++;
    this.metrics.successfulRequests++;
    this.metrics.lastSuccessAt = new Date();
    
    // Mise à jour du temps de réponse moyen
    const totalTime = this.metrics.averageResponseTime * (this.metrics.successfulRequests - 1);
    this.metrics.averageResponseTime = (totalTime + responseTime) / this.metrics.successfulRequests;
    
    // Mise à jour de la disponibilité
    this.updateAvailability();
    this.updatedAt = new Date();
  }

  /**
   * Enregistre une requête échouée
   * @param {Error} error - Erreur rencontrée
   */
  recordFailure(error) {
    this.metrics.totalRequests++;
    this.metrics.failedRequests++;
    this.metrics.lastFailureAt = new Date();
    this.metrics.lastError = {
      message: error.message,
      timestamp: new Date().toISOString()
    };
    
    // Mise à jour de la disponibilité
    this.updateAvailability();
    this.updatedAt = new Date();
  }

  /**
   * Met à jour le score de disponibilité
   */
  updateAvailability() {
    if (this.metrics.totalRequests === 0) {
      this.metrics.availability = 1.0;
      return;
    }

    // Calcul basé sur les 100 dernières requêtes ou toutes si moins
    const successRate = this.metrics.successfulRequests / this.metrics.totalRequests;
    
    // Pénalité si échecs récents
    const recentFailurePenalty = this.hasRecentFailures() ? 0.2 : 0;
    
    this.metrics.availability = Math.max(0, successRate - recentFailurePenalty);
  }

  /**
   * Vérifie s'il y a eu des échecs récents (dernière heure)
   * @returns {boolean} True si échecs récents
   */
  hasRecentFailures() {
    if (!this.metrics.lastFailureAt) {
      return false;
    }

    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    return this.metrics.lastFailureAt > oneHourAgo;
  }

  /**
   * Obtient le statut de santé de la source
   * @returns {Object} Statut de santé
   */
  getHealthStatus() {
    const availability = this.metrics.availability;
    let status = 'healthy';
    let message = 'Source functioning normally';

    if (availability < 0.3) {
      status = 'critical';
      message = 'Source experiencing severe issues';
    } else if (availability < 0.7) {
      status = 'degraded';
      message = 'Source experiencing some issues';
    } else if (this.hasRecentFailures()) {
      status = 'warning';
      message = 'Recent failures detected';
    }

    return {
      status,
      message,
      availability,
      isActive: this.isActive,
      isUsable: this.isUsable(),
      lastCheck: this.updatedAt,
      metrics: this.getMetricsSummary()
    };
  }

  /**
   * Obtient un résumé des métriques
   * @returns {Object} Résumé des métriques
   */
  getMetricsSummary() {
    return {
      totalRequests: this.metrics.totalRequests,
      successRate: this.metrics.totalRequests > 0 
        ? (this.metrics.successfulRequests / this.metrics.totalRequests) 
        : 0,
      averageResponseTime: Math.round(this.metrics.averageResponseTime),
      availability: Math.round(this.metrics.availability * 100) / 100,
      lastSuccess: this.metrics.lastSuccessAt,
      lastFailure: this.metrics.lastFailureAt
    };
  }

  /**
   * Désactive temporairement la source
   * @param {string} reason - Raison de la désactivation
   */
  disable(reason) {
    this.isActive = false;
    this.config.disabledReason = reason;
    this.config.disabledAt = new Date().toISOString();
    this.updatedAt = new Date();
  }

  /**
   * Réactive la source
   */
  enable() {
    this.isActive = true;
    delete this.config.disabledReason;
    delete this.config.disabledAt;
    this.updatedAt = new Date();
  }

  /**
   * Réinitialise les métriques de performance
   */
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastSuccessAt: null,
      lastFailureAt: null,
      lastError: null,
      availability: 1.0
    };
    this.updatedAt = new Date();
  }

  /**
   * Vérifie si la source respecte les limites de débit
   * @param {Array} recentRequests - Timestamps des requêtes récentes
   * @returns {boolean} True si dans les limites
   */
  isWithinRateLimit(recentRequests) {
    if (!this.rateLimit || !this.rateLimit.requests || !this.rateLimit.perMinute) {
      return true;
    }

    const now = Date.now();
    const windowMs = (this.rateLimit.perMinute * 60 * 1000);
    const recentInWindow = recentRequests.filter(timestamp => 
      (now - timestamp) < windowMs
    ).length;

    return recentInWindow < this.rateLimit.requests;
  }

  /**
   * Clone la source avec de nouvelles données
   * @param {Object} updates - Mises à jour
   * @returns {DataSource} Nouvelle instance
   */
  clone(updates = {}) {
    const data = { ...this.toJSON(), ...updates };
    return new DataSource(data);
  }

  /**
   * Compare deux sources pour le tri par priorité
   * @param {DataSource} other - Autre source
   * @returns {number} Résultat de comparaison
   */
  comparePriority(other) {
    // Priorisation : officiel > miroir > api
    const typeOrder = { official: 3, mirror: 2, api: 1 };
    const thisOrder = typeOrder[this.type] || 0;
    const otherOrder = typeOrder[other.type] || 0;

    if (thisOrder !== otherOrder) {
      return otherOrder - thisOrder; // Ordre décroissant
    }

    // Si même type, prioriser par disponibilité
    return other.metrics.availability - this.metrics.availability;
  }

  /**
   * Exporte la source en format JSON
   * @returns {Object} Données de la source
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      baseUrl: this.baseUrl,
      type: this.type,
      isActive: this.isActive,
      config: this.config,
      selectors: this.selectors,
      rateLimit: this.rateLimit,
      metrics: this.metrics,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  /**
   * Crée une source à partir de données JSON
   * @param {Object} json - Données JSON
   * @returns {DataSource} Instance de DataSource
   */
  static fromJSON(json) {
    const source = new DataSource(json);
    if (json.metrics) {
      source.metrics = { ...source.metrics, ...json.metrics };
      if (json.metrics.lastSuccessAt) {
        source.metrics.lastSuccessAt = new Date(json.metrics.lastSuccessAt);
      }
      if (json.metrics.lastFailureAt) {
        source.metrics.lastFailureAt = new Date(json.metrics.lastFailureAt);
      }
    }
    if (json.createdAt) {
      source.createdAt = new Date(json.createdAt);
    }
    if (json.updatedAt) {
      source.updatedAt = new Date(json.updatedAt);
    }
    return source;
  }

  /**
   * Représentation textuelle de la source
   * @returns {string} Description de la source
   */
  toString() {
    const status = this.isUsable() ? 'active' : 'inactive';
    const availability = Math.round(this.metrics.availability * 100);
    return `DataSource(${this.name} [${this.type}]: ${status}, ${availability}% available)`;
  }
}

export default DataSource;