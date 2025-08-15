/**
 * FDJ Project - Main Entry Point
 * Point d'entrée principal pour l'architecture OOP refactorisée
 * 
 * @description Initialise et configure tous les services et contrôleurs
 */

// Import des modèles
import Draw from './models/Draw.js';
import Prediction from './models/Prediction.js';
import DataSource from './models/DataSource.js';

// Import des services
import ScrapingService from './services/ScrapingService.js';
import DataService from './services/DataService.js';

// Configuration par défaut
const DEFAULT_CONFIG = {
  dataService: {
    storageType: 'json', // ou 'sqlite'
    dataPath: './data'
  },
  scrapingService: {
    maxRetries: 3,
    timeoutMs: 10000,
    userAgent: 'FDJ-Analytics/1.0'
  }
};

/**
 * Classe principale de l'application FDJ
 * @class FDJApp
 */
class FDJApp {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialisation des services
    this.dataService = new DataService(this.config.dataService);
    this.scrapingService = new ScrapingService(this.config.scrapingService);
    
    // État de l'application
    this.isInitialized = false;
    this.currentDataSource = 'json'; // json | sqlite
  }

  /**
   * Initialise l'application
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialiser le service de données
      await this.dataService.initialize();
      
      // Configurer les sources de scraping par défaut
      this.setupDefaultSources();
      
      this.isInitialized = true;
      console.log('FDJ App initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize FDJ App:', error);
      throw error;
    }
  }

  /**
   * Configure les sources de données par défaut
   */
  setupDefaultSources() {
    // Source officielle FDJ (exemple)
    const officialSource = new DataSource({
      id: 'fdj_official',
      name: 'FDJ Official',
      baseUrl: 'https://www.fdj.fr',
      type: 'official',
      selectors: {
        numbers: '.lottery-numbers .number',
        stars: '.lottery-stars .star'
      }
    });

    // Source API alternative (exemple)
    const apiSource = new DataSource({
      id: 'euromillions_api',
      name: 'EuroMillions API',
      baseUrl: 'https://api.euromillions.com',
      type: 'api',
      config: {
        endpoint: '/v1/draws'
      }
    });

    this.scrapingService.addSource(officialSource);
    this.scrapingService.addSource(apiSource);
  }

  /**
   * Bascule entre les sources de données (JSON/SQLite)
   * @param {string} sourceType - Type de source ('json' ou 'sqlite')
   * @returns {Promise<void>}
   */
  async switchDataSource(sourceType) {
    if (!['json', 'sqlite'].includes(sourceType)) {
      throw new Error('Data source must be "json" or "sqlite"');
    }

    if (this.currentDataSource === sourceType) {
      return; // Déjà configuré
    }

    // Fermer l'ancien service
    await this.dataService.close();

    // Créer un nouveau service avec le bon type
    this.dataService = new DataService({
      ...this.config.dataService,
      storageType: sourceType
    });

    await this.dataService.initialize();
    this.currentDataSource = sourceType;

    console.log(`Switched to ${sourceType} data source`);
  }

  /**
   * Récupère les derniers tirages
   * @param {number} limit - Nombre de tirages
   * @param {number} offset - Décalage
   * @returns {Promise<Draw[]>} Liste des tirages
   */
  async getLatestDraws(limit = 10, offset = 0) {
    await this.initialize();
    return this.dataService.getLatestDraws(limit, offset);
  }

  /**
   * Récupère un tirage par ID
   * @param {string} drawId - ID du tirage
   * @returns {Promise<Draw|null>} Tirage ou null
   */
  async getDrawById(drawId) {
    await this.initialize();
    return this.dataService.getDrawById(drawId);
  }

  /**
   * Scrappe un tirage pour une date
   * @param {string|Date} date - Date du tirage
   * @param {Object} options - Options de scraping
   * @returns {Promise<Draw|null>} Tirage scrapé
   */
  async scrapeDrawForDate(date, options = {}) {
    await this.initialize();
    
    const draw = await this.scrapingService.scrapeDrawForDate(date, options);
    
    if (draw) {
      // Sauvegarder automatiquement le tirage scrapé
      await this.dataService.saveDraw(draw);
    }
    
    return draw;
  }

  /**
   * Obtient les statistiques globales
   * @returns {Object} Statistiques
   */
  getStatistics() {
    return {
      app: {
        isInitialized: this.isInitialized,
        currentDataSource: this.currentDataSource
      },
      dataService: this.dataService.getStatistics(),
      scrapingService: this.scrapingService.getStatistics()
    };
  }

  /**
   * Nettoie les ressources de l'application
   * @returns {Promise<void>}
   */
  async cleanup() {
    await this.dataService.close();
    this.scrapingService.cleanup();
    this.isInitialized = false;
  }
}

// Export de la classe principale et des modèles pour usage externe
export {
  FDJApp as default,
  Draw,
  Prediction,
  DataSource,
  ScrapingService,
  DataService
};

// Instance globale pour compatibilité avec l'ancien code
let globalApp = null;

/**
 * Obtient l'instance globale de l'application
 * @param {Object} config - Configuration
 * @returns {FDJApp} Instance de l'application
 */
export function getApp(config = {}) {
  if (!globalApp) {
    globalApp = new FDJApp(config);
  }
  return globalApp;
}

/**
 * Initialise l'application globale
 * @param {Object} config - Configuration
 * @returns {Promise<FDJApp>} Instance initialisée
 */
export async function initializeApp(config = {}) {
  const app = getApp(config);
  await app.initialize();
  return app;
}