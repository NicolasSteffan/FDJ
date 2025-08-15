import { MISTRAL_CONFIG, validateApiKey } from '../../config/api-keys.js';

/**
 * Service pour interagir avec l'API Mistral AI
 */
class MistralService {
  constructor() {
    this.config = MISTRAL_CONFIG;
    this.baseUrl = 'https://api.mistral.ai/v1';
    this.isInitialized = false;
  }

  /**
   * Initialise le service avec validation de la clé API
   */
  async initialize() {
    try {
      validateApiKey(this.config.apiKey, 'mistral');
      this.isInitialized = true;
      console.log('✅ Service Mistral initialisé avec succès');
    } catch (error) {
      console.error('❌ Erreur initialisation Mistral:', error.message);
      throw error;
    }
  }

  /**
   * Effectue une requête vers l'API Mistral
   * @param {string} prompt - Le prompt à envoyer
   * @param {Object} options - Options de configuration
   * @returns {Promise<Object>} Réponse de l'API
   */
  async generateResponse(prompt, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const model = options.model || this.config.defaultModel;
    const params = { ...this.config.defaultParams, ...options };

    const requestBody = {
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: params.temperature,
      max_tokens: params.max_tokens,
      top_p: params.top_p
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Erreur API Mistral: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        content: data.choices[0]?.message?.content,
        model: data.model,
        usage: data.usage,
        fullResponse: data
      };

    } catch (error) {
      console.error('❌ Erreur requête Mistral:', error);
      return {
        success: false,
        error: error.message,
        content: null
      };
    }
  }

  /**
   * Analyse les données de tirage et génère des prédictions
   * @param {Array} draws - Historique des tirages
   * @returns {Promise<Object>} Prédictions générées
   */
  async analyzeDraws(draws) {
    const prompt = `
    Analyse les données de tirage EuroMillions suivantes et génère des prédictions statistiques :
    
    Historique des tirages :
    ${JSON.stringify(draws, null, 2)}
    
    Génère une analyse avec :
    1. Tendances observées
    2. Numéros les plus fréquents
    3. Combinaisons recommandées
    4. Niveau de confiance
    
    Réponds en JSON structuré.
    `;

    return await this.generateResponse(prompt, {
      temperature: 0.3, // Plus déterministe pour l'analyse
      max_tokens: 2000
    });
  }

  /**
   * Génère des prédictions pour le prochain tirage
   * @param {Array} historicalData - Données historiques
   * @returns {Promise<Object>} Prédictions
   */
  async predictNextDraw(historicalData) {
    const prompt = `
    Basé sur l'historique des tirages EuroMillions, prédit les numéros pour le prochain tirage.
    
    Règles :
    - 5 numéros entre 1 et 50
    - 2 étoiles entre 1 et 12
    - Analyse les patterns historiques
    
    Données historiques :
    ${JSON.stringify(historicalData, null, 2)}
    
    Réponds avec un JSON contenant :
    {
      "prediction": {
        "numbers": [num1, num2, num3, num4, num5],
        "stars": [star1, star2]
      },
      "confidence": 0.85,
      "reasoning": "explication de la prédiction"
    }
    `;

    return await this.generateResponse(prompt, {
      temperature: 0.5,
      max_tokens: 1500
    });
  }

  /**
   * Teste la connexion à l'API
   * @returns {Promise<boolean>} Statut de la connexion
   */
  async testConnection() {
    try {
      const response = await this.generateResponse('Test de connexion - réponds "OK"', {
        max_tokens: 10
      });
      return response.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtient les informations sur les modèles disponibles
   * @returns {Promise<Object>} Liste des modèles
   */
  async getModels() {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur récupération modèles: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        models: data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default MistralService;


